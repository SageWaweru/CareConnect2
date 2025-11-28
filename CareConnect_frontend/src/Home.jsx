import { useContext } from "react";
import AuthContext from "./context/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-beige px-4 py-6 overflow-hidden">
        <section className="text-center py-20">
          <h2 className="text-4xl font-extrabold mb-6">
            Welcome to CareConnect, {user ? user.username : "Guest"}!
          </h2>
          <p className="text-xl mb-8 text-gray-700 max-w-2xl mx-auto">
            Connecting caretaking professionals and customers for trustworthy
            and personalized care services.
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="/VocationalSchool"
              className="bg-[#2D6A4F] text-white px-6 py-3 rounded-lg hover:bg-[#1E5136] hover:text-white transition"
            >
              Explore Schools
            </a>
            <a
              href="/caretakers"
              className="bg-[#E09891] text-white px-6 py-3 rounded-lg hover:bg-[#C0706A] hover:text-white transition"
            >
              Find Caretakers
            </a>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="container p-4 mx-auto text-center">
            <h3 className="text-3xl font-bold mb-8">What We Offer</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#B0BC98] p-6 rounded-lg shadow-lg">
                <h4 className="text-2xl font-semibold mb-4">For Customers</h4>
                <p className="text-gray-700">
                  Access skilled caretakers, post jobs and hire caretakers
                  according to your requirements.
                </p>
              </div>
              <div className="bg-[#E09891] p-6 rounded-lg shadow-lg">
                <h4 className="text-2xl font-semibold mb-4">For Caretakers</h4>
                <p className="text-gray-700">
                  Find flexible job opportunities and promote yourself to
                  potential clients.
                </p>
              </div>
              <div className="bg-[#2D6A4F] p-6 rounded-lg shadow-lg text-white">
                <h4 className="text-2xl font-semibold mb-4">
                  For Vocational Schools
                </h4>
                <p>
                  Manage enrollments, track students, and promote your courses.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-beige px-4 w-full py-6">
      {user.role === "admin" || user.is_superuser ? (
        <div className="text-center bg-emerald-100 p-6 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold text-emerald-800 mb-2">
            Admin Dashboard
          </h2>
          <p className="text-gray-700">
            You have full access to the dashboard.
          </p>
        </div>
      ) : user.role === "customer" ? (
        <div className="bg-beige min-h-screen w-full">
          <div className="max-w-6xl mx-auto p-6">
            <header className="bg-alabaster text-gray-700 p-6 rounded-lg shadow-md text-center">
              <h2 className="text-4xl font-extrabold mb-4">
                Welcome to CareConnect's Customer Dashboard,{" "}
                {user ? user.username : "Guest"}!
              </h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Connecting caretaking professionals and customers for
                trustworthy and personalized care services.
              </p>
            </header>

            <div className="grid grid-cols-1 mt-8 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-8 bg-emerald-800 text-white rounded-lg shadow-lg border border-gray-300">
                <h2 className="text-2xl font-semibold mb-6">Post Jobs</h2>
                <p className="text-lg mb-6">
                  Easily post job listings and connect with skilled caretakers.
                </p>
                <p className="text-lg mb-6">
                  Share job details, specify required qualifications, and
                  quickly reach qualified professionals ready to apply.
                </p>
                <button
                  onClick={() => navigate("/createjob")}
                  className="bg-alabaster text-gray-700 py-3 px-6 rounded-md hover:bg-coral w-full font-medium"
                >
                  Post A Job
                </button>
              </div>

              <div className="p-8 bg-sage text-gray-700 rounded-lg shadow-lg border border-gray-300">
                <h2 className="text-2xl font-semibold text-emerald-dark mb-6">
                  Your Job Applications
                </h2>
                <p className="text-lg mb-6">
                  Track and manage applications for jobs you've posted.
                </p>
                <p className="text-lg mb-6">
                  Stay updated on application status, shortlist candidates, and
                  communicate directly with interested caretakers.
                </p>
                <button
                  onClick={() => navigate("/customer-jobs")}
                  className="bg-emerald-800 text-white py-3 px-6 rounded-md hover:bg-coral w-full font-medium"
                >
                  View Applications
                </button>
              </div>

              <div className="p-8 bg-alabaster text-gray-700 rounded-lg shadow-lg border border-gray-300">
                <h2 className="text-2xl font-semibold text-emerald-dark mb-6">
                  Caretaker Profiles
                </h2>
                <p className="text-lg mb-6">
                  Browse profiles of professional caretakers to find the right
                  fit for your needs.
                </p>
                <p className="text-lg mb-6">
                  Explore detailed profiles, check ratings and reviews, and hire
                  with confidence.
                </p>
                <button
                  onClick={() => navigate("/caretakers")}
                  className="bg-sage text-gray-700 py-3 px-6 rounded-md hover:bg-coral w-full font-medium"
                >
                  View Caretakers
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : user.role === "caretaker" ? (
        <div className="w-full">
          <div className="min-h-screen p-6">
            <header className="bg-alabaster text-gray-700 p-6 rounded-lg shadow-md">
              <div className="container p-6 mx-auto flex flex-col text-center justify-between items-center">
                <h2 className="text-4xl font-extrabold mb-6">
                  Welcome to CareConnect's Caretaker Dashboard,{" "}
                  {user ? user.username : "Guest"}!
                </h2>
                <p className="text-xl mb-8 text-gray-700 max-w-2xl mx-auto leading-relaxed">
                  Connecting caretaking professionals and customers for
                  trustworthy and personalized care services.
                </p>
              </div>
            </header>

            <div className="container mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-emerald-800 text-white p-8 rounded-lg shadow-lg min-h-[280px] flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">
                    New Job Opportunities
                  </h2>
                  <p className="text-lg leading-relaxed">
                    Explore job postings tailored for caretakers. Find roles
                    that match your skills and preferences, apply with ease, and
                    take the next step in your caregiving career.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/applyjob")}
                  className="mt-6 bg-alabaster hover:bg-coral w-full text-gray-800 py-3 px-4 rounded-md transition"
                >
                  Browse Jobs
                </button>
              </div>

              <div className="bg-[#B0BC98] text-gray-700 p-8 rounded-lg shadow-lg min-h-[280px] flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">
                    Vocational Training & Courses
                  </h2>
                  <p className="text-lg leading-relaxed">
                    Enhance your caretaking skills by enrolling in certified
                    courses from top vocational schools. Gain new qualifications
                    and expand your expertise.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/VocationalSchool")}
                  className="mt-6 bg-[#2D6A4F] hover:bg-coral w-full text-white py-3 px-4 rounded-md transition"
                >
                  Explore Schools
                </button>
              </div>

              <div className="bg-alabaster text-gray-700 p-8 rounded-lg shadow-lg min-h-[280px] flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">
                    What Others Are Saying
                  </h2>
                  <p className="text-lg leading-relaxed">
                    Build your reputation through real client feedback. Read
                    reviews from satisfied customers, showcase your skills, and
                    establish trust within the CareConnect community.
                  </p>
                </div>
                <button className="mt-6 bg-sage hover:bg-coral w-full text-gray-800 py-3 px-4 rounded-md transition">
                  View All Reviews
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : user.role === "vocational_school" ? (
        <div className="bg-beige min-h-screen w-full">
          <div className="max-w-6xl mx-auto p-6">
            <header className="bg-alabaster text-gray-700 p-4 rounded-lg shadow-md">
              <div className="container p-6 mx-auto flex flex-col text-center justify-between items-center">
                <h2 className="text-4xl font-extrabold mb-6">
                  Welcome to CareConnect's Vocational School Dashboard,{" "}
                  {user ? user.username : "Guest"}!
                </h2>
                <p className="text-xl mb-8 text-gray-700 max-w-2xl mx-auto">
                  Empower aspiring caretakers with quality training and
                  certifications. Manage your school, courses, and student
                  enrollments all in one place.
                </p>
              </div>
            </header>

            <div className="grid grid-cols-1 mt-6 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 bg-emerald-800 text-white text-lg rounded-lg shadow-md border border-gray-300 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  Create & Manage Your Profile
                </h2>
                <p className="mb-4">
                  Build a strong presence by setting up your vocational school
                  profile. Showcase your institution, highlight your expertise,
                  and attract aspiring caretakers.
                </p>
                <div className="mb-4">
                  <p>
                    Your profile helps students discover your school and
                    understand the certifications you offer.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/school")}
                  className="bg-alabaster text-gray-700 py-2 px-4 rounded-md hover:bg-coral w-full"
                >
                  Manage Profile
                </button>
              </div>

              <div className="bg-sage text-gray-700 p-6 text-lg rounded-lg shadow-md border border-gray-300 mb-6">
                <h2 className="text-xl font-semibold text-emerald-dark mb-4">
                  Course Management
                </h2>
                <p className="mb-4">
                  List and manage the courses your school offers.
                </p>
                <div className="mb-4">
                  <p>
                    Advertise your training programs, provide course details,
                    and handle student applications seamlessly.
                  </p>
                </div>
                <div className="mb-4">
                  <p>
                    Approve enrollments, update course statuses, and ensure your
                    students receive the best learning experience.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/courses")}
                  className="bg-emerald-800 text-white py-2 px-4 rounded-md hover:bg-coral w-full"
                >
                  Manage Courses
                </button>
              </div>

              <div className="bg-alabaster text-gray-700 text-lg p-6 rounded-lg shadow-md border border-gray-300 mb-6">
                <h2 className="text-xl font-semibold text-emerald-dark mb-4">
                  Student Enrollments
                </h2>
                <p className="mb-4">
                  Track and manage student enrollments with ease.
                </p>
                <div className="mb-4">
                  <p>
                    View student details, monitor progress, and ensure they meet
                    enrollment requirements.
                  </p>
                </div>
                <div className="mb-4">
                  <p>
                    Provide guidance, approve applications, and support students
                    throughout their training journey.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/students")}
                  className="bg-sage text-gray-700 py-2 px-4 rounded-md hover:bg-coral w-full"
                >
                  View Students
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center bg-gray-200 p-6 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome!</h2>
          <p className="text-gray-600">
            Please log in or register to access CareConnect features.
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
