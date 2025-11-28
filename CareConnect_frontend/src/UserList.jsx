import  { useState, useEffect } from 'react';
import api from "./api";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const API_BASE_URL = "https://careconnect2.onrender.com";
    // const API_BASE_URL = "http://localhost:8000";


  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await api.get(`${API_BASE_URL}/api/users/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          setUsers(response.data); 
        } catch (error) {
          setError('Error fetching users');
          console.error(error);
        }
      } else {
        setError('No access token found');
      }
    };

    fetchUsers();
  }, []);  

  return (
    <div>
      {error && <p>{error}</p>}
      <ul>
        {users.map((user) => (
          <li key={user.username}>{user.username} ({user.email})</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
