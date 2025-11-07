export interface LandingPage {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  title: string;
  webresult_page: string;
  serial_number: number;
  created_at: string;
  updated_at: string;
}

export interface WebResult {
  id: string;
  webresult_page: string;
  is_sponsored: boolean;
  offer_name?: string;
  title: string;
  description: string;
  original_link: string;
  logo_url?: string;
  serial_number: number;
  imported_from?: string;
  access_type: 'worldwide' | 'selected_countries';
  allowed_countries: string[];
  backlink_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  id: string;
  session_id: string;
  ip_address: string;
  country?: string;
  source?: string;
  device?: string;
  page_views: number;
  clicks: number;
  related_searches: number;
  result_clicks: number;
  timestamp: string;
}
