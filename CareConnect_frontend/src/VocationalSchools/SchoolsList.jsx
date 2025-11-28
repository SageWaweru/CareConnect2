import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SchoolList = () => {
  const [schools, setSchools] = useState([]);
  const API_BASE_URL = "https://careconnect2.onrender.com";
    // const API_BASE_URL = "http://localhost:8000";

  const navigate = useNavigate();
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/schools/`); 
        const data = await response.json();
        setSchools(data); 
      } catch (error) {
        console.error("Error fetching schools:", error);
      }
    };

    fetchSchools();
  }, []);
  

  return (
    <div className="w-full bg-beige text-gray-700 min-h-screen p-6">
      <h2 className="mb-2 text-3xl font-semibold">School Profiles</h2>
      <div>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {schools.length === 0 ? (
      <p>Loading schools...</p>
    ) : (
      schools.map((school) => (
        <div key={school.id} className="school-card max-w-sm mx-auto bg-white text-center shadow-lg rounded-lg p-8">
          <img
            src={`https://res.cloudinary.com/dpb7i0th4/${school.logo}`}
            alt="School Logo"
            className="w-32 h-32 rounded-full mx-auto object-cover mb-4"
          />
          <p className="text-2xl font-medium">{school.name}</p>
          <p className="text-gray-600 text">{school.location}</p>
          <p className="text-gray-700 italic mt-2">{school.description}</p>
          <button
                onClick={() => navigate(`/schools/${school.id}/courses`)}
                className="mt-4 bg-coral w-full hover:bg-emerald-800 text-white px-4 py-2 rounded"
              >
                View Courses
              </button>        </div>
      ))
    )}
  </div>
</div>
</div>
  );
};

export default SchoolList;
