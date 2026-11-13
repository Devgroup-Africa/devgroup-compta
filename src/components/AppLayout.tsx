import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="p-3 sm:p-5 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
