import { useState, useEffect } from "react";
import api from "../api";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", duration: "", price: "" });
  const [schoolId, setSchoolId] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const API_BASE_URL = "https://careconnect-2-j2tv.onrender.com";
  // const API_BASE_URL = "http://localhost:8000";


  const getToken = () => localStorage.getItem("accessToken");

  useEffect(() => {
    const token = getToken();
    api
      .get(`${API_BASE_URL}/api/school/`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      })
      .then((res) => setSchoolId(res.data.id))
      .catch((err) => console.error("Error fetching school:", err));
  }, []);

  useEffect(() => {
    if (!schoolId) return; 
    const token = getToken();
    api
      .get(`${API_BASE_URL}/api/courses/school/${schoolId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      })
      .then((res) => {
        console.log("API Response for Courses:", res.data);
  
        if (Array.isArray(res.data)) {
          setCourses(res.data);
        } else {
          console.error("Unexpected response format:", res.data);
          setCourses([]); 
        }
      })            .catch((err) => console.error("Error fetching courses:", err));
  }, [schoolId]); 

  const handleChange = (e) => {
    setNewCourse({ ...newCourse, [e.target.name]: e.target.value });
  };

  const handleAddOrEditCourse = () => {
    const token = getToken();
    if (!schoolId) {
      console.error("School ID is missing");
      return;
    }

    const courseData = { ...newCourse, school: schoolId };

    if (editingCourse) {
      api
        .put(`${API_BASE_URL}/api/courses/${editingCourse.id}/`, courseData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        })
        .then((res) => {
          setCourses(courses.map((course) => (course.id === editingCourse.id ? res.data : course)));
          setEditingCourse(null);
          setShowForm(false);
        })
        .catch((err) => console.error("Error editing course:", err.response?.data || err.message));
    } else {
      api
        .post(`${API_BASE_URL}/api/courses/`, courseData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        })
        .then((res) => {
          setCourses([...courses, res.data]);
          setShowForm(false);
        })
        .catch((err) => console.error("Error adding course:", err.response?.data || err.message));
    }
  };
 
  const handleToggleStatus = (courseId) => {
    const token = getToken();
  
    api
      .patch(`${API_BASE_URL}/api/courses/${courseId}/toggle-status/`, {}, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      })
      .then((res) => {
        setCourses(
          courses.map((course) =>
            course.id === courseId ? { ...course, status: course.status === "open" ? "closed" : "open" } : course
          )
        );
      })
      .catch((err) => console.error("Error updating course status:", err));
  };
  
  const handleEditCourse = (course) => {
    setNewCourse({ title: course.title, description: course.description, duration: course.duration, price: course.price });
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDeleteCourse = (courseId) => {
    const token = getToken();
    api
      .delete(`${API_BASE_URL}/api/courses/${courseId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setCourses(courses.filter((course) => course.id !== courseId)))
      .catch((err) => console.error("Error deleting course:", err));
  };

  return (
    <div className="p-6 bg-beige w-full min-h-screen">
      <div className="bg-white w-full mx-auto p-6 rounded-lg shadow-lg text-gray-700">
        <h2 className="text-2xl font-semibold">Manage Courses</h2>

        {showForm && (
          <div className="my-4">
            <span role="button" onClick={() => setShowForm(false)} className="text-xl m-2 float-right text-emerald-800 hover:text-coral">
              ✖
            </span>
            <input name="title" value={newCourse.title} placeholder="Course Title" onChange={handleChange} className="border p-2 w-full mb-2" />
            <textarea name="description" value={newCourse.description} placeholder="Course Description" onChange={handleChange} className="border p-2 w-full mb-2"></textarea>
            <input name="duration" value={newCourse.duration} placeholder="Duration (e.g., 3 months)" onChange={handleChange} className="border p-2 w-full mb-2" />
            <input type="number" name="price" value={newCourse.price} placeholder="Price" onChange={handleChange} className="border p-2 w-full mb-2" />

            <button onClick={handleAddOrEditCourse} className="bg-emerald-800 text-white px-4 py-2 rounded">
              {editingCourse ? "Update Course" : "Add Course"}
            </button>
          </div>
        )}

        {!showForm && (
          <div className="my-4">
            <button onClick={() => setShowForm(true)} className="bg-emerald-800 hover:bg-coral text-white px-4 py-2 rounded">
              Add New Course
            </button>
          </div>
        )}

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
  {courses.length > 0 ? (
    courses.map((course) => (
      <div key={course.id} className="border p-4 rounded-lg shadow-md bg-alabaster">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-xl">{course.title}</h3>
          <button
            onClick={() => handleToggleStatus(course.id)}
            className={`px-4 py-2 rounded ${course.status === "open" ? "bg-coral hover:bg-emerald-800" : "bg-emerald-800 hover:bg-coral"} text-white`}
          >
            {course.status === "open" ? "Close Course" : "Open Course"}
          </button>
        </div>

        <p className="text-lg mt-2">
          <strong>Description:</strong> {course.description}
        </p>
        <p className="text-lg mt-2">
          <strong>Duration:</strong> {course.duration}
        </p>
        <p className="text-lg mt-2">
          <strong>Price:</strong> Ksh {course.price}
        </p>
        <p className="text-lg mt-2">
          <strong>Status:</strong> {course.status}
        </p>

        <div className="mt-4 flex">
          <button
            onClick={() => handleEditCourse(course)}
            className="bg-emerald-800 hover:bg-coral w-2/6 mr-2 text-white px-4 py-2 rounded"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteCourse(course.id)}
            className="bg-coral text-white hover:bg-emerald-800 w-2/6  px-4 py-2 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    ))
  ) : (
    <p className="col-span-2 text-center">No courses available.</p>
  )}
</div>
      </div>
    </div>
  );
};

export default CourseManagement;
