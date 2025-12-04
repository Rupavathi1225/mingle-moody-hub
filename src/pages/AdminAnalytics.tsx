import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Analytics, ClickEvent } from "@/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { MousePointer, Eye, Grid3x3, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [clickEvents, setClickEvents] = useState<ClickEvent[]>([]);
  const [stats, setStats] = useState({
    totalPageViews: 0,
    totalClicks: 0,
    uniqueClicks: 0,
    totalRelatedSearches: 0,
    totalResultClicks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAnalytics();
    fetchClickEvents();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await supabase
        .from("analytics")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(200);

      if (data) {
        setAnalytics(data);

        const stats = data.reduce(
          (acc, item: any) => ({
            totalPageViews: acc.totalPageViews + (item.page_views || 0),
            totalClicks: acc.totalClicks + (item.clicks || 0),
            uniqueClicks: acc.uniqueClicks + (item.unique_clicks || 0),
            totalRelatedSearches:
              acc.totalRelatedSearches + (item.related_searches || 0),
            totalResultClicks:
              acc.totalResultClicks + (item.result_clicks || 0),
          }),
          {
            totalPageViews: 0,
            totalClicks: 0,
            uniqueClicks: 0,
            totalRelatedSearches: 0,
            totalResultClicks: 0,
          }
        );

        setStats(stats);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClickEvents = async () => {
    try {
      const { data } = await (supabase as any)
        .from("click_events")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (data) {
        setClickEvents(data as ClickEvent[]);
      }
    } catch (error) {
      console.error("Error fetching click events:", error);
    }
  };

  const getSessionClickEvents = (sessionId: string) => {
    return clickEvents.filter(event => event.session_id === sessionId);
  };

  const getRelatedSearchBreakdown = (sessionId: string) => {
    const events = getSessionClickEvents(sessionId).filter(e => e.event_type === 'related_search');
    const breakdown = new Map<string, { total: number; unique: number }>();
    
    events.forEach(event => {
      const term = event.search_term || 'Unknown';
      if (!breakdown.has(term)) {
        breakdown.set(term, { total: 0, unique: 0 });
      }
      const current = breakdown.get(term)!;
      current.total += 1;
    });

    events.forEach(event => {
      const term = event.search_term || 'Unknown';
      const uniqueTargets = new Set(
        events.filter(e => e.search_term === term).map(e => e.target_url)
      );
      breakdown.get(term)!.unique = uniqueTargets.size;
    });

    return Array.from(breakdown.entries()).map(([term, stats]) => ({
      term,
      ...stats
    }));
  };

  const getResultClickBreakdown = (sessionId: string) => {
    const events = getSessionClickEvents(sessionId).filter(e => e.event_type === 'result');
    const breakdown = new Map<string, { total: number; unique: number }>();
    
    events.forEach(event => {
      const url = event.target_url || 'Unknown';
      if (!breakdown.has(url)) {
        breakdown.set(url, { total: 0, unique: 1 });
      } else {
        const current = breakdown.get(url)!;
        current.total += 1;
      }
    });

    return Array.from(breakdown.entries()).map(([url, stats]) => ({
      url,
      total: stats.total || 1,
      unique: 1
    }));
  };

  const toggleSession = (sessionId: string, type: 'related' | 'result') => {
    const key = `${sessionId}-${type}`;
    setExpandedSessions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: number;
  }) => (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <AdminLayout title="Session Analytics">
      <div className="max-w-7xl">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={Eye} label="Page Views" value={stats.totalPageViews} />
          <StatCard icon={MousePointer} label="Total Clicks" value={stats.totalClicks} />
          <StatCard icon={MousePointer} label="Unique Clicks" value={stats.uniqueClicks} />
          <StatCard icon={Grid3x3} label="Related Searches" value={stats.totalRelatedSearches} />
          <StatCard icon={ExternalLink} label="Result Clicks" value={stats.totalResultClicks} />
        </div>

        {/* Session Analytics Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Session Analytics</h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-primary">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Session ID</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead className="text-right">Page Views</TableHead>
                    <TableHead className="text-right">Total Clicks</TableHead>
                    <TableHead className="text-right">Unique Clicks</TableHead>
                    <TableHead className="text-right">Related Searches</TableHead>
                    <TableHead className="text-right">Result Clicks</TableHead>
                    <TableHead className="text-right">Time Spent</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {analytics.map((item) => {
                    const relatedSearchBreakdown = getRelatedSearchBreakdown(item.session_id);
                    const resultClickBreakdown = getResultClickBreakdown(item.session_id);
                    const relatedExpanded = expandedSessions[`${item.session_id}-related`];
                    const resultExpanded = expandedSessions[`${item.session_id}-result`];

                    return (
                      <TableRow key={item.id} className="border-border">
                        <TableCell className="font-mono text-xs">
                          {item.session_id.substring(0, 12)}...
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {item.ip_address}
                        </TableCell>
                        <TableCell>{item.country || "-"}</TableCell>
                        <TableCell className="text-xs">{item.source || "-"}</TableCell>
                        <TableCell>{item.device || "-"}</TableCell>
                        <TableCell className="text-right">{item.page_views}</TableCell>
                        <TableCell className="text-right">{item.clicks}</TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-primary">
                            {item.unique_clicks || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          {relatedSearchBreakdown.length > 0 ? (
                            <div className="space-y-2">
                              <div className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 px-3 py-2 rounded-lg text-center">
                                <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                                  Total: {item.related_searches}
                                </span>
                              </div>
                              <Collapsible>
                                <CollapsibleTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                    onClick={() => toggleSession(item.session_id, 'related')}
                                  >
                                    {relatedExpanded ? (
                                      <>
                                        <ChevronUp className="w-3 h-3 mr-1" />
                                        Hide breakdown
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="w-3 h-3 mr-1" />
                                        View breakdown
                                      </>
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-2 mt-2">
                                  {relatedSearchBreakdown.map((item, idx) => (
                                    <div key={idx} className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 p-2 rounded text-xs">
                                      <div className="font-medium text-green-700 dark:text-green-300">{item.term}</div>
                                      <div className="text-green-600 dark:text-green-400">
                                        Unique: {item.unique} | Total: {item.total}
                                      </div>
                                    </div>
                                  ))}
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {resultClickBreakdown.length > 0 ? (
                            <div className="space-y-2">
                              <div className="bg-orange-100 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 px-3 py-2 rounded-lg text-center">
                                <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                                  Total: {item.result_clicks}
                                </span>
                              </div>
                              <Collapsible>
                                <CollapsibleTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                    onClick={() => toggleSession(item.session_id, 'result')}
                                  >
                                    {resultExpanded ? (
                                      <>
                                        <ChevronUp className="w-3 h-3 mr-1" />
                                        Hide breakdown
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="w-3 h-3 mr-1" />
                                        View breakdown
                                      </>
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-2 mt-2">
                                  {resultClickBreakdown.map((item, idx) => (
                                    <div key={idx} className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 p-2 rounded text-xs">
                                      <div className="font-medium text-orange-700 dark:text-orange-300 truncate max-w-[150px]">
                                        {item.url}
                                      </div>
                                      <div className="text-orange-600 dark:text-orange-400">
                                        Unique: {item.unique} | Total: {item.total}
                                      </div>
                                    </div>
                                  ))}
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.time_spent ? `${Math.floor(item.time_spent / 60)}m ${item.time_spent % 60}s` : "-"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(item.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
