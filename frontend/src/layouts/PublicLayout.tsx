import { Outlet } from "react-router-dom";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import CookieBanner from "../components/ui/CookieBanner";

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white flex flex-col">
      <Header />

      <main className="pt-20 grow">
        <Outlet />
      </main>

      <Footer />
      <CookieBanner />
    </div>
  );
};

export default PublicLayout;
