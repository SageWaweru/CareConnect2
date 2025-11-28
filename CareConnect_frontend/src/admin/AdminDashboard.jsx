import AdminSidebar from "./components/AdminSidebar";
import AdminNavbar from "./components/AdminNavbar";
import AdminStats from "./components/AdminStats";

const AdminDashboard = () => {
  return (
    <div className="flex bg-beige h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <AdminNavbar title="Admin Dashboard" />
        <AdminStats />
      </div>
    </div>
  );
};

export default AdminDashboard;
