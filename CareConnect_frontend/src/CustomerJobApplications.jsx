import { useState, useEffect } from 'react';
import api from "./api";
import Chat from './Chat';

function CustomerJobApplications() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [editingJobId, setEditingJobId] = useState(null);
  const API_BASE_URL = "https://careconnect-2-j2tv.onrender.com";
  // const API_BASE_URL = "http://localhost:8000";
  const [updatedJobDetails, setUpdatedJobDetails] = useState({
    title: '',
    description: '',
    required_skills: '',
    location: '',
    pay_rate: '',
    rate_type: '',
    duration: '',
    status: '',
  });
  const [chatOpen, setChatOpen] = useState({}); 
  const customerId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchApplicationsAndJobs = async () => {
      try {
        const [applicationsResponse, jobsResponse] = await Promise.all([
          api.get(`${API_BASE_URL}/api/applications/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }),
          api.get(`${API_BASE_URL}/api/jobs/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }),
        ]);
  
        setApplications(applicationsResponse.data);
        const customerJobs = jobsResponse.data.filter(job => job.customer_id === Number(customerId));
        setJobs(customerJobs);
      } catch (error) {
        console.error("Error fetching applications and jobs:", error);
        setError("Failed to fetch jobs or applications.");
      }
    };
    fetchApplicationsAndJobs();
  }, [customerId]);

  const handleEditClick = (jobId) => {
    const job = jobs.find(job => job.id === jobId);
    setEditingJobId(jobId);
    setUpdatedJobDetails({
      title: job.title,
      description: job.description,
      required_skills: job.required_skills,
      location: job.location,
      pay_rate: job.pay_rate,
      rate_type: job.rate_type,
      duration: job.duration,
      status: job.status,
    });
  };

  const handleJobUpdate = async (jobId, updatedJobDetails) => {
    updatedJobDetails.pay_rate = parseFloat(updatedJobDetails.pay_rate); 
    try {
      await api.put(`${API_BASE_URL}/api/jobs/${jobId}/`, updatedJobDetails, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      alert("Job updated successfully");
      setEditingJobId(null);
      const updatedJobsResponse = await api.get(`${API_BASE_URL}/api/jobs/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      const customerJobs = updatedJobsResponse.data.filter(job => job.customer_id === Number(customerId));
      setJobs(customerJobs);
    } catch (error) {
      console.error("Error updating job:", error);
      alert("Failed to update job. Please try again.");
    }
  };

  const handleJobDelete = async (jobId) => {
    try {
      await api.delete(`${API_BASE_URL}/api/jobs/${jobId}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      alert("Job deleted successfully");
      setJobs(jobs.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job. Please try again.");
    }
  };

  const toggleChat = (applicationId) => {
    setChatOpen((prev) => ({ ...prev, [applicationId]: !prev[applicationId] }));
  };
  
  const handleHireCaretaker = async (applicationId) => {
    try {
      await api.patch(`${API_BASE_URL}/api/applications/${applicationId}/update/`, { status: "Hired" }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      alert("Caretaker successfully hired!");
      setApplications(prev => prev.map(app => app.id === applicationId ? { ...app, status: "Hired" } : app));
    } catch {
      alert("Failed to hire caretaker. Please try again.");
    }
  };
  
  const handleRejectCaretaker = async (applicationId) => {
    try {
      await api.patch(`${API_BASE_URL}/api/applications/${applicationId}/update/`, { status: "Rejected" }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      alert("Caretaker successfully rejected!");
      setApplications(prev => prev.map(app => app.id === applicationId ? { ...app, status: "Rejected" } : app));
    } catch {
      alert("Failed to reject caretaker. Please try again.");
    }
  };

  return (
    <div className="bg-beige min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-emerald-dark">Job Applications & Jobs</h2>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        {/* Job Applications */}
        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-emerald-dark">Job Applications</h3>
          {applications.length === 0 ? (
            <p className="text-center text-sage">No applications for your jobs yet.</p>
          ) : (
            <div className="grid gap-6">
              {applications.map(app => (
                <div key={app.id} className="p-5 bg-alabaster rounded-lg shadow hover:shadow-lg transition border border-gray-200">
                  <h4 className="text-xl font-semibold text-emerald-dark">Job: {app.job_title}</h4>
                  <p className="mt-2 text-gray-700"><span className="font-semibold italic">Applicant:</span> {app.caretaker}</p>
                  <p className="mt-2 text-gray-700">
                    <span className="font-semibold italic">Cover Letter:</span> {app.cover_letter || <span className="text-gray-400 italic">No cover letter provided</span>}
                  </p>
                  <p className="mt-2 text-gray-700"><span className="font-semibold italic">Status:</span> {app.status}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {app.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleHireCaretaker(app.id)}
                          className="py-2 px-4 bg-emerald-800 text-white font-semibold rounded-md hover:bg-coral transition"
                        >
                          Hire Caretaker
                        </button>
                        <button
                          onClick={() => handleRejectCaretaker(app.id)}
                          className="py-2 px-4 bg-sage text-gray-700 font-semibold rounded-md hover:bg-coral transition"
                        >
                          Reject Caretaker
                        </button>
                      </>
                    )}
                    {app.status === "Hired" && (
                      <button disabled className="py-2 px-4 bg-emerald-800 text-white font-semibold rounded-md">Caretaker Hired</button>
                    )}
                    {app.status === "Rejected" && (
                      <button disabled className="py-2 px-4 bg-emerald-800 text-white font-semibold rounded-md">Caretaker Rejected</button>
                    )}

                    <button
                      onClick={() => toggleChat(app.id)}
                      className="py-2 px-4 bg-coral text-white font-semibold rounded-md hover:bg-emerald-700 transition"
                    >
                      {chatOpen[app.id] ? "Close Chat" : "Contact Caretaker"}
                    </button>
                  </div>

                  {chatOpen[app.id] && (
                    <div className="mt-4">
                      <Chat customerId={customerId} caregiverId={app.caretaker_user_id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Jobs Section */}
        <section>
          <h3 className="text-2xl font-semibold mb-6 text-emerald-dark">Your Jobs</h3>
          {jobs.length === 0 ? (
            <p className="text-center text-sage">No jobs posted yet.</p>
          ) : (
            <div className="grid gap-6">
              {jobs.map(job => (
                <div key={job.id} className="p-5 bg-alabaster rounded-lg shadow hover:shadow-lg transition border border-gray-200">
                  {editingJobId === job.id ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleJobUpdate(job.id, updatedJobDetails); }} className="space-y-4">
                      {Object.entries(updatedJobDetails).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-semibold mb-1 capitalize">{key.replace('_', ' ')}</label>
                          {key === 'description' || key === 'required_skills' ? (
                            <textarea
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:outline-none"
                              value={value}
                              onChange={(e) => setUpdatedJobDetails({...updatedJobDetails, [key]: e.target.value})}
                            />
                          ) : key === 'rate_type' ? (
                            <select
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:outline-none"
                              value={value}
                              onChange={(e) => setUpdatedJobDetails({...updatedJobDetails, [key]: e.target.value})}
                            >
                              <option value="hourly">Hourly</option>
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                            </select>
                          ) : (
                            <input
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:outline-none"
                              type={key === 'pay_rate' ? 'number' : 'text'}
                              value={value}
                              onChange={(e) => setUpdatedJobDetails({...updatedJobDetails, [key]: e.target.value})}
                            />
                          )}
                        </div>
                      ))}
                      <button type="submit" className="py-2 px-4 bg-coral text-white font-semibold rounded-md hover:bg-emerald-800 transition">Save Changes</button>
                    </form>
                  ) : (
                    <div className="space-y-2">
                      <h4 className="text-xl font-semibold text-emerald-dark">Title: {job.title}</h4>
                      <p><span className="font-semibold">Description:</span> {job.description}</p>
                      <p><span className="font-semibold">Skills:</span> {job.required_skills}</p>
                      <p><span className="font-semibold">Location:</span> {job.location}</p>
                      <p><span className="font-semibold">Pay Rate:</span> {job.pay_rate} per {job.rate_type}</p>
                      <p><span className="font-semibold">Duration:</span> {job.duration}</p>
                      <p><span className="font-semibold">Status:</span> {job.status}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button className="py-2 px-4 bg-emerald-800 text-white font-semibold rounded-md hover:bg-coral transition" onClick={() => handleEditClick(job.id)}>Edit Job</button>
                        <button className="py-2 px-4 bg-coral text-white font-semibold rounded-md hover:bg-emerald-800 transition" onClick={() => handleJobDelete(job.id)}>Delete Job</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default CustomerJobApplications;
