import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Download, Search, Mail } from "lucide-react";
import { format } from "date-fns";

interface EmailCapture {
  id: string;
  email: string;
  captured_at: string;
  session_id: string | null;
  device: string | null;
  country: string | null;
  redirected_to: string | null;
  web_results?: {
    title: string;
    offer_name: string | null;
  };
}

export default function AdminEmails() {
  const [emails, setEmails] = useState<EmailCapture[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<EmailCapture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEmails();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = emails.filter(
        (item) =>
          item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.web_results?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.web_results?.offer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmails(filtered);
    } else {
      setFilteredEmails(emails);
    }
  }, [searchTerm, emails]);

  const fetchEmails = async () => {
    try {
      const { data, error } = await supabase
        .from("email_captures")
        .select(`
          *,
          web_results (
            title,
            offer_name
          )
        `)
        .order("captured_at", { ascending: false });

      if (error) throw error;
      setEmails(data || []);
      setFilteredEmails(data || []);
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast.error("Failed to load email captures");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (filteredEmails.length === 0) {
      toast.error("No emails to export");
      return;
    }

    const headers = ["Email", "Offer", "Date Captured", "Device", "Country", "Redirected To"];
    const rows = filteredEmails.map((item) => [
      item.email,
      item.web_results?.offer_name || item.web_results?.title || "N/A",
      format(new Date(item.captured_at), "PPpp"),
      item.device || "N/A",
      item.country || "N/A",
      item.redirected_to || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-captures-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("CSV exported successfully");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8" />
            Email Captures
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredEmails.length} email{filteredEmails.length !== 1 ? "s" : ""} captured
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or offer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Offer</TableHead>
                <TableHead>Date Captured</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Redirected To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No email captures found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmails.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.email}</TableCell>
                    <TableCell>
                      {item.web_results?.offer_name || item.web_results?.title || "N/A"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(item.captured_at), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>{item.device || "N/A"}</TableCell>
                    <TableCell>{item.country || "N/A"}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.redirected_to ? (
                        <a
                          href={item.redirected_to}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {item.redirected_to}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
