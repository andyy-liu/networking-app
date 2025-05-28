import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  Home,
  ClipboardList,
  Upload,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useContactGroups } from "@/features/contacts/hooks/useContactGroups";

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
  const { data: contactGroups = [] } = useContactGroups();
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
      label: "Reminders",
      isActive: location.pathname.startsWith("/reminders"),
      path: "/reminders",
    },
    {
      icon: Upload,
      label: "Import",
      isActive: location.pathname === "/import",
      path: "/import",
    },
    {
      icon: Settings,
      label: "Settings",
      isActive: location.pathname === "/settings",
      path: "/settings",
    },
  ];

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
      className={`${className} relative bg-slate-100 dark:bg-gray-900 h-screen shadow-sm flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-5 flex items-center justify-between">
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
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="px-2">
          {navItems.map((item) => (
            <a
              key={item.label}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation(item.path);
              }}
              className={`flex items-center text-base gap-2 mb-1 px-4 py-1 rounded-lg duration-150 ${
                item.isActive
                  ? "bg-gray-200 dark:bg-gray-800"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              <item.icon size={14} />
              {!isCollapsed && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Contact Groups Section */}
        {contactGroups.length > 0 && (
          <div className="mt-6">
            {!isCollapsed && (
              <div className="px-3 mb-2">
                <h3 className="text-xs px-2 uppercase font-semibold text-gray-500 dark:text-gray-400">
                  Contact Groups
                </h3>
              </div>
            )}
            <nav className="px-2">
              {contactGroups.map((group) => (
                <a
                  key={group.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(`/groups/${group.id}`);
                  }}
                  className={`flex items-center gap-2 mb-1 px-4 py-1 rounded-md duration-150 ${
                    isGroupActive(group.id)
                      ? "bg-gray-200 dark:bg-gray-800"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  <Users size={14} />
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
