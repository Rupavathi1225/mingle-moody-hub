import { supabase } from "@/integrations/supabase/client";

// Generate or retrieve session ID
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    sessionStorage.setItem("session_id", sessionId);
  }
  return sessionId;
};

// Get IP address (simplified - in production use a proper service)
export const getIPAddress = async (): Promise<string> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return "unknown";
  }
};

// Track page view
export const trackPageView = async (page: string) => {
  const sessionId = getSessionId();
  const ipAddress = await getIPAddress();

  await supabase.from("analytics").insert({
    session_id: sessionId,
    ip_address: ipAddress,
    source: page,
    page_views: 1,
    clicks: 0,
    related_searches: 0,
    result_clicks: 0,
  });
};

// Track click
export const trackClick = async (type: "related_search" | "result") => {
  const sessionId = getSessionId();
  const ipAddress = await getIPAddress();

  const data: any = {
    session_id: sessionId,
    ip_address: ipAddress,
    clicks: 1,
  };

  if (type === "related_search") {
    data.related_searches = 1;
  } else {
    data.result_clicks = 1;
  }

  await supabase.from("analytics").insert(data);
};
