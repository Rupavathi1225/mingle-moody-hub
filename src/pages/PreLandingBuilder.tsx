import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Monitor, Smartphone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PreLandingConfig {
  logo: string | null;
  logoPosition: "top-left" | "top-center";
  logoSize: number;
  mainImage: string | null;
  imageRatio: "16:9" | "1:1" | "4:3";
  headline: string;
  description: string;
  headlineFontSize: number;
  headlineColor: string;
  headlineAlign: "left" | "center" | "right";
  descriptionFontSize: number;
  descriptionColor: string;
  ctaButtonText: string;
  ctaButtonColor: string;
  backgroundColor: string;
  backgroundImage: string | null;
}

export default function PreLandingBuilder() {
  const [webResults, setWebResults] = useState<any[]>([]);
  const [selectedWebResultId, setSelectedWebResultId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [config, setConfig] = useState<PreLandingConfig>({
    logo: null,
    logoPosition: "top-center",
    logoSize: 120,
    mainImage: null,
    imageRatio: "16:9",
    headline: "Your Headline Here",
    description: "Your description goes here. Tell your visitors what makes your offer special.",
    headlineFontSize: 48,
    headlineColor: "#000000",
    headlineAlign: "center",
    descriptionFontSize: 18,
    descriptionColor: "#666666",
    ctaButtonText: "Continue to Offer",
    ctaButtonColor: "#000000",
    backgroundColor: "#ffffff",
    backgroundImage: null,
  });

  const [email, setEmail] = useState("");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    fetchWebResults();
  }, []);

  useEffect(() => {
    if (selectedWebResultId) {
      loadConfig();
    }
  }, [selectedWebResultId]);

  const fetchWebResults = async () => {
    try {
      const { data, error } = await supabase
        .from("web_results")
        .select("id, title, offer_name")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWebResults(data || []);
    } catch (error) {
      console.error("Error fetching web results:", error);
      toast.error("Failed to load web results");
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("prelander_configs")
        .select("*")
        .eq("web_result_id", selectedWebResultId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig({
          logo: data.logo_url,
          logoPosition: data.logo_position as any,
          logoSize: parseInt(data.logo_size) || 120,
          mainImage: data.main_image_url,
          imageRatio: data.image_ratio as any,
          headline: data.headline || "Your Headline Here",
          description: data.description || "Your description goes here.",
          headlineFontSize: parseInt(data.headline_size) || 48,
          headlineColor: data.headline_color || "#000000",
          headlineAlign: data.text_align as any,
          descriptionFontSize: parseInt(data.description_size) || 18,
          descriptionColor: data.description_color || "#666666",
          ctaButtonText: data.cta_text || "Continue to Offer",
          ctaButtonColor: data.cta_bg_color || "#000000",
          backgroundColor: data.bg_color || "#ffffff",
          backgroundImage: data.bg_image_url,
        });
        toast.success("Configuration loaded");
      }
    } catch (error) {
      console.error("Error loading config:", error);
      toast.error("Failed to load configuration");
    }
  };

  const uploadImageToStorage = async (file: File, type: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('prelander-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('prelander-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.loading("Uploading logo...");
      const url = await uploadImageToStorage(file, 'logo');
      if (url) {
        setConfig({ ...config, logo: url });
        toast.success("Logo uploaded successfully");
      }
    }
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.loading("Uploading main image...");
      const url = await uploadImageToStorage(file, 'main');
      if (url) {
        setConfig({ ...config, mainImage: url });
        toast.success("Main image uploaded successfully");
      }
    }
  };

  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.loading("Uploading background image...");
      const url = await uploadImageToStorage(file, 'background');
      if (url) {
        setConfig({ ...config, backgroundImage: url });
        toast.success("Background image uploaded successfully");
      }
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success(`Email captured: ${email}`);
      setEmail("");
    }
  };

  const handleSave = async () => {
    if (!selectedWebResultId) {
      toast.error("Please select a web result first");
      return;
    }

    setSaving(true);

    try {
      const configData = {
        web_result_id: selectedWebResultId,
        logo_url: config.logo,
        logo_position: config.logoPosition,
        logo_size: config.logoSize.toString(),
        main_image_url: config.mainImage,
        image_ratio: config.imageRatio,
        headline: config.headline,
        description: config.description,
        headline_size: config.headlineFontSize.toString(),
        headline_color: config.headlineColor,
        description_size: config.descriptionFontSize.toString(),
        description_color: config.descriptionColor,
        text_align: config.headlineAlign,
        cta_text: config.ctaButtonText,
        cta_color: "#000000",
        cta_bg_color: config.ctaButtonColor,
        bg_type: config.backgroundImage ? "image" : "color",
        bg_color: config.backgroundColor,
        bg_image_url: config.backgroundImage,
      };

      const { error } = await supabase
        .from("prelander_configs")
        .upsert(configData, {
          onConflict: "web_result_id",
        });

      if (error) throw error;

      toast.success("Pre-landing page configuration saved!");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const getImageRatioClass = () => {
    switch (config.imageRatio) {
      case "16:9":
        return "aspect-video";
      case "1:1":
        return "aspect-square";
      case "4:3":
        return "aspect-[4/3]";
      default:
        return "aspect-video";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Pre-Landing Page Builder</h1>

        {/* Web Result Selector */}
        <Card className="p-6 mb-6">
          <div className="space-y-2">
            <Label htmlFor="webResult">Select Web Result / Offer</Label>
            <Select value={selectedWebResultId} onValueChange={setSelectedWebResultId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a web result to customize" />
              </SelectTrigger>
              <SelectContent>
                {webResults.map((result) => (
                  <SelectItem key={result.id} value={result.id}>
                    {result.offer_name || result.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Builder Panel */}
          <Card className="p-6">
            <Tabs defaultValue="content">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div>
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    value={config.headline}
                    onChange={(e) => setConfig({ ...config, headline: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={config.description}
                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="ctaButton">CTA Button Text</Label>
                  <Input
                    id="ctaButton"
                    value={config.ctaButtonText}
                    onChange={(e) => setConfig({ ...config, ctaButtonText: e.target.value })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="design" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="headlineFontSize">Headline Font Size (px)</Label>
                    <Input
                      id="headlineFontSize"
                      type="number"
                      value={config.headlineFontSize}
                      onChange={(e) => setConfig({ ...config, headlineFontSize: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="headlineColor">Headline Color</Label>
                    <Input
                      id="headlineColor"
                      type="color"
                      value={config.headlineColor}
                      onChange={(e) => setConfig({ ...config, headlineColor: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="headlineAlign">Headline Alignment</Label>
                  <Select
                    value={config.headlineAlign}
                    onValueChange={(value: any) => setConfig({ ...config, headlineAlign: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="descriptionFontSize">Description Font Size (px)</Label>
                    <Input
                      id="descriptionFontSize"
                      type="number"
                      value={config.descriptionFontSize}
                      onChange={(e) => setConfig({ ...config, descriptionFontSize: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="descriptionColor">Description Color</Label>
                    <Input
                      id="descriptionColor"
                      type="color"
                      value={config.descriptionColor}
                      onChange={(e) => setConfig({ ...config, descriptionColor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ctaButtonColor">CTA Button Color</Label>
                    <Input
                      id="ctaButtonColor"
                      type="color"
                      value={config.ctaButtonColor}
                      onChange={(e) => setConfig({ ...config, ctaButtonColor: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={config.backgroundColor}
                      onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <div>
                  <Label htmlFor="logo">Logo Upload</Label>
                  <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} />
                </div>

                <div>
                  <Label htmlFor="logoPosition">Logo Position</Label>
                  <Select
                    value={config.logoPosition}
                    onValueChange={(value: any) => setConfig({ ...config, logoPosition: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-center">Top Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="logoSize">Logo Size (px)</Label>
                  <Input
                    id="logoSize"
                    type="number"
                    value={config.logoSize}
                    onChange={(e) => setConfig({ ...config, logoSize: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="mainImage">Main Image Upload</Label>
                  <Input id="mainImage" type="file" accept="image/*" onChange={handleMainImageUpload} />
                </div>

                <div>
                  <Label htmlFor="imageRatio">Image Aspect Ratio</Label>
                  <Select
                    value={config.imageRatio}
                    onValueChange={(value: any) => setConfig({ ...config, imageRatio: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                      <SelectItem value="1:1">1:1 (Square)</SelectItem>
                      <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="backgroundImage">Background Image (Optional)</Label>
                  <Input id="backgroundImage" type="file" accept="image/*" onChange={handleBackgroundImageUpload} />
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex gap-3">
              <Button 
                onClick={handleSave} 
                className="flex-1" 
                disabled={!selectedWebResultId || saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Configuration"
                )}
              </Button>
            </div>
          </Card>

          {/* Preview Panel */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Preview</h2>
              <div className="flex gap-2">
                <Button
                  variant={previewMode === "desktop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("desktop")}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewMode === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("mobile")}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div
                className={`${previewMode === "mobile" ? "max-w-[375px] mx-auto" : "w-full"} transition-all duration-300`}
              >
                <div
                  className="min-h-[600px] p-8 relative"
                  style={{
                    backgroundColor: config.backgroundColor,
                    backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Logo */}
                  {config.logo && (
                    <div
                      className={`absolute top-6 ${
                        config.logoPosition === "top-center" ? "left-1/2 -translate-x-1/2" : "left-6"
                      }`}
                    >
                      <img
                        src={config.logo}
                        alt="Logo"
                        style={{ width: config.logoSize, height: "auto" }}
                      />
                    </div>
                  )}

                  {/* Main Content */}
                  <div className="max-w-2xl mx-auto pt-24 space-y-8">
                    {/* Main Image */}
                    {config.mainImage && (
                      <div className={`${getImageRatioClass()} w-full overflow-hidden rounded-lg`}>
                        <img
                          src={config.mainImage}
                          alt="Main"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Headline */}
                    <h1
                      style={{
                        fontSize: config.headlineFontSize,
                        color: config.headlineColor,
                        textAlign: config.headlineAlign,
                      }}
                      className="font-bold leading-tight"
                    >
                      {config.headline}
                    </h1>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: config.descriptionFontSize,
                        color: config.descriptionColor,
                        textAlign: config.headlineAlign,
                      }}
                      className="leading-relaxed"
                    >
                      {config.description}
                    </p>

                    {/* Email Form */}
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        style={{
                          backgroundColor: config.ctaButtonColor,
                          color: "#000000",
                        }}
                      >
                        {config.ctaButtonText}
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
