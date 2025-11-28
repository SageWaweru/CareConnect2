import { useState, useEffect } from "react";
import api from "../api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    role: "",
    password: "", 
  });
  const [showForm, setShowForm] = useState(false); 
  const API_BASE_URL = "https://careconnect2.onrender.com";
    // const API_BASE_URL = "http://localhost:8000";


  useEffect(() => {
    api.get(`${API_BASE_URL}/api/admin/users/`).then((res) => setUsers(res.data));
  }, []);

  // const toggleUserStatus = (id) => {
  //   api.patch(`http://127.0.0.1:8000/api/admin/users/${id}/toggle-status/`).then(() => {
  //     setUsers(users.map(user => user.id === id ? { ...user, is_superuser: !user.is_superuser } : user));
  //   });
  // };

  const Delete = (id) => {
    api
      .delete(`http://127.0.0.1:8000/api/admin/users/${id}/`)
      .then((response) => {
        console.log("User deleted successfully", response.data);
        alert("User deleted successfully");
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      })
      .catch((error) => {
        console.error("There was an error deleting the user:", error.response ? error.response.data : error.message);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    api
      .post("http://127.0.0.1:8000/api/admin/users/", newUser)
      .then((response) => {
        console.log("User added successfully", response.data);
        setUsers([...users, response.data]);
        setNewUser({ username: "", email: "", role: "", password: "" });
        setShowForm(false); 
      })
      .catch((error) => {
        const errorMessage = error.response ? error.response.data : error.message;

        const usernameError = errorMessage.username ? errorMessage.username[0] : null;
        const generalError = errorMessage.detail || errorMessage.message || "Something went wrong.";
  
        if (usernameError) {
          alert(`${usernameError} There should not be spaces between names `);  
        } else {
          alert(`Error: ${generalError}`);  
        }
  
        console.error("There was an error adding the user:", errorMessage);
            });
  };

  return (
    <div className="p-6 bg-beige min-h-screen text-gray-700">
      <h2 className="text-2xl font-bold">User Management</h2>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mt-6 mb-4 px-4 py-2 bg-emerald-800 text-white rounded hover:bg-coral"
      >
        {showForm ? "Cancel" : "Add New User"}
      </button>

      {showForm && (
        <form onSubmit={handleFormSubmit} className="mt-6 w-3/5 space-y-6 bg-white p-6 shadow-lg rounded-lg">
          <div className="mb-4">
            <label className="block text-gray-700 text-lg font-semibold">Username</label>
            <input
              type="text"
              name="username"
              value={newUser.username}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-emerald-800 focus:outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-lg font-semibold">Email</label>
            <input
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-emerald-800 focus:outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-lg font-semibold">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-emerald-800 focus:outline-none"
            >
              <option value="" disabled>Select Role</option>
              <option value="customer">Customer</option>
              <option value="caretaker">Caretaker</option>
              <option value="vocational_school">Vocational School</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-lg font-semibold">Password</label>
            <input
              type="password"
              name="password"
              value={newUser.password}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-emerald-800 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-coral text-white text-lg font-semibold rounded-md hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800"
          >
            Add User
          </button>
        </form>
      )}

      <table className="w-full mt-6 bg-white border-collapse border border-gray-300 shadow-lg rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Username</th>
            <th className="border p-2 text-left">Email</th>
            <th className="border p-2 text-left">Role</th>
            <th className="border p-2 text-left">Super User</th>
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="border p-2">{user.id}</td>
              <td className="border p-2">{user.username}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.is_superuser ? "True" : "False"}</td>
              <td className="border p-2">{user.role}</td>
              <td className="border p-2 flex space-x-2">
                <button
                  className="px-3 py-1 text-white rounded bg-coral hover:bg-emerald-800"
                  onClick={() => Delete(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
