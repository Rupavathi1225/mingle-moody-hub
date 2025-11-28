import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { trackPageView, trackClick } from "@/utils/analytics";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface WebResult {
  id: string;
  title: string;
  description: string;
  target_url: string;
  logo_url: string | null;
  page_number: string;
  position: number;
  pre_landing_page_key: string | null;
  is_active: boolean;
  is_sponsored: boolean;
  created_at: string;
  updated_at: string;
}

const WebResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const wrParam = searchParams.get("wr") || "1";

  const [sponsored, setSponsored] = useState<WebResult[]>([]);
  const [regular, setRegular] = useState<WebResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackPageView(`webresult?wr=${wrParam}`);
    fetchResults();
  }, [wrParam]);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from("web_results")
        .select("*")
        .eq("page_number", wrParam)
        .eq("is_active", true)
        .order("position", { ascending: true });

      if (error) throw error;

      if (data) {
        setSponsored(data.filter((r) => r.is_sponsored));
        setRegular(data.filter((r) => !r.is_sponsored));
      }
    } catch (error) {
      console.error("Error fetching web results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVisit = async (result: WebResult) => {
    try {
      await trackClick("result", result.title, result.target_url);
      navigate(`/prelander?id=${result.id}`);
    } catch (error) {
      console.error("Error tracking result click:", error);
      navigate(`/prelander?id=${result.id}`);
    }
  };

  const ResultCard = ({ result }: { result: WebResult }) => (
    <div className="py-4 border-b border-border last:border-0">
      <div className="flex items-start gap-4">
        {result.logo_url && (
          <img
            src={result.logo_url}
            alt={result.title}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {result.title}
          </h3>

          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
            {result.description}
          </p>

          <Button
            size="sm"
            onClick={() => handleVisit(result)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit Website
          </Button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/landing")}
            className="text-2xl font-bold text-primary hover:opacity-80 transition"
          >
            Minglemoody
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Sponsored Results */}
        {sponsored.length > 0 && (
          <section className="mb-12">
            <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
              Sponsored Results
            </h2>
            <div className="bg-card border border-border rounded-lg p-6">
              {sponsored.map((result) => (
                <ResultCard key={result.id} result={result} />
              ))}
            </div>
          </section>
        )}

        {/* Regular Web Results */}
        {regular.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
              Web Results
            </h2>
            <div>
              {regular.map((result) => (
                <ResultCard key={result.id} result={result} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {sponsored.length === 0 && regular.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No results found for this page.
          </div>
        )}
      </div>
    </div>
  );
};

export default WebResultPage;
