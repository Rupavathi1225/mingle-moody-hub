import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface WebResult {
  id: string;
  title: string;
  description: string | null;
  target_url: string;
}

interface PreLandingPage {
  id: string;
  page_key: string;
  headline: string;
  description: string | null;
  logo_url: string | null;
  logo_position: string | null;
  main_image_url: string | null;
  background_color: string | null;
  background_image_url: string | null;
  cta_text: string | null;
  target_url: string;
}

export default function PrelanderAdmin() {
  const [webResults, setWebResults] = useState<WebResult[]>([]);
  const [preLandingPages, setPreLandingPages] = useState<PreLandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedWebResult, setSelectedWebResult] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPosition, setLogoPosition] = useState("top-center");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [buttonText, setButtonText] = useState("Visit Now");
  const [destinationUrl, setDestinationUrl] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: results } = await supabase
        .from("web_results")
        .select("id, title, description, target_url")
        .eq("is_active", true)
        .order("page_number, position");

      const { data: pages } = await supabase
        .from("pre_landing_pages")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      setWebResults(results || []);
      setPreLandingPages(pages || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedWebResult("");
    setHeadline("");
    setDescription("");
    setLogoUrl("");
    setLogoPosition("top-center");
    setMainImageUrl("");
    setBackgroundColor("#ffffff");
    setBackgroundImageUrl("");
    setButtonText("Visit Now");
    setDestinationUrl("");
  };

  const handleSave = async () => {
    if (!selectedWebResult || !headline || !destinationUrl) {
      toast.error("Please fill in Web Result, Headline, and Destination URL");
      return;
    }

    setSaving(true);
    try {
      const pageKey = `prelander_${Date.now()}`;
      
      const { error } = await supabase
        .from("pre_landing_pages")
        .insert({
          page_key: pageKey,
          headline,
          description,
          logo_url: logoUrl || null,
          logo_position: logoPosition,
          main_image_url: mainImageUrl || null,
          background_color: backgroundColor,
          background_image_url: backgroundImageUrl || null,
          cta_text: buttonText,
          target_url: destinationUrl,
          is_active: true,
        });

      if (error) throw error;

      await supabase
        .from("web_results")
        .update({ pre_landing_page_key: pageKey })
        .eq("id", selectedWebResult);

      toast.success("Pre-landing page saved successfully!");
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save pre-landing page");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("pre_landing_pages")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;

      toast.success("Pre-landing page deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Teja Starin - Pre-Landing Pages</h1>
        <p className="text-muted-foreground">Manage all your site-level Pre-Landing Pages</p>
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Add Pre-Landing Page</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="webResult">
              Web Result <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedWebResult} onValueChange={setSelectedWebResult}>
              <SelectTrigger>
                <SelectValue placeholder="Select web result" />
              </SelectTrigger>
              <SelectContent>
                {webResults.map((result) => (
                  <SelectItem key={result.id} value={result.id}>
                    {result.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="headline">
              Headline <span className="text-destructive">*</span>
            </Label>
            <Input
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Enter headline"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="logoPosition">Logo Position</Label>
            <Select value={logoPosition} onValueChange={setLogoPosition}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-center">Top Center</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="mainImageUrl">Main Image URL</Label>
            <Input
              id="mainImageUrl"
              value={mainImageUrl}
              onChange={(e) => setMainImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="backgroundColor">Background Color</Label>
            <Input
              id="backgroundColor"
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="backgroundImageUrl">Background Image URL</Label>
            <Input
              id="backgroundImageUrl"
              value={backgroundImageUrl}
              onChange={(e) => setBackgroundImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="buttonText">Button Text</Label>
            <Input
              id="buttonText"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="Visit Now"
            />
          </div>

          <div>
            <Label htmlFor="destinationUrl">
              Destination URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="destinationUrl"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Pre-Landing Page"
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Pre-Landing Pages</h2>
        
        {preLandingPages.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No pre-landing pages yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Headline</TableHead>
                <TableHead>Target URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preLandingPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.headline}</TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-xs">
                    {page.target_url}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(page.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
