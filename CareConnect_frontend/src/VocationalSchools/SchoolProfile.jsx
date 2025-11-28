import { useState, useEffect } from "react";
import api from "../api";

const SchoolProfile = () => {
  const [school, setSchool] = useState(null);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const API_BASE_URL = "https://careconnect-2-j2tv.onrender.com";
  // const API_BASE_URL = "http://localhost:8000";

  const [formData, setFormData] = useState({
    name: "",
    logo: null,
    description: "",
    location: "",
  });
  const [preview, setPreview] = useState(null); 

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    api
      .get(`${API_BASE_URL}/api/school/`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      })
      .then((res) => {
        setSchool(res.data);
        setFormData({
          name: res.data.name || "",
          location: res.data.location || "",
          description: res.data.description || "",
          logo: null, 
        });
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setProfileNotFound(true);
        } else {
          console.error("Error fetching school profile:", err);
        }
      });
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "logo") {
      const file = e.target.files[0];
      if (file) {
        setFormData({ ...formData, logo: file });
        setPreview(URL.createObjectURL(file)); 
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleCreate = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("description", formData.description);
      if (formData.logo instanceof File) {
        formDataToSend.append("logo", formData.logo);
      }
  
      const res = await api.post(`${API_BASE_URL}/api/school/`, formDataToSend, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data",
        },
      });
  
      setSchool(res.data); 
      setProfileNotFound(false);
      setIsEditing(false);
      console.log("Created new school profile:", res.data);
  
    } catch (err) {
      console.error("Error creating school profile:", err.response?.data || err.message);
    }
  };
  

  const handleUpdate = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("description", formData.description);
      if (formData.logo instanceof File) {
        formDataToSend.append("logo", formData.logo); 
      }
  
      const res = await api.patch(`${API_BASE_URL}/api/school/`, formDataToSend, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data",
        },
      });
  
      setSchool((prev) => ({
        ...prev,
        ...res.data, 
        logo: res.data.logo || prev.logo, 
      }));
  
      setIsEditing(false);
      console.log("Updated school profile:", res.data);

      setPreview(null); 
    } catch (err) {
      console.error("Error updating school profile:", err.response?.data || err.message);
    }
  };
  
  return (
    <div className="w-full min-h-screen text-gray-700 bg-beige p-6">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-8">
          {profileNotFound ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">No school profile found. Please create one.</p>
              <ProfileForm formData={formData} handleChange={handleChange} handleSubmit={handleCreate} buttonText="Create Profile" />
            </div>
          ) : school ? (
            <div className="text-center">
              {school.logo && !preview && (
                <img
                  src={`https://res.cloudinary.com/dpb7i0th4/${school.logo}`}
                  alt="School Logo"
                  className="w-32 h-32 rounded-full mx-auto object-cover mb-4"
                />
              )}
              {preview && (
                <img src={preview} alt="Preview" className="w-32 h-32 rounded-full mx-auto object-cover mb-4" />
              )}
              <p className="text-2xl font-medium">{school.name}</p>
              <p className="text-gray-600 text-lg">{school.location}</p>
              <p className="text-gray-700 text-lg italic mt-2">{school.description}</p>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 bg-emerald-800 w-1/4 text-white px-6 py-2 rounded-md hover:bg-coral transition-all"
                >
                  Edit Profile
                </button>
              ) : (
                <ProfileForm
                  formData={formData}
                  handleChange={handleChange}
                  preview={preview}
                  handleSubmit={handleUpdate}
                  buttonText="Save Changes"
                  onCancel={() => setIsEditing(false)}
                />
              )}
            </div>
          ) : (
            <p className="text-gray-600 text-center">Loading...</p>
          )}
        </div>
        </div>
          );
        };
        
        const ProfileForm = ({ formData, handleChange, preview, handleSubmit, buttonText, onCancel }) => (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <span role="button" onClick={onCancel} className="text-2xl m-2 float float-right text-emerald-800 hover:text-coral">✖</span> <br />
        <label className="float float-left ml-1 mb-2 text-lg">School Name:</label>    
        <input
          type="text"
          name="name"
          placeholder="School Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md mb-3"
        />
        <label className="float float-left ml-1 mb-2 text-lg">Location:</label>    
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md mb-3"
        />
        <label className="float float-left ml-1 mb-2 text-lg">Description:</label> 
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md mb-3"
        ></textarea>
        <label className="float float-left ml-1 mb-2 text-lg">Logo:</label> 
        <input
          type="file"
          name="logo"
          accept="image/*"
          onChange={handleChange}
          className="block w-full text-gray-700 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:border-none file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
        />
        {preview && <img src={preview} alt="Preview" className="w-24 h-24 rounded-full object-cover mt-2" />}
        <div className="flex justify-between mt-4">
          <button
            onClick={handleSubmit}
            className="bg-emerald-800 w-full text-white px-6 py-2 rounded-md hover:bg-coral transition-all"
          >
            {buttonText}
          </button>
        </div>
          </div>
);

export default SchoolProfile;
