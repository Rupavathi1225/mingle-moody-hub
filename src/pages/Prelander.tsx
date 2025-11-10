import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getDevice, getSessionId } from "@/utils/analytics";

interface WebResult {
  id: string;
  title: string;
  description: string;
  logo_url: string | null;
  original_link: string;
  offer_name: string | null;
}

export default function Prelander() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [webResult, setWebResult] = useState<WebResult | null>(null);

  const resultId = searchParams.get("id");

  useEffect(() => {
    if (!resultId) {
      toast.error("Invalid offer link");
      navigate("/");
      return;
    }

    fetchWebResult();
  }, [resultId, navigate]);

  const fetchWebResult = async () => {
    try {
      const { data, error } = await supabase
        .from("web_results")
        .select("id, title, description, logo_url, original_link, offer_name")
        .eq("id", resultId)
        .single();

      if (error) throw error;

      if (data) {
        setWebResult(data);
      } else {
        toast.error("Offer not found");
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching web result:", error);
      toast.error("Failed to load offer details");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !webResult) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubmitting(true);

    try {
      const sessionId = getSessionId();
      const device = getDevice();
      
      // Get IP and country properly
      const ipAddress = await fetch("https://api.ipify.org?format=json")
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => "unknown");
      
      const country = await fetch(`https://ipapi.co/${ipAddress}/json/`)
        .then(res => res.json())
        .then(data => data.country_name || "Unknown")
        .catch(() => "Unknown");

      // Save email to database
      const { error } = await supabase
        .from("email_captures")
        .insert({
          email: email.trim().toLowerCase(),
          web_result_id: webResult.id,
          session_id: sessionId,
          device: device,
          country: country,
          ip_address: ipAddress,
          redirected_to: webResult.original_link,
        });

      if (error) throw error;

      toast.success("Thank you! Redirecting...");

      // Redirect to the final offer link after a short delay
      setTimeout(() => {
        window.location.href = webResult.original_link;
      }, 1000);
    } catch (error) {
      console.error("Error saving email:", error);
      toast.error("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!webResult) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 space-y-6 bg-white border-border">
        {/* Logo */}
        {webResult.logo_url && (
          <div className="flex justify-center">
            <img
              src={webResult.logo_url}
              alt={webResult.offer_name || webResult.title}
              className="h-20 w-auto object-contain"
            />
          </div>
        )}

        {/* Offer Name/Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {webResult.offer_name || webResult.title}
          </h1>
          <p className="text-gray-600 text-lg">
            {webResult.description}
          </p>
        </div>

        {/* Email Capture Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-8">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-900 block text-center">
              Enter your email to continue
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
              className="text-center text-lg h-12"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Continue to Offer"
            )}
          </Button>
        </form>

        {/* Privacy Notice */}
        <p className="text-xs text-center text-muted-foreground mt-4">
          By submitting your email, you agree to receive promotional offers and updates.
        </p>
      </Card>
    </div>
  );
}
