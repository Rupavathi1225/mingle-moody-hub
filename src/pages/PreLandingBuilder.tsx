import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Monitor, Smartphone } from "lucide-react";

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
  const [config, setConfig] = useState<PreLandingConfig>({
    logo: null,
    logoPosition: "top-center",
    logoSize: 120,
    mainImage: null,
    imageRatio: "16:9",
    headline: "Your Headline Here",
    description: "Your description goes here. Tell your visitors what makes your offer special.",
    headlineFontSize: 48,
    headlineColor: "#ffffff",
    headlineAlign: "center",
    descriptionFontSize: 18,
    descriptionColor: "#e5e5e5",
    ctaButtonText: "Get Started",
    ctaButtonColor: "#00ffff",
    backgroundColor: "#0a0a0a",
    backgroundImage: null,
  });

  const [email, setEmail] = useState("");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setConfig({ ...config, logo: event.target?.result as string });
      };
      reader.readAsDataURL(file);
      toast.success("Logo uploaded successfully");
    }
  };

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setConfig({ ...config, mainImage: event.target?.result as string });
      };
      reader.readAsDataURL(file);
      toast.success("Main image uploaded successfully");
    }
  };

  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setConfig({ ...config, backgroundImage: event.target?.result as string });
      };
      reader.readAsDataURL(file);
      toast.success("Background image uploaded successfully");
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success(`Email captured: ${email}`);
      setEmail("");
    }
  };

  const handleSave = () => {
    toast.success("Pre-landing page configuration saved!");
    console.log("Saved config:", config);
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Pre-Landing Page Builder</h1>

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
              <Button onClick={handleSave} className="flex-1">
                Save Configuration
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
