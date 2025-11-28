import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from './context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white py-4 px-6 shadow-lg">
      <div className="flex justify-between items-center container mx-auto">
        <Link to="/" className="text-2xl hover:text-coral text-emeraldDark font-semibold">CareConnect</Link>

        <div className="space-x-4">
          {user ? (
            <>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" className="hover:text-coral text-emeraldDark">Dashboard</Link>
                  <Link to="/admin/users" className="hover:text-coral text-emeraldDark">Users</Link>
                  <Link to="/admin/jobs" className="hover:text-coral text-emeraldDark">Jobs</Link>
                  <Link to="/admin/schools" className="hover:text-coral text-emeraldDark">Schools</Link>
                  <Link to="/admin/reviews" className="hover:text-coral text-emeraldDark">Reviews</Link>
                </>
              )}
              {user.role === 'customer' && (
                <>
                  <Link to="/" className="hover:text-coral text-emeraldDark">Dashboard</Link>
                  <Link to="/caretakers" className="hover:text-coral text-emeraldDark">Caretakers</Link>
                  <Link to="/createjob" className="hover:text-coral text-emeraldDark">Post Job</Link>
                  <Link to="/customer-jobs" className="hover:text-coral text-emeraldDark">My Jobs</Link>
                  <Link to="/caregiver-chats" className="hover:text-coral text-emeraldDark">Messages</Link>
                </>
              )}
              {user.role === 'caretaker' && (
                <>
                  <Link to="/" className="hover:text-coral text-emeraldDark">Dashboard</Link>
                  <Link to="/caretaker-profile" className="hover:text-coral text-emeraldDark">Profile</Link>
                  <Link to="/caregiver-chats" className="hover:text-coral text-emeraldDark">Messages</Link>
                  <Link to="/applyjob" className="hover:text-coral text-emeraldDark">Jobs</Link>
                  <Link to="/VocationalSchool" className="hover:text-coral text-emeraldDark">Vocational Schools</Link>
                </>
              )}
              {user.role === 'vocational_school' && (
                <>
                  <Link to="/" className="hover:text-coral text-emeraldDark">Dashboard</Link>
                  <Link to="/school" className="hover:text-coral text-emeraldDark">Profile</Link>
                  <Link to="/students" className="hover:text-coral text-emeraldDark">Students</Link>
                  <Link to="/courses" className="hover:text-coral text-emeraldDark">Courses</Link>
                  <Link to="/enrollments" className="hover:text-coral text-emeraldDark">Enrollments</Link>
                </>
              )}
              <span role='button' onClick={handleLogout} className="hover:text-coral text-emeraldDark">Logout</span>
            </>
          ) : (
            <>
              <Link to="/" className="hover:text-coral text-emeraldDark">Home</Link>
              <Link to="/login" className="hover:text-coral text-emeraldDark">Login</Link>
              <Link to="/register" className="hover:text-coral text-emeraldDark">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
