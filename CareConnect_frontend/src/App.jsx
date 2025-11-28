import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import Navbar from './Navbar';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import Profile from './caretaker/Profile';
import ProfileView from './caretaker/ProfileView';
import CaretakerProfiles from './CartakerProfiles';
import CaretakerProfileDetails from './CaretakerProfileDetails';
import ReviewForm from './ReviewForm';
import CaretakerReviews from './CaretakerReviews';
import CaregiverChats from './CaregiverChats';
import MessagesPage from './MessagesPage';
import JobApplications from './JobApplications';
import CreateJobPost from './CreateJobPost';
import CustomerJobApplications from './CustomerJobApplications';
import SchoolProfile from './VocationalSchools/SchoolProfile';
import CourseManagement from './VocationalSchools/CourseManagement';
import SchoolList from './VocationalSchools/SchoolsList';
import CoursesPage from './VocationalSchools/CoursesPage';
import Enrollments from './VocationalSchools/Enrollments';
import Users from './admin/Users';
import AdminDashboard from './admin/AdminDashboard';
import Jobs from './admin/Jobs';
import Reviews from './admin/Reviews';
import Schools from './admin/Schools';
import Applications from './admin/Applications';
import Students from './VocationalSchools/Students';
import Footer from './Footer';

function App() {

  return (    
<AuthProvider>
  <Router>
   <div className="flex flex-col min-h-screen"> 
  <Navbar/>
  <main className="flex-1 overflow-auto">
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />
      <Route path="/createjob" element={<CreateJobPost />} />
      <Route path="/applyjob" element={<JobApplications />} />
      <Route path='/customer-jobs' element={<CustomerJobApplications/>} />
      <Route path='/caretakers' element={<CaretakerProfiles/>} />
      <Route path="/caretaker/:id" element={<CaretakerProfileDetails />} />
      <Route path="/caretaker-profile-create" element={<Profile />} />
      <Route path="/caretaker-profile" element={<ProfileView />} />
      <Route path="/caregiver-chats" element={<CaregiverChats />} />
      <Route path="/messages/:sender" element={<MessagesPage />} />
      <Route path='/caretaker/:caretakerId/reviews' element={<CaretakerReviews/>} />
      <Route path="/review/:id" element={<ReviewForm />} />
      <Route path="/courses" element={<CourseManagement />} />
      <Route path="/School" element={<SchoolProfile />} />
      <Route path="/VocationalSchool" element={<SchoolList />} />
      <Route path="/schools/:schoolId/courses" element={<CoursesPage />}/>
      <Route path="/enrollments" element={<Enrollments />}/>
      <Route path="/students" element={<Students />}/>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<Users />} />
      <Route path="/admin/jobs" element={<Jobs />} />
      <Route path="/admin/schools" element={<Schools />} />
      <Route path="/admin/reviews" element={<Reviews />} />
      <Route path="/applications/:id" element={<Applications />}/>
    </Routes>
    </main>
    <Footer/>
   </div>  
  </Router>
</AuthProvider>  )
}

export default App
