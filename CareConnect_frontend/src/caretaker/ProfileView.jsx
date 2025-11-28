import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import api from "../api";
import StarRating from "../StarRating";

const ProfileView = () => {
  const [caretaker, setCaretaker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [averageRating, setAverageRating] = useState(0); 
  const [caretakerId, setCaretakerId] = useState(null);
  const API_BASE_URL = "https://careconnect-2-j2tv.onrender.com";
  // const API_BASE_URL = "http://localhost:8000";
  const [formData, setFormData] = useState({
    name: "",
    certifications: "",
    skills: "",
    availability: "",
    profile_picture: "",
    rate: 0,
    rateType: "hour",
    ratings: 0,
  });

  useEffect(() => {
    const fetchCaretaker = async () => {
      try {
        setLoading(true); 
        const userId = localStorage.getItem("userId");
        const response = await api.get(
          `${API_BASE_URL}/api/caretaker-profiles/user/${userId}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
    
        if (response.data) {
          setCaretaker(response.data);
          setCaretakerId(response.data.id);
          setFormData({
            name: response.data.name,
            certifications: response.data.certifications,
            skills: response.data.skills,
            availability: response.data.availability || "Part-time",
            ratings: response.data.ratings,
            profile_picture: response.data.profile_picture,
            rate: response.data.rate || 0,
            rateType: response.data.rate_type || "hour",
        });
      }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError("Profile not found"); 
        } else {
          setError("Error fetching profile"); 
        }
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false); 
      }
    };
      
    fetchCaretaker();
  }, []);
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get(
          `${API_BASE_URL}/api/caretaker/${caretakerId}/reviews/`
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
  
    if (caretakerId) {
      fetchReviews();
    }
  }, [caretakerId]);
  

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      
    });
  };

  const handleImageUpload = () => {
    window.cloudinary.openUploadWidget(
      {
        cloud_name: "dpb7i0th4", 
        upload_preset: "Profile-Pictures", 
        sources: ["local", "url", "camera"],
        multiple: false,
        cropping: true,
        max_file_size: 10000000, 
        client_allowed_formats: ["jpg", "png", "jpeg", "gif"],
      },
      function (error, result) {
        if (error) {
          console.error("Error uploading image", error);
          return;
        }
        if (result.event === "success") {
          console.log("Image uploaded successfully", result.info);
          setFormData({
            ...formData,
            profile_picture: result.info.secure_url, 
          });            console.log("Profile picture URL:", result.info.secure_url)

        }
      }
    );
  };
  useEffect(() => {
    const loadCloudinaryScript = () => {
      const script = document.createElement("script");
      script.src = "https://upload-widget.cloudinary.com/global/all.js";
      script.async = true;
      document.head.appendChild(script);
  
      script.onload = () => {
        console.log("Cloudinary script loaded");
      };
  
      script.onerror = () => {
        console.error("Failed to load Cloudinary script");
      };
    };
  
    if (!window.cloudinary) {
      loadCloudinaryScript();
    }
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    if (!formData.name || !formData.certifications || !formData.skills || !formData.availability) {
      setError("Please fill in all the required fields.");
      return;
    }
  
    const userId = localStorage.getItem("userId");
  
    console.log("Submitting data:", formData);
  
    try {
      const response = await api.put(
        `${API_BASE_URL}/api/caretaker-profiles/user/${userId}/`,
        {
          ...formData,
          profile_picture: formData.profile_picture, 
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setCaretaker(prevState => ({
        ...prevState,
        profile_picture: response.data.profile_picture 
      }));

      console.log("Profile updated successfully:", response.data);
      setCaretaker(response.data); 
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    }
  };
    console.log(formData.profile_picture);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error === "Profile not found") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-beige">
        <div className="p-8 bg-stone-50 rounded-lg shadow-lg w-96">
          <h1 className="text-2xl font-bold mb-6 text-emerald-800">No Profile Found</h1>
          <p className="text-gray-700 mb-6">
            It looks like you don't have a profile yet. Click below to create one!
          </p>
          <Link
            to="/caretaker-profile-create"
            className="w-full bg-emerald-800 text-white p-3 rounded-md text-center hover:bg-emerald-700 hover:text-white transition duration-200 ease-in-out"
          >
            Create Profile
          </Link>
        </div>
      </div>
    );
  }

  if (!caretaker) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error || "Failed to load profile."}
      </div>
    );
  }
    
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-beige">
      <div className="p-8 bg-stone-50 mt-4 rounded-lg shadow-lg w-1/2">
        <h1 className="text-2xl font-bold mb-6 text-emerald-800">Caretaker Profile</h1>
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-lg font-medium">Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-300 rounded-md mb-4"
                required
              />
            </div>
            <div className="mb-4">
              <label className="text-lg font-medium">Certifications:</label>
              <textarea
                name="certifications"
                value={formData.certifications}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-300 rounded-md mb-4"
                required
              />
            </div>
            <div className="mb-4">
              <label className="text-lg font-medium">Skills:</label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-300 rounded-md mb-4"
                required
              />
            </div>
            <div className="mb-4">
              <label className="text-lg font-medium">Availability:</label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-300 rounded-md mb-4"
                required
              />
            </div>
            <div className="mb-4">
              <label className="text-lg font-medium">Profile Picture:</label>
              <button
                type="button"
                onClick={handleImageUpload}
                className="w-full p-3 border-2 border-gray-300 rounded-md mb-4"
              >
                Upload Profile Picture
              </button>
              {formData.profile_picture && (
                <img
                  src={formData.profile_picture}
                  alt="Profile"
                  className="w-full h-48 object-cover rounded-md"
                />
              )}
            </div>
            <div className="mb-4">
              <label className="text-lg font-medium">Rate:</label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-300 rounded-md mb-4"
              />
            </div>
            <div className="mb-4">
              <label className="text-lg font-medium">Rate Type:</label>
              <select
                name="rateType"
                value={formData.rateType}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-300 rounded-md mb-4"
              >
                <option value="hour">Per Hour</option>
                <option value="day">Per Day</option>
                <option value="week">Per Week</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-800 text-white p-3 rounded-md hover:bg-emerald-700"
            >
              Save Changes
            </button>
          </form>
        ) : (
          <div>
            {caretaker.profile_picture ? (
                <img
                  src={caretaker.profile_picture}
                  alt="Profile"
                  className="w-40 h-40 object-cover rounded-full mb-4"
                />
              ) : (
                <p>No profile picture available</p>
              )}
            <h2 className="text-xl font-medium mb-4">{caretaker.name}</h2>
            <p className="mb-2"><strong>Certifications:</strong> {caretaker.certifications}</p>
            <p className="mb-2"><strong>Skills: </strong>{caretaker.skills}</p>
            <p className="mb-2"><strong>Availability: </strong>{caretaker.availability}</p>
            <p className="mb-2"><strong>Rate:</strong> {caretaker.rate} Ksh per {caretaker.rate_type}</p>
            <p className="mb-4 flex"><strong>Ratings: </strong><p className="mt-1">
              <StarRating rating={averageRating} />
            </p></p>
            <button
              onClick={handleEdit}
              className="w-full bg-emerald-800 text-white p-3 rounded-md mb-4 hover:bg-emerald-700"
            >
              Edit Profile
            </button>
          </div>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default ProfileView;

