import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { trackPageView, trackClick } from "@/utils/analytics";

interface LandingPage {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface RelatedSearch {
  id: string;
  search_text: string;
  title: string;
  web_result_page: string;
  position: number;
  pre_landing_page_key: string | null;
  display_order: number;
  allowed_countries: string[] | null;
  is_active: boolean;
  session_id: string | null;
  category_id: string | null;
}

const Landing = () => {
  const navigate = useNavigate();
  const [landingData, setLandingData] = useState<LandingPage | null>(null);
  const [relatedSearches, setRelatedSearches] = useState<RelatedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackPageView("landing");
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch most recent landing page content
      const { data: lpData, error: lpError } = await supabase
        .from("landing_page")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lpError) throw lpError;

      // Fetch related searches
      const { data: rsData, error: rsError } = await supabase
        .from("related_searches")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (rsError) throw rsError;

      setLandingData(lpData);
      setRelatedSearches(rsData || []);
    } catch (error) {
      console.error("Error fetching landing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRelatedSearchClick = async (item: RelatedSearch) => {
    try {
      const targetUrl = `/webresult?${item.web_result_page}`;

      await trackClick("related_search", item.title, targetUrl);

      navigate(targetUrl);
    } catch (error) {
      console.error("Error tracking click:", error);
      navigate(`/webresult?${item.web_result_page}`);
    }
  };

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
          <h1 className="text-2xl font-bold text-primary">Minglemoody</h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold mb-6 text-foreground">
          {landingData?.title || "Welcome to Minglemoody"}
        </h2>

        <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          {landingData?.description ||
            "Discover the best platforms for connecting with people worldwide."}
        </p>
      </section>

      {/* Related Searches */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-2xl font-semibold mb-8 text-foreground text-center">
          Related Searches
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {relatedSearches.map((item) => (
            <button
              key={item.id}
              onClick={() => handleRelatedSearchClick(item)}
              className="p-6 bg-card border border-border rounded-lg 
                         hover:border-primary hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] 
                         transition-all text-left group"
            >
              <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </h4>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
