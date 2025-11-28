import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_BASE_URL = "https://careconnect2.onrender.com";
    // const API_BASE_URL = "http://localhost:8000";

  
  useEffect(() => {
    api
      .get(`${API_BASE_URL}/api/admin/job-posts/`)
      .then((res) => setJobs(res.data))
      .catch((error) => setError("Error fetching jobs: " + (error.response ? error.response.data : error.message)));
  }, []);

  const updateJobStatus = (id, status) => {
    api
      .patch(`${API_BASE_URL}/api/admin/jobs/${id}/`, { status })
      .then(() => {
        api.get(`${API_BASE_URL}/api/admin/job-posts/`)
          .then((response) => setJobs(response.data))
          .catch((error) => setError("Error fetching jobs: " + (error.response ? error.response.data : error.message)));
      })
      .catch((error) => {
        setError("Error updating job status: " + (error.response ? error.response.data : error.message));
      });
  };

  const Delete = (id) => {
    api
      .delete(`${API_BASE_URL}/api/admin/job-posts/${id}/`)
      .then(() => {
        setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
        alert("Job deleted successfully");
      })
      .catch((error) => {
        setError("Error deleting job: " + (error.response ? error.response.data : error.message));
      });
  };

  const handleStatusChange = (id, status) => {
    updateJobStatus(id, status);
  };

  return (
    <div className="p-6 bg-beige text-gray-700 min-h-screen">
      <h2 className="text-2xl font-bold">Job Management</h2>
      {error && <div className="text-red-500">{error}</div>} 

      <table className="w-full mt-4 bg-white shadow rounded-lg table-auto">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-3 text-left">ID</th>
            <th className="border p-3 text-left">Job Title</th>
            <th className="border p-3 text-left">Description</th>
            <th className="border p-3 text-left">Required Skills</th>
            <th className="border p-3 text-left">Duration</th>
            <th className="border p-3 text-left">Location</th>
            <th className="border p-3 text-left">Pay Rate</th>
            <th className="border p-3 text-left">Rate Type</th>
            <th className="border p-3 text-left">Status</th>
            <th className="border p-3 text-left">Change Status</th>
            <th className="border p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-b">
              <td className="border p-3 text-center">{job.id}</td>
              <td role="button" onClick={() => navigate(`/applications/${job.id}`)} className="border p-3 hover:text-coral">{job.title}</td>
              <td className="border p-3">{job.description}</td>
              <td className="border p-3">{job.required_skills}</td>
              <td className="border p-3">{job.duration}</td>
              <td className="border p-3">{job.location}</td>
              <td className="border p-3">{job.pay_rate}</td>
              <td className="border p-3">{job.rate_type}</td>
              <td className="border p-3">{job.status}</td>
              <td className="border p-3">
                <select
                  value={job.status}
                  className="px-4 py-2 text-white rounded bg-emerald-800 hover:bg-emerald-700"
                  onChange={(e) => handleStatusChange(job.id, e.target.value)}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </td>
              <td className="p-3 text-center">
                <button
                  className="px-4 py-2 text-white rounded bg-coral hover:bg-emerald-800"
                  onClick={() => Delete(job.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Jobs;
