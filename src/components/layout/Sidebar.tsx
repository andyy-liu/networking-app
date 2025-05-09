import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/icons/Logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Bell,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  Home,
  ClipboardList,
} from "lucide-react";
import { ContactGroup } from "@/lib/types";
import { supabase } from "@/lib/client";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  path?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [contactGroups, setContactGroups] = useState<ContactGroup[]>([]);

  const navItems: NavItem[] = [
    {
      icon: Home,
      label: "Contacts",
      isActive: location.pathname === "/",
      path: "/",
    },
    {
      icon: ClipboardList,
      label: "Todos",
      isActive: location.pathname === "/todos",
      path: "/todos",
    },
    {
      icon: Users,
      label: "Groups",
      isActive: location.pathname.startsWith("/groups"),
      path: "/groups",
    },
    {
      icon: Settings,
      label: "Settings",
      isActive: location.pathname === "/settings",
      path: "/settings",
    },
  ];

  useEffect(() => {
    if (user) {
      fetchContactGroups();
    } else {
      setContactGroups([]);
    }
  }, [user]);

  const fetchContactGroups = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("contact_groups")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      const transformedGroups: ContactGroup[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        userId: item.user_id,
        createdAt: item.created_at,
      }));

      setContactGroups(transformedGroups);
    } catch (error) {
      console.error("Error fetching contact groups:", error);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavigation = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  const isGroupActive = (groupId: string) => {
    return location.pathname === `/groups/${groupId}`;
  };

  return (
    <div
      className={`${className} relative bg-white dark:bg-gray-900 h-screen shadow-sm flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && <Logo />}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 bg-white dark:bg-gray-900 rounded-full shadow-sm border z-10"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>
      <Separator />
      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation(item.path);
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 ${
                item.isActive
                  ? "bg-gray-100 dark:bg-gray-800 text-primary"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <item.icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Contact Groups Section */}
        {contactGroups.length > 0 && (
          <div className="mt-6">
            {!isCollapsed && (
              <div className="px-3 mb-2">
                <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                  Contact Groups
                </h3>
              </div>
            )}
            <nav className="px-2 space-y-1">
              {contactGroups.map((group) => (
                <a
                  key={group.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(`/groups/${group.id}`);
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 ${
                    isGroupActive(group.id)
                      ? "bg-gray-100 dark:bg-gray-800 text-primary"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Users size={20} />
                  {!isCollapsed && <span>{group.name}</span>}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
      <div className="p-4">
        {!isCollapsed && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Made with ❤️ by{" "}
            <a
              href="https://www.linkedin.com/in/aliu24/"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Andy Liu
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
