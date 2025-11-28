import { useState, useEffect } from "react";
import api from "../api";

const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState(null);
  const API_BASE_URL = "https://careconnect2.onrender.com";
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
    const fetchEnrollments = async () => {
      try {
        const token = getToken();
        const response = await api.get(`${API_BASE_URL}/api/enrollments/school/${schoolId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        setEnrollments(response.data);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [schoolId]);

  const handleApproveEnrollment = async (enrollmentId) => {
    try {
      const token = getToken();
      await api.patch(`${API_BASE_URL}/api/approve-enrollment/${enrollmentId}/`, null, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      setEnrollments(enrollments.map((enrollment) =>
        enrollment.id === enrollmentId ? { ...enrollment, approved: true } : enrollment
      ));
    } catch (error) {
      console.error("Error approving enrollment:", error);
    }
  };
  const handleRejectEnrollment = async (enrollmentId) => {
    try {
      const token = getToken();
      await api.patch(`${API_BASE_URL}/api/reject-enrollment/${enrollmentId}/`, null, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
  
      setEnrollments(enrollments.filter((enrollment) => enrollment.id !== enrollmentId));
      alert("Enrollment rejected.");
    } catch (error) {
      console.error("Error rejecting enrollment:", error);
    }
  };
  
  return (
    <div className="p-6 bg-beige w-full min-h-screen">
      <div className="bg-white w-full mx-auto p-6 rounded-lg shadow-lg text-gray-700">
        <h2 className="text-2xl font-semibold">Enrollments</h2>
        {loading ? (
          <p>Loading enrollments...</p>
        ) : enrollments.length === 0 ? (
          <p>No enrollments found.</p>
        ) : (
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
{enrollments.filter((enrollment) => !enrollment.approved).length > 0 ? (
  enrollments
    .filter((enrollment) => !enrollment.approved) 
    .map((enrollment) => (
      <div key={enrollment.id} className="border p-4 rounded-md shadow bg-alabaster">
        <p><strong>Name:</strong> {enrollment.name}</p>
        <p><strong>Email:</strong> {enrollment.email}</p>
        <p><strong>Age:</strong> {enrollment.age}</p>
        <p><strong>Course:</strong> {enrollment.course_title}</p>
        <p><strong>Status:</strong> Pending</p>

        <button
          onClick={() => handleApproveEnrollment(enrollment.id)}
          className="bg-emerald-800 hover:bg-emerald-600 text-white px-4 py-2 rounded mt-2"
        >
          Approve Enrollment
        </button>

        <button
          onClick={() => handleRejectEnrollment(enrollment.id)}
          className="bg-coral hover:bg-red-700 text-white px-4 py-2 rounded mt-2 ml-2"
        >
          Reject Enrollment
        </button>
      </div>
    ))
) : (
  <p>No pending enrollments.</p>
)}
</div>
        )}
      </div>
    </div>
  );
};

export default Enrollments;
