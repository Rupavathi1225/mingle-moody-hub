import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabase } from "@/integrations/supabase/client";
import { WebResult } from "@/types/database";
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

const AdminWebResults = () => {
  const [results, setResults] = useState<WebResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState("wr=1");
  const [editingResult, setEditingResult] = useState<WebResult | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    original_link: "",
    logo_url: "",
    webresult_page: "wr=1",
    is_sponsored: false,
    offer_name: "",
    serial_number: 1,
    access_type: "worldwide" as "worldwide" | "selected_countries",
    allowed_countries: [] as string[],
    backlink_url: "",
    imported_from: "",
  });

  useEffect(() => {
    fetchResults();
  }, [selectedPage]);

  const fetchResults = async () => {
    try {
      const { data } = await supabase
        .from("web_results")
        .select("*")
        .eq("webresult_page", selectedPage)
        .order("serial_number", { ascending: true });

      const typedData = (data || []).map(r => ({
        ...r,
        access_type: r.access_type as "worldwide" | "selected_countries",
        allowed_countries: (r.allowed_countries as any) || []
      }));
      setResults(typedData);
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
        await supabase.from("web_results").insert(formData);
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

  const handleEdit = (result: WebResult) => {
    setEditingResult(result);
    setFormData({
      title: result.title,
      description: result.description,
      original_link: result.original_link,
      logo_url: result.logo_url || "",
      webresult_page: result.webresult_page,
      is_sponsored: result.is_sponsored,
      offer_name: result.offer_name || "",
      serial_number: result.serial_number,
      access_type: result.access_type,
      allowed_countries: result.allowed_countries,
      backlink_url: result.backlink_url || "",
      imported_from: result.imported_from || "",
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
      original_link: "",
      logo_url: "",
      webresult_page: selectedPage,
      is_sponsored: false,
      offer_name: "",
      serial_number: results.length + 1,
      access_type: "worldwide",
      allowed_countries: [],
      backlink_url: "",
      imported_from: "",
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <main className="flex-1">
          <header className="h-12 flex items-center border-b border-border px-4">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-xl font-bold text-primary">Web Results Editor</h1>
          </header>

          <div className="p-8">
            <div className="max-w-6xl">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-foreground">Web Results</h2>
                  <Select value={selectedPage} onValueChange={setSelectedPage}>
                    <SelectTrigger className="w-32 bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <SelectItem key={i} value={`wr=${i}`}>
                          wr={i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

                      {formData.is_sponsored && (
                        <div>
                          <Label>Offer Name</Label>
                          <Input
                            value={formData.offer_name}
                            onChange={(e) =>
                              setFormData({ ...formData, offer_name: e.target.value })
                            }
                            placeholder="Company or offer name"
                            className="bg-background border-border"
                          />
                        </div>
                      )}

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
                        <Label>Original Link (URL)</Label>
                        <Input
                          value={formData.original_link}
                          onChange={(e) =>
                            setFormData({ ...formData, original_link: e.target.value })
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
                        <Label>Serial Number (Position)</Label>
                        <Input
                          type="number"
                          value={formData.serial_number}
                          onChange={(e) =>
                            setFormData({ ...formData, serial_number: parseInt(e.target.value) })
                          }
                          className="bg-background border-border"
                        />
                      </div>

                      <div>
                        <Label>Imported From (Optional)</Label>
                        <Input
                          value={formData.imported_from}
                          onChange={(e) =>
                            setFormData({ ...formData, imported_from: e.target.value })
                          }
                          placeholder="Source website name"
                          className="bg-background border-border"
                        />
                      </div>

                      <div className="border-t border-border pt-4">
                        <h3 className="font-semibold mb-3 text-foreground">Country Access Settings</h3>
                        <Select
                          value={formData.access_type}
                          onValueChange={(value: "worldwide" | "selected_countries") =>
                            setFormData({ ...formData, access_type: value })
                          }
                        >
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="worldwide">Allow Worldwide Access</SelectItem>
                            <SelectItem value="selected_countries">Selected Countries Only</SelectItem>
                          </SelectContent>
                        </Select>

                        {formData.access_type === "selected_countries" && (
                          <>
                            <div className="mt-3">
                              <Label>Allowed Countries (comma-separated)</Label>
                              <Input
                                value={formData.allowed_countries.join(", ")}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    allowed_countries: e.target.value
                                      .split(",")
                                      .map((c) => c.trim()),
                                  })
                                }
                                placeholder="US, UK, CA"
                                className="bg-background border-border"
                              />
                            </div>
                            <div className="mt-3">
                              <Label>Backlink URL (for blocked countries)</Label>
                              <Input
                                value={formData.backlink_url}
                                onChange={(e) =>
                                  setFormData({ ...formData, backlink_url: e.target.value })
                                }
                                placeholder="https://alternative-site.com"
                                className="bg-background border-border"
                              />
                            </div>
                          </>
                        )}
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
                              #{result.serial_number}
                            </span>
                            {result.is_sponsored && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                                Sponsored
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground">{result.title}</h3>
                          {result.offer_name && (
                            <p className="text-sm text-primary">{result.offer_name}</p>
                          )}
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
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminWebResults;
