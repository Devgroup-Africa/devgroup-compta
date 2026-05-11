import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Scale,
  Users,
  Receipt,
  Truck,
  Landmark,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  ClipboardList,
  LogOut,
  User,
  ArrowLeftRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navSections = [
  {
    label: "Général",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Comptabilité",
    items: [
     /* { to: "/plan-comptable", icon: BookOpen, label: "Plan comptable" },
      { to: "/journal", icon: FileText, label: "Journal" },
      { to: "/grand-livre", icon: Scale, label: "Grand livre" },
      { to: "/balance", icon: ClipboardList, label: "Balance & Bilan" },
   */ ],
  },
  {
    label: "Commercial",
    items: [
      { to: "/factures", icon: Receipt, label: "Factures" },
      { to: "/clients", icon: Users, label: "Clients" },
      { to: "/fournisseurs", icon: Truck, label: "Fournisseurs" },
      { to: "/achats", icon: FileText, label: "Achats" },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/tresorerie", icon: Landmark, label: "Trésorerie" },
      { to: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
    ],
  },
  {
    label: "Système",
    items: [
      { to: "/parametres", icon: Settings, label: "Paramètres" },
    ],
  },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { settings } = useCompanySettings();

  const handleLogout = () => {
    logout();
  };

  // Utiliser le logo des paramètres ou le logo par défaut
  const logoUrl = settings?.logo || '/logo devgroup-1.png';
  const companyName = settings?.name || 'DevGroup Africa';

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col bg-white text-slate-700 border-r border-slate-200 transition-all duration-300 shrink-0 shadow-sm",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <img 
          src={logoUrl}
          alt={companyName}
          className="w-9 h-9 rounded-xl shrink-0 object-contain"
          onError={(e) => {
            // Fallback au logo par défaut en cas d'erreur
            e.currentTarget.src = '/logo devgroup-1.png';
          }}
        />
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-heading font-bold text-sm text-slate-800 truncate">{companyName}</p>
            <p className="text-[10px] text-slate-500 truncate tracking-wide uppercase">Système comptable</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-150",
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium shadow-sm border border-blue-100"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-blue-600")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User menu */}
      <div className="border-t border-slate-200 p-3 bg-slate-50">
        {!collapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2 h-auto text-left hover:bg-white"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-medium shadow-md">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-10 p-0 hover:bg-white"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-medium shadow-md">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-11 border-t border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
};

export default AppSidebar;
