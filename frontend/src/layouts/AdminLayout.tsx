import { Outlet } from "react-router-dom";
import Header from "../components/ui/Header";
import { ChatProvider } from "../context/ChatContext";
import Footer from "../components/ui/Footer";

const AdminLayout = () => {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col text-slate-800 font-sans">
        <Header />

        <main className="flex-1 pt-20 p-8 container mx-auto">
          <Outlet />
        </main>

        <Footer />
      </div>
    </ChatProvider>
  );
};

export default AdminLayout;
