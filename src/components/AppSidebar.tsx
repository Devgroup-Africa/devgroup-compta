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
  Menu,
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
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { settings } = useCompanySettings();

  const handleLogout = () => {
    logout();
  };

  // Utiliser le logo des paramètres ou le logo par défaut
  const logoUrl = settings?.logo || '/logo devgroup-1.png';
  const companyName = settings?.name || 'DevGroup Africa';

  const renderNavigation = (isCollapsed: boolean, onNavigate?: () => void) => (
    <div className="space-y-5">
      {navSections.map((section) => (
        <div key={section.label}>
          {!isCollapsed && (
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
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-150",
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium shadow-sm border border-blue-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-blue-600")} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 shadow-sm md:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <img
            src={logoUrl}
            alt=""
            className="h-8 w-8 shrink-0 rounded-lg object-contain"
            onError={(e) => {
              e.currentTarget.src = '/logo devgroup-1.png';
            }}
          />
          <span className="truncate text-sm font-bold text-slate-800">{companyName}</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Ouvrir la navigation">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-3/4 max-w-[300px] flex-col gap-0 p-0">
            <SheetTitle className="sr-only">Navigation principale</SheetTitle>
            <div className="flex h-16 items-center gap-3 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4">
              <img
                src={logoUrl}
                alt=""
                className="h-9 w-9 shrink-0 rounded-xl object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/logo devgroup-1.png';
                }}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">{companyName}</p>
                <p className="truncate text-[10px] uppercase tracking-wide text-slate-500">Système comptable</p>
              </div>
            </div>
            <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
              {renderNavigation(false, () => setMobileOpen(false))}
            </nav>
            <div className="border-t border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 flex min-w-0 items-center gap-3 px-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-medium text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{user?.name}</p>
                  <p className="truncate text-xs text-slate-500">{user?.role}</p>
                </div>
              </div>
              <Button variant="ghost" className="w-full justify-start gap-2 text-red-600" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 md:flex",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4">
          <img
            src={logoUrl}
            alt={companyName}
            className="h-9 w-9 shrink-0 rounded-xl object-contain"
            onError={(e) => {
              e.currentTarget.src = '/logo devgroup-1.png';
            }}
          />
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold text-slate-800">{companyName}</p>
              <p className="truncate text-[10px] uppercase tracking-wide text-slate-500">Système comptable</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {renderNavigation(collapsed)}
        </nav>

        <div className="border-t border-slate-200 bg-slate-50 p-3">
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

        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Développer la navigation" : "Réduire la navigation"}
          className="flex h-11 items-center justify-center border-t border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>
    </>
  );
};

export default AppSidebar;
