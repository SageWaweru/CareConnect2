import { useEffect, useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";

const CaretakerProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [ratings, setRatings] = useState({}); 
  const navigate = useNavigate();
  const API_BASE_URL = "https://careconnect2.onrender.com";
    // const API_BASE_URL = "http://localhost:8000";
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [filters, setFilters] = useState({
    availability: "",
    skill: "",
    minRating: "",
  });

  useEffect(() => {
    api
      .get(`${API_BASE_URL}/api/caretaker-profiles/`)
      .then((response) => {
        console.log("API Response:", response.data);  
        if (Array.isArray(response.data)) {
          setProfiles(response.data);
          setFilteredProfiles(response.data);
        } else {
          console.error("Unexpected API response:", response.data);
          setProfiles([]);
          setFilteredProfiles([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching profiles:", error);
        setProfiles([]);  
        setFilteredProfiles([]);
      });
  }, []);
  
  useEffect(() => {
    const fetchReviews = async () => {
      if (profiles.length === 0) return;

      const ratingsData = {};
      await Promise.all(
        profiles.map(async (profile) => {
          try {
            const response = await api.get(
              `${API_BASE_URL}/api/caretaker/${profile.id}/reviews/`
            );
            const reviews = response.data;
            const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
            ratingsData[profile.id] = reviews.length > 0 ? totalRating / reviews.length : 0;
          } catch (error) {
            console.error(`Error fetching reviews for profile ${profile.id}:`, error);
            ratingsData[profile.id] = 0;
          }
        })
      );

      setRatings(ratingsData);
    };

    fetchReviews();
  }, [profiles]); 

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  useEffect(() => {
    let filtered = profiles;

    if (filters.availability) {
      filtered = filtered.filter((profile) => profile.availability === filters.availability);
    }

    if (filters.skill) {
      filtered = filtered.filter((profile) => profile.skills?.includes(filters.skill));
    }

    if (filters.minRating) {
      filtered = filtered.filter((profile) => (ratings[profile.id] || 0) >= parseFloat(filters.minRating));
    }

    setFilteredProfiles(filtered);
  }, [filters, profiles, ratings]);

  return (
    <div className="min-h-screen bg-beige py-10 px-4">
      <h2 className="text-4xl font-bold text-gray-700 text-center mb-8">
        Caretaker Profiles
      </h2>
       <div className="flex float flex-wrap gap-4 mb-6 justify-left">
        <h3 className="text-2xl font-bold text-gray-700">Filter Caretakers by:</h3>
        <select name="availability" className="p-2 border rounded" onChange={handleFilterChange}>
          <option value=""> Availability(All)</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Weekends Only">Weekends Only</option>
          <option value="Flexible Hours">Flexible Hours</option>

        </select>

        <select name="skill" className="p-2 border rounded" onChange={handleFilterChange}>
          <option value=""> Skill(All)</option>
          <option value="Nursing">Nursing</option>
          <option value="Elderly Care">Elderly Care</option>
          <option value="Child Care">Child Care</option>
          <option value="Child Care">Sign Language</option>
          <option value="Child Care">First Aide</option>

        </select>

        <select name="minRating" className="p-2 border rounded" onChange={handleFilterChange}>
          <option value=""> Min Rating(All)</option>
          <option value="1">1 Star</option>
          <option value="2">2 Stars</option>
          <option value="3">3 Stars</option>
          <option value="4">4 Stars</option>
          <option value="5">5 Stars</option>
        </select>
      </div>

      {filteredProfiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition border border-sage"
            >
              <img
                src={profile.profile_picture}
                alt="Profile"
                className="w-40 h-40 object-cover rounded-full mb-4"
              />
              <h3 className="text-xl font-semibold text-emerald-800 mb-3">{profile.name}</h3>
              <p className="text-gray-700 mb-2">
                <strong className="text-emerald-700">Availability:</strong> {profile.availability}
              </p>
              <p className="text-gray-700 mb-2">
                <strong className="text-emerald-700">Rate:</strong> Ksh {profile.rate} per {profile.rate_type}
              </p>
              <p className="text-gray-700 flex">
                <strong className="text-emerald-700">Ratings:</strong> 
                <StarRating rating={ratings[profile.id] || 0} />
              </p>
              <button
                className="mt-4 px-4 py-2 text-white bg-coral hover:bg-[#C0706A] transition rounded-lg"
                onClick={() => navigate(`/caretaker/${profile.id}`)}
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-10">No profiles match the selected filters.</p>
      )}
    </div>
  );
};

export default CaretakerProfiles;
