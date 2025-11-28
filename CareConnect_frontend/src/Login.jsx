import { useState, useContext, useEffect } from 'react';
import AuthContext from './context/AuthContext';
import { useNavigate } from 'react-router-dom';


const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const { login, user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();


    useEffect(() => {
      if (user) {
        setIsAdmin(user.role === 'admin' || user.is_superuser);
        
        if (user.role === 'admin' || user.is_superuser) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    }, [user, navigate]); 
  

    const handleSubmit = async (e) => {
      e.preventDefault();
      await login(formData);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-beige">
    <form onSubmit={handleSubmit} className="p-8 bg-stone-50 rounded-lg shadow-lg w-96">
      <h2 className="text-2xl font-semibold mb-6 text-emeraldDark">Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        className="w-full p-3 mb-5 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emeraldDark text-lg"
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        className="w-full p-3 mb-5 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emeraldDark text-lg"
      />
      <button
        type="submit"
        className="w-full bg-coral text-white p-3 rounded-md hover:bg-emeraldDark transition duration-200 ease-in-out"
      >
        Login
      </button>
    </form>
    {isAdmin && <p className="mt-6 text-center text-emeraldDark text-lg font-semibold">Welcome, Admin!</p>}
  </div>
  
  );
};

export default Login;
