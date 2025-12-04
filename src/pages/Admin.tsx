import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { LandingPage } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Admin = () => {
  const [landingData, setLandingData] = useState<LandingPage | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await supabase
        .from("landing_page")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setLandingData(data);
        setTitle(data.title);
        setDescription(data.description);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (landingData) {
        await supabase
          .from("landing_page")
          .update({ title, description })
          .eq("id", landingData.id);
        toast.success("Landing page updated successfully");
      }
    } catch (error) {
      toast.error("Error updating landing page");
      console.error(error);
    }
  };

  return (
    <AdminLayout title="Landing Page Editor">
      {loading ? (
        <div className="text-primary">Loading...</div>
      ) : (
        <div className="max-w-4xl space-y-6 bg-card p-6 rounded-lg border border-border">
          <div className="space-y-2">
            <Label htmlFor="title">Hero Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter hero title"
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Hero Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter hero description"
              rows={6}
              className="bg-background border-border"
            />
          </div>

          <Button onClick={handleSave} className="bg-primary text-primary-foreground">
            Save Changes
          </Button>
        </div>
      )}
    </AdminLayout>
  );
};

export default Admin;
