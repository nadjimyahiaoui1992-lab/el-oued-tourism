import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

export const metadata = {
  title: "لوحة التحكم | اكتشف الوادي",
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100" dir="rtl">
      <div className="flex">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">

          <Topbar />

          <main className="flex-1 p-6">
            {children}
          </main>

        </div>

      </div>
    </div>
  );
}
