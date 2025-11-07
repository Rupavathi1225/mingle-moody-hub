import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    webresult_page: "",
    serial_number: 1,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("serial_number", { ascending: true });

      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await supabase
          .from("categories")
          .update(formData)
          .eq("id", editingCategory.id);
        toast.success("Category updated successfully");
      } else {
        await supabase.from("categories").insert(formData);
        toast.success("Category created successfully");
      }
      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({ title: "", webresult_page: "", serial_number: 1 });
      fetchCategories();
    } catch (error) {
      toast.error("Error saving category");
      console.error(error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      title: category.title,
      webresult_page: category.webresult_page,
      serial_number: category.serial_number,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await supabase.from("categories").delete().eq("id", id);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error("Error deleting category");
      console.error(error);
    }
  };

  const handleNew = () => {
    setEditingCategory(null);
    setFormData({ title: "", webresult_page: "", serial_number: categories.length + 1 });
    setIsDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <main className="flex-1">
          <header className="h-12 flex items-center border-b border-border px-4">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-xl font-bold text-primary">Categories Editor</h1>
          </header>

          <div className="p-8">
            <div className="max-w-4xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Related Search Categories</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleNew} className="bg-primary text-primary-foreground">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">
                        {editingCategory ? "Edit Category" : "Add New Category"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          placeholder="Category title"
                          className="bg-background border-border"
                        />
                      </div>
                      <div>
                        <Label>Web Result Page</Label>
                        <Input
                          value={formData.webresult_page}
                          onChange={(e) =>
                            setFormData({ ...formData, webresult_page: e.target.value })
                          }
                          placeholder="e.g., wr=1"
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
                      <Button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground">
                        {editingCategory ? "Update" : "Create"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {loading ? (
                <div className="text-primary">Loading...</div>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-card p-4 rounded-lg border border-border flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground font-mono">
                            #{category.serial_number}
                          </span>
                          <h3 className="font-semibold text-foreground">{category.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Page: {category.webresult_page}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(category)}
                          className="border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(category.id)}
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

export default AdminCategories;
