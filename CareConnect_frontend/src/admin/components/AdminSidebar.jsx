import { Link } from "react-router-dom";

const AdminSidebar = () => {
  return (
    <div className="w-64 bg-emerald-800 h-screen p-4 text-white">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      <ul>
        <li className="mb-3"><Link to="/admin" className="text-white hover:text-gray-300">Dashboard</Link></li>
        <li className="mb-3"><Link to="/admin/users" className="text-white hover:text-gray-300">Users</Link></li>
        <li className="mb-3"><Link to="/admin/jobs" className="text-white hover:text-gray-300">Jobs</Link></li>
        <li className="mb-3"><Link to="/admin/schools" className="text-white hover:text-gray-300">Schools</Link></li>
        <li className="mb-3"><Link to="/admin/reviews" className="text-white hover:text-gray-300">Reviews</Link></li>
        {/* <li className="mb-3"><Link to="/admin/settings" className="hover:text-gray-300">⚙️ Settings</Link></li> */}
      </ul>
    </div>
  );
};

export default AdminSidebar;
