import { Outlet } from "react-router-dom";

import { ChatProvider } from "../context/ChatContext";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";

const PublicLayoutContent = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white flex flex-col">
      <Header />

      <main className="pt-20 flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

const PublicLayout = () => {
  return (
    <ChatProvider>
      <PublicLayoutContent />
    </ChatProvider>
  );
};

export default PublicLayout;
