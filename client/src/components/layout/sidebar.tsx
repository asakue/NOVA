import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/authProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();
  const { logoutMutation, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => {
    if (path === "/dashboard" && location === "/") {
      return true;
    }
    return location.startsWith(path);
  };

  // Перенаправление вместо Link
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
        >
          <span className="material-icons">{isMobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
        <div className="flex items-center">
            <div className="w-6 h-6 mr-2">
              <svg viewBox="0 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gradient-mobile" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:"#3B82F6", stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:"#1E40AF", stopOpacity:1}} />
                  </linearGradient>
                </defs>
                <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                  <rect fill="url(#gradient-mobile)" x="0" y="0" width="48" height="48" rx="12"></rect>
                  <path d="M14,12 L24,12 L34,24 L24,36 L14,36 L24,24 L14,12 Z" fill="#FFFFFF"></path>
                  <circle cx="34" cy="14" r="4" fill="#FFFFFF" opacity="0.7"></circle>
                </g>
              </svg>
            </div>
            <h1 className="text-lg font-bold text-primary">NOVA</h1>
        </div>
        <div className="w-10"></div> {/* Spacer for balance */}
      </div>

      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white shadow-md w-64 md:h-screen md:sticky md:top-0 z-20 transition-all duration-300 overflow-y-auto flex flex-col",
          isMobileMenuOpen ? "fixed inset-0 w-full h-full" : "hidden md:flex"
        )}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 mb-2">
              <svg viewBox="0 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:"#3B82F6", stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:"#1E40AF", stopOpacity:1}} />
                  </linearGradient>
                </defs>
                <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                  <rect fill="url(#gradient)" x="0" y="0" width="48" height="48" rx="12"></rect>
                  <path d="M14,12 L24,12 L34,24 L24,36 L14,36 L24,24 L14,12 Z" fill="#FFFFFF"></path>
                  <circle cx="34" cy="14" r="4" fill="#FFFFFF" opacity="0.7"></circle>
                </g>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-center text-primary">NOVA</h1>
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center">
              <span className="material-icons text-primary">person</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">
                {isAdmin ? "Администратор" : "Студент"}
              </p>
              <p className="text-sm text-gray-500">Группа А-1</p>
            </div>
          </div>
        </div>

        <nav className="p-2 flex-1">
          <ul className="space-y-1">
            <li>
              <Button
                variant="ghost"
                className={cn(
                  "flex w-full items-center justify-start px-3 py-2 rounded-md hover:bg-gray-100 transition-colors",
                  isActive("/dashboard") 
                    ? "bg-primary text-white hover:bg-primary hover:text-white" 
                    : "text-gray-700"
                )}
                onClick={() => navigateTo("/dashboard")}
              >
                <span className="material-icons mr-3">dashboard</span>
                <span className="font-medium">Главная</span>
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className={cn(
                  "flex w-full items-center justify-start px-3 py-2 rounded-md hover:bg-gray-100 transition-colors",
                  isActive("/subjects") 
                    ? "bg-primary text-white hover:bg-primary hover:text-white" 
                    : "text-gray-700"
                )}
                onClick={() => navigateTo("/subjects")}
              >
                <span className="material-icons mr-3">menu_book</span>
                <span className="font-medium">Предметы</span>
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className={cn(
                  "flex w-full items-center justify-start px-3 py-2 rounded-md hover:bg-gray-100 transition-colors",
                  isActive("/homework") 
                    ? "bg-primary text-white hover:bg-primary hover:text-white" 
                    : "text-gray-700"
                )}
                onClick={() => navigateTo("/homework")}
              >
                <span className="material-icons mr-3">assignment</span>
                <span className="font-medium">Домашние задания</span>
              </Button>
            </li>

            {isAdmin && (
              <li>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex w-full items-center justify-start px-3 py-2 rounded-md hover:bg-gray-100 transition-colors",
                    isActive("/admin") 
                      ? "bg-primary text-white hover:bg-primary hover:text-white" 
                      : "text-gray-700"
                  )}
                  onClick={() => navigateTo("/admin")}
                >
                  <span className="material-icons mr-3">admin_panel_settings</span>
                  <span className="font-medium">Управление</span>
                </Button>
              </li>
            )}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-200 mt-auto">
          <Button 
            variant="ghost" 
            className="flex items-center justify-start p-2 w-full rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <span className="material-icons mr-3">exit_to_app</span>
            <span>{logoutMutation.isPending ? 'Выход...' : 'Выйти'}</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
