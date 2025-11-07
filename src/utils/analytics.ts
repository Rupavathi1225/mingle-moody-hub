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
  });
};

// Track click
export const trackClick = async (type: "related_search" | "result") => {
  const sessionId = getSessionId();
  const ipAddress = await getIPAddress();
  const country = await getCountry(ipAddress);
  const device = getDevice();

  const data: any = {
    session_id: sessionId,
    ip_address: ipAddress,
    country,
    device,
    clicks: 1,
  };

  if (type === "related_search") {
    data.related_searches = 1;
  } else {
    data.result_clicks = 1;
  }

  await supabase.from("analytics").insert(data);
};
