import { Outlet } from "react-router-dom";
import { ChatProvider } from "../context/ChatContext";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";

const AdminLayoutContent = () => {
  // Header now handles navigation, auth status, and chat notifications for admins too.

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col text-slate-800 font-sans">
      <Header />

      <main className="flex-1 pt-20 p-8 container mx-auto">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

const AdminLayout = () => {
  return (
    <ChatProvider>
      <AdminLayoutContent />
    </ChatProvider>
  );
};

export default AdminLayout;
