import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "./api";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import Chat from "./Chat";

const CaretakerProfileDetails = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();
  const customerId = localStorage.getItem("userId");
  const API_BASE_URL = "https://careconnect2.onrender.com";
    // const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    api
      .get(`${API_BASE_URL}/api/caretaker-profiles/${id}/`)
      .then((response) => {
        setProfile(response.data);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
      });
  }, [id]);
  const handleReviewClick = () => {
        navigate(`/review/${profile.id}`);
      };
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get(
          `${API_BASE_URL}/api/caretaker/${id}/reviews/`
        );
        const reviews = response.data;
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
          const averageRating = totalRating / reviews.length;
          setAverageRating(averageRating);
        } else {
          setAverageRating(0);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    if (id) {
      fetchReviews();
    }
  }, [id]);
  if (!profile) {
    return <p className="text-center text-gray-600 mt-10">Loading...</p>;
  }
  console.log(id)

  return (
    <div className="min-h-screen bg-beige py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div
          role="button"
          className="float-right text-3xl text-coral hover:text-emerald-800 transition"
          onClick={() => navigate(`/caretakers`)}
        >
          &times;
        </div>
        <img
          src={profile.profile_picture}
          alt="Profile"
          className="w-40 h-40 object-cover rounded-full mb-4"
        />
        <h3 className="text-2xl font-bold text-emerald-800 mb-2">{profile.name}</h3>
        <p className="text-gray-700 text-lg">
          <strong className="text-emerald-700">Certifications:</strong> {profile.certifications}
        </p>
        <p className="text-gray-700 text-lg">
          <strong className="text-emerald-700">Skills:</strong> {profile.skills}
        </p>
        <p className="text-gray-700 text-lg">
          <strong className="text-emerald-700">Availability:</strong> {profile.availability}
        </p>
        <p className="text-gray-700 text-lg">
          <strong className="text-emerald-700">Rate:</strong> Ksh {profile.rate} per {profile.rate_type} 
        </p>
        <p className="text-gray-700 text-lg flex">
          <strong className="text-emerald-700">Ratings:</strong>
          <span className="mt-1">
            <StarRating rating={averageRating} />
          </span>
        </p>
        <button
          onClick={handleReviewClick}
          className="mt-4 px-4 w-1/3 py-2 h-18 text-white bg-coral hover:bg-emerald-800 hover:text-white transition rounded-lg"
        >
          Rate Caretaker
        </button>
        <button
          className="mt-4 px-4 py-2 w-1/3 ml-2 text-white bg-coral hover:bg-emerald-800 hover:text-white transition rounded-lg"
          onClick={() => navigate(`/caretaker/${profile.id}/reviews`)}
        >
          View Reviews
        </button>
        <button
  onClick={() => setChatOpen(!chatOpen)}
  className="mt-4 w-1/4 ml-2 px-4 py-2 bg-coral text-white rounded-lg"
>
  {chatOpen ? "Close Chat" : "Chat"}
</button>
        {chatOpen && <Chat customerId={customerId} caregiverId={profile.user} />}

      </div>
    </div>
  );
};
export default CaretakerProfileDetails;


