const AdminNavbar = ({ title }) => {
    return (
      <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md">
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
    );
  };
  
  export default AdminNavbar;
  