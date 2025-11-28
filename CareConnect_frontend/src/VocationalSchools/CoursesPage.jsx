import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EnrollForm from "./EnrollForm";

const CoursesPage = () => {
  const { schoolId } = useParams();
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courses, setCourses] = useState([]);
  const API_BASE_URL = "https://careconnect2.onrender.com";
    // const API_BASE_URL = "http://localhost:8000";


  const enrollInCourse = (courseId) => {
    setSelectedCourseId(courseId);
  };

  const handleEnrollSuccess = (data) => {
    setSelectedCourseId(null);
    alert("Your enroll request has been sent successfully. We shall get back to you in 24 hours.");
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courseResponse = await fetch(`${API_BASE_URL}/api/courses/school/${schoolId}/`);
        if (!courseResponse.ok) throw new Error("Failed to fetch courses");
        const courseData = await courseResponse.json();
        setCourses(courseData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [schoolId]);

  return (
    <div className="w-full min-h-screen bg-beige text-gray-700 p-6">
      <h2 className="text-3xl font-bold">Courses</h2>
      <div className="grid grid-cols-2 gap-4">
        {courses.length === 0 ? (
          <p>No courses available</p>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="border p-4 bg-gray-100 rounded shadow">
              <h3 className="font-semibold text-xl">{course.title}</h3>
              <p className="m-2"><strong>Description:</strong> {course.description}</p>
              <p className="m-2"><strong>Duration:</strong> {course.duration}</p>
              <p className="m-2"><strong>Price:</strong> Ksh {course.price}</p>
              <p className="m-2"><strong>Status:</strong> {course.status}</p>

              {course.status === "open" ? (
                <button
                  className="bg-coral text-white hover:bg-emerald-800 px-4 w-full py-2 rounded"
                  onClick={() => enrollInCourse(course.id)}
                >
                  Enroll
                </button>
              ) : (
                <button disabled className="bg-gray-400 text-white px-4 w-full py-2 rounded">
                  Course is closed for enrollment
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {selectedCourseId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative bg-white p-6 w-3/5 shadow-md rounded-md">
            <button
              onClick={() => setSelectedCourseId(null)}
              className="absolute top-3 right-3 text-coral hover:text-emerald-800 text-xl"
            >
              ✖
            </button>
            <EnrollForm courseId={selectedCourseId} onEnrollSuccess={handleEnrollSuccess} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
