import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WebResultType {
  id: string;
  title: string;
  description: string | null;
  target_url: string;
  logo_url: string | null;
  page_number: number;
  position: number;
  pre_landing_page_key: string | null;
  is_active: boolean;
  is_sponsored: boolean | null;
  created_at: string;
  updated_at: string;
}

const AdminWebResults = () => {
  const [results, setResults] = useState<WebResultType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState(1);
  const [editingResult, setEditingResult] = useState<WebResultType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_url: "",
    logo_url: "",
    page_number: 1,
    position: 1,
    is_sponsored: false,
  });

  useEffect(() => {
    fetchResults();
  }, [selectedPage]);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from("web_results")
        .select("*")
        .eq("page_number", selectedPage)
        .order("position", { ascending: true });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingResult) {
        await supabase
          .from("web_results")
          .update(formData)
          .eq("id", editingResult.id);
        toast.success("Result updated successfully");
      } else {
        await supabase.from("web_results").insert([formData]);
        toast.success("Result created successfully");
      }
      setIsDialogOpen(false);
      setEditingResult(null);
      resetForm();
      fetchResults();
    } catch (error) {
      toast.error("Error saving result");
      console.error(error);
    }
  };

  const handleEdit = (result: WebResultType) => {
    setEditingResult(result);
    setFormData({
      title: result.title,
      description: result.description || "",
      target_url: result.target_url,
      logo_url: result.logo_url || "",
      page_number: result.page_number,
      position: result.position,
      is_sponsored: result.is_sponsored || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this result?")) return;
    try {
      await supabase.from("web_results").delete().eq("id", id);
      toast.success("Result deleted successfully");
      fetchResults();
    } catch (error) {
      toast.error("Error deleting result");
      console.error(error);
    }
  };

  const handleNew = () => {
    setEditingResult(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      target_url: "",
      logo_url: "",
      page_number: selectedPage,
      position: results.length + 1,
      is_sponsored: false,
    });
  };

  return (
    <AdminLayout title="Web Results">
      <div className="max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <Select value={selectedPage.toString()} onValueChange={(v) => setSelectedPage(parseInt(v))}>
            <SelectTrigger className="w-32 bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((i) => (
                <SelectItem key={i} value={i.toString()}>
                  Page {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNew} className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Result
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {editingResult ? "Edit Web Result" : "Add New Web Result"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sponsored"
                    checked={formData.is_sponsored}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_sponsored: checked as boolean })
                    }
                  />
                  <Label htmlFor="sponsored">Sponsored Result</Label>
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Result title"
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Result description"
                    rows={3}
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <Label>Target URL</Label>
                  <Input
                    value={formData.target_url}
                    onChange={(e) =>
                      setFormData({ ...formData, target_url: e.target.value })
                    }
                    placeholder="https://example.com"
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <Label>Logo URL (Optional)</Label>
                  <Input
                    value={formData.logo_url}
                    onChange={(e) =>
                      setFormData({ ...formData, logo_url: e.target.value })
                    }
                    placeholder="https://example.com/logo.png"
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <Label>Position</Label>
                  <Input
                    type="number"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: parseInt(e.target.value) })
                    }
                    className="bg-background border-border"
                  />
                </div>

                <Button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground">
                  {editingResult ? "Update Result" : "Create Result"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-primary">Loading...</div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-card p-4 rounded-lg border border-border flex items-start justify-between"
              >
                <div className="flex gap-4 items-start flex-1">
                  {result.logo_url && (
                    <img
                      src={result.logo_url}
                      alt={result.title}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-mono">
                        #{result.position}
                      </span>
                      {result.is_sponsored && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                          Sponsored
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground">{result.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {result.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(result)}
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(result.id)}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminWebResults;
