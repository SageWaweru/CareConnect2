import { useState, useEffect } from "react";
import axios from "axios";

const AdminStats = () => {
    const [userCount, setUserCount] = useState(0);
    const [jobCount, setJobCount] = useState(0);
    const [schoolCount, setSchoolCount] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);

    useEffect(() => {
      // Fetch users data
      axios.get("http://127.0.0.1:8000/api/admin/users/")
        .then((response) => {
          // Set the number of users
          setUserCount(response.data.length);  // assuming the response contains an array of users
        })
        .catch((error) => {
          console.error("There was an error fetching the users:", error);
        });
    }, []);

    useEffect(() => {
        // Fetch users data
        axios.get("http://127.0.0.1:8000/api/admin/job-posts/")
          .then((response) => {
            // Set the number of users
            setJobCount(response.data.length);  // assuming the response contains an array of users
          })
          .catch((error) => {
            console.error("There was an error fetching the users:", error);
          });
      }, []);

      useEffect(() => {
        // Fetch users data
        axios.get("http://127.0.0.1:8000/api/schools/")
          .then((response) => {
            // Set the number of users
            setSchoolCount(response.data.length);  // assuming the response contains an array of users
          })
          .catch((error) => {
            console.error("There was an error fetching the users:", error);
          });
      }, []);
      useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/admin/reviews/")
          .then((response) => {
            setReviewCount(response.data.length);  
          })
          .catch((error) => {
            console.error("There was an error fetching the users:", error);
          });
      }, []);

  
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        <div className="p-4 bg-white shadow rounded-lg">
          <h2 className="text-lg font-semibold">👤 Users</h2>
          <p className="text-2xl font-bold">{userCount}</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg">
          <h2 className="text-lg font-semibold">📋 Jobs</h2>
          <p className="text-2xl font-bold">{jobCount}</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg">
          <h2 className="text-lg font-semibold">🏫 Schools</h2>
          <p className="text-2xl font-bold">{schoolCount}</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg">
          <h2 className="text-lg font-semibold">⭐ Reviews</h2>
          <p className="text-2xl font-bold">{reviewCount}</p>
        </div>
      </div>
    );
  };
  
  export default AdminStats;
  