import { supabase } from "@/integrations/supabase/client";

let sessionStartTime: number | null = null;
let lastActivityTime: number | null = null;
let timeSpentInterval: NodeJS.Timeout | null = null;

// Generate or retrieve session ID
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem("session_id", sessionId);
  }
  return sessionId;
};

// Get IP address
export const getIPAddress = async (): Promise<string> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return "unknown";
  }
};

// Detect device
export const getDevice = (): string => {
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|iphone|android/i.test(ua)) return "Mobile";
  if (/ipad|tablet/i.test(ua)) return "Tablet";
  return "Desktop";
};

// Get country
export const getCountry = async (ip: string): Promise<string> => {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    return data.country_name || "Unknown";
  } catch {
    return "Unknown";
  }
};

// Track page view
export const trackPageView = async (page: string) => {
  const sessionId = getSessionId();
  const ipAddress = await getIPAddress();
  const country = await getCountry(ipAddress);
  const device = getDevice();

  // Initialize time tracking
  if (!sessionStartTime) {
    sessionStartTime = Date.now();
    lastActivityTime = Date.now();

    // Track time spent - update every 5 seconds
    if (timeSpentInterval) {
      clearInterval(timeSpentInterval);
    }

    timeSpentInterval = setInterval(() => {
      updateTimeSpent(sessionId);
    }, 5000);

    // Track time on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        updateTimeSpent(sessionId);
      } else {
        lastActivityTime = Date.now();
      }
    });

    // Track time before unload
    window.addEventListener('beforeunload', () => {
      updateTimeSpent(sessionId);
    });
  }

  // Check if session already exists
  const { data: existing } = await supabase
    .from("analytics")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existing) {
    // Update existing session
    await supabase
      .from("analytics")
      .update({
        page_views: (existing.page_views || 0) + 1,
      })
      .eq("session_id", sessionId);
  } else {
    // Create new session
    await supabase.from("analytics").insert({
      session_id: sessionId,
      ip_address: ipAddress,
      country,
      device,
      source: page,
      page_views: 1,
      clicks: 0,
      related_searches: 0,
      result_clicks: 0,
      unique_clicks: 0,
    });
  }
};

const updateTimeSpent = async (sessionId: string) => {
  if (!lastActivityTime || !sessionStartTime) return;

  const currentTime = Date.now();
  const timeSpent = Math.floor((currentTime - sessionStartTime) / 1000); // in seconds

  try {
    await (supabase as any)
      .from('analytics')
      .update({ time_spent: timeSpent })
      .eq('session_id', sessionId);
  } catch (error) {
    console.error('Error updating time spent:', error);
  }
};

// Track click with search term
export const trackClick = async (
  type: "related_search" | "result",
  searchTerm: string,
  targetUrl: string
) => {
  const sessionId = getSessionId();
  const ipAddress = await getIPAddress();
  const country = await getCountry(ipAddress);
  const device = getDevice();

  try {
    // Insert into click_events table
    await (supabase as any).from("click_events").insert({
      session_id: sessionId,
      event_type: type,
      search_term: searchTerm,
      target_url: targetUrl,
      ip_address: ipAddress,
      country,
      device,
    });

    // Get existing analytics record
    const { data: existing } = await supabase
      .from("analytics")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (existing) {
      // Calculate unique clicks (count distinct target URLs)
      const { data: uniqueTargets } = await (supabase as any)
        .from("click_events")
        .select("target_url")
        .eq("session_id", sessionId);

      const uniqueCount = new Set(
        uniqueTargets?.map((t: any) => t.target_url) || []
      ).size;

      // Update analytics with incremented counters
      const updateData: any = {
        clicks: (existing.clicks || 0) + 1,
        unique_clicks: uniqueCount,
      };

      if (type === "related_search") {
        updateData.related_searches = (existing.related_searches || 0) + 1;
      } else {
        updateData.result_clicks = (existing.result_clicks || 0) + 1;
      }

      await supabase
        .from("analytics")
        .update(updateData)
        .eq("session_id", sessionId);
    }
  } catch (error) {
    console.error("Error tracking click:", error);
  }
};