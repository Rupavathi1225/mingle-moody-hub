import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutDashboard, FileText, Grid3x3, BarChart3, Mail } from "lucide-react";

const menuItems = [
  {
    title: "Landing Page",
    url: "/admin",
    icon: FileText,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: Grid3x3,
  },
  {
    title: "Web Results",
    url: "/admin/webresults",
    icon: LayoutDashboard,
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Email Captures",
    url: "/admin/emails",
    icon: Mail,
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar className="w-64">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-bold text-lg">
            Admin Panel
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      className={`hover:bg-sidebar-accent ${
                        isActive ? "bg-sidebar-accent text-primary font-medium" : ""
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
