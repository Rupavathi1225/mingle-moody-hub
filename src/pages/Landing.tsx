import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LandingPage, Category } from "@/types/database";
import { trackPageView, trackClick } from "@/utils/analytics";
import { Button } from "@/components/ui/button";

const Landing = () => {
  const navigate = useNavigate();
  const [landingData, setLandingData] = useState<LandingPage | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    trackPageView("landing");
  }, []);

  const fetchData = async () => {
    try {
      // Fetch landing page content
      const { data: lpData } = await supabase
        .from("landing_page")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fetch categories sorted by serial number
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .order("serial_number", { ascending: true });

      setLandingData(lpData);
      setCategories(catData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (webresultPage: string) => {
    trackClick("related_search");
    navigate(`/webresult?${webresultPage}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Minglemoody</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin")}
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            Admin
          </Button>
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
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.webresult_page)}
              className="p-6 bg-card border border-border rounded-lg hover:border-primary transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] text-left group"
            >
              <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {category.title}
              </h4>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
