import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PreLandingPage {
  id: string;
  page_key: string;
  headline: string;
  description: string | null;
  logo_url: string | null;
  logo_position: string | null;
  logo_width: number | null;
  main_image_url: string | null;
  image_ratio: string | null;
  background_color: string | null;
  background_image_url: string | null;
  cta_text: string | null;
  cta_color: string | null;
  target_url: string;
}

export default function Prelander() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageData, setPageData] = useState<PreLandingPage | null>(null);

  const pageKey = searchParams.get("key");
  const webResultId = searchParams.get("id");

  useEffect(() => {
    if (!pageKey && !webResultId) {
      toast.error("Invalid page link");
      navigate("/");
      return;
    }

    fetchPageData();
  }, [pageKey, webResultId, navigate]);

  const fetchPageData = async () => {
    try {
      if (pageKey) {
        const { data, error } = await supabase
          .from("pre_landing_pages")
          .select("*")
          .eq("page_key", pageKey)
          .eq("is_active", true)
          .single();

        if (error) throw error;
        setPageData(data);
      } else if (webResultId) {
        const { data: webResult, error: wrError } = await supabase
          .from("web_results")
          .select("pre_landing_page_key")
          .eq("id", webResultId)
          .single();

        if (wrError) throw wrError;

        if (webResult.pre_landing_page_key) {
          const { data, error } = await supabase
            .from("pre_landing_pages")
            .select("*")
            .eq("page_key", webResult.pre_landing_page_key)
            .eq("is_active", true)
            .single();

          if (error) throw error;
          setPageData(data);
        } else {
          toast.error("No pre-landing page configured");
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Error fetching page:", error);
      toast.error("Failed to load page");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !pageData) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("email_captures")
        .insert({
          email: email.trim().toLowerCase(),
          page_key: pageData.page_key,
          country: "Unknown",
          source: "prelander",
        });

      if (error) throw error;

      toast.success("Thank you! Redirecting...");

      setTimeout(() => {
        window.location.href = pageData.target_url;
      }, 1000);
    } catch (error) {
      console.error("Error saving email:", error);
      toast.error("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!pageData) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: pageData.background_color || "#ffffff",
        backgroundImage: pageData.background_image_url ? `url(${pageData.background_image_url})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-2xl relative">
        {/* Logo */}
        {pageData.logo_url && (
          <div
            className={`absolute top-0 ${
              pageData.logo_position === "top-center" ? "left-1/2 -translate-x-1/2" : "left-0"
            }`}
          >
            <img
              src={pageData.logo_url}
              alt="Logo"
              style={{ width: `${pageData.logo_width || 150}px`, height: "auto" }}
            />
          </div>
        )}

        <div className="pt-24 space-y-8">
          {/* Main Image */}
          {pageData.main_image_url && (
            <div className="w-full overflow-hidden rounded-lg">
              <img
                src={pageData.main_image_url}
                alt="Main"
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Headline */}
          <h1 className="text-4xl font-bold text-center leading-tight">
            {pageData.headline}
          </h1>

          {/* Description */}
          {pageData.description && (
            <p className="text-lg text-center leading-relaxed">
              {pageData.description}
            </p>
          )}

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
              className="text-center text-lg h-12 border-2 font-semibold placeholder:text-muted-foreground bg-background"
            />
            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                pageData.cta_text || "Visit Now"
              )}
            </Button>
          </form>

          {/* Privacy Notice */}
          <p className="text-xs text-center text-muted-foreground">
            By submitting your email, you agree to receive promotional offers and updates.
          </p>
        </div>
      </div>
    </div>
  );
}
