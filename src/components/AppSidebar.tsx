import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  LayoutDashboard,
  MessageSquare,
  Facebook,
  Calculator,
  Building2,
} from "lucide-react";
import kwentechLogo from "@/assets/kwentech.png";

const menuItems = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "properties",
    title: "Properties",
    icon: Home,
    path: "/properties",
  },
  
  {
    id: "ai-lead-reactivation",
    title: "Leads",
    icon: MessageSquare,
    path: "/dashboard/leads",
  },
  {
    id: "fb-intent-curator",
    title: "Matching",
    icon: Facebook,
    path: "/dashboard/fb-intent",
  },
 
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-4 group-data-[collapsible=icon]:justify-center">
          <img 
            src={kwentechLogo} 
            alt="KwenTech Logo" 
            className="h-10 w-auto max-w-[140px] transition-all duration-200 ease-linear group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:max-w-[32px] group-data-[collapsible=icon]:mx-auto" 
          />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden transition-opacity duration-200">
            <span className="font-bold text-sm">KwenTech</span>
            <span className="text-xs text-muted-foreground">Real Estate Platform</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                // More precise active state detection
                let isActive = false;
                // For paths, match exactly or if it's a sub-route
                isActive = location.pathname === item.path || 
                  location.pathname.startsWith(item.path + "/");
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="text-xs text-muted-foreground text-center group-data-[collapsible=icon]:hidden">
          <p>KwenTech</p>
          <p>Real Estate Platform</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

