import { Outlet } from "react-router-dom";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col text-slate-800 font-sans">
      <Header />

      <main className="flex-1 pt-28 pb-6 px-4 sm:pb-8 sm:px-6 lg:px-8 container mx-auto">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default AdminLayout;
