import { useState, useEffect } from 'react';
import api from "./api";

function JobApplications() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState({});
  const [applicationStatus, setApplicationStatus] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const API_BASE_URL = "https://careconnect2.onrender.com";
    // const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const fetchJobsAndApplications = async () => {
      try {
        const jobsResponse = await api.get(`${API_BASE_URL}/api/jobs/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        setJobs(jobsResponse.data);

        const applicationsResponse = await api.get(`${API_BASE_URL}/api/applications/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });

        const appliedJobsMap = {};
        const statusMap = {};
        applicationsResponse.data.forEach(application => {
          appliedJobsMap[application.job] = true;
          statusMap[application.job] = application.status;
        });

        setHasApplied(appliedJobsMap);
        setApplicationStatus(statusMap);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load jobs. Please try again later.");
      }
    };

    fetchJobsAndApplications();
  }, []);

  const openModal = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCoverLetter("");
    setSelectedJob(null);
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    try {
      await api.post(`${API_BASE_URL}/api/applications/`, { job: selectedJob.id, cover_letter: coverLetter }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setHasApplied(prev => ({ ...prev, [selectedJob.id]: true }));
      alert("Applied successfully! We shall get back to you soon!");
      closeModal();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.detail);
      } else {
        console.error("Error applying for the job:", error);
        alert("Error applying for the job. Please try again.");
      }
    }
  };

  return (
    <div className="bg-beige min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-emerald-dark">Available Jobs</h2>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <div className="grid gap-6">
          {jobs.length === 0 ? (
            <p className="text-center text-sage">No jobs available at the moment.</p>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="p-5 bg-alabaster rounded-lg shadow hover:shadow-lg transition border border-gray-200">
                <h3 className="text-xl font-semibold text-emerald-dark">{job.title}</h3>
                <p className="mt-2 text-gray-700"><span className="font-semibold">Description:</span> {job.description}</p>
                <p className="mt-1 text-gray-700"><span className="font-semibold">Skills:</span> {job.required_skills}</p>
                <p className="mt-1 text-gray-700"><span className="font-semibold">Location:</span> {job.location}</p>
                <p className="mt-1 text-gray-700"><span className="font-semibold">Pay Rate:</span> {job.pay_rate} per {job.rate_type}</p>
                <p className="mt-1 text-gray-700"><span className="font-semibold">Duration:</span> {job.duration}</p>
                <p className="mt-1 text-gray-700"><span className="font-semibold">Status:</span> {job.status}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {job.status === "Open" && !hasApplied[job.id] && (
                    <button
                      onClick={() => openModal(job)}
                      className="py-2 px-4 bg-coral text-white font-semibold rounded-md hover:bg-emerald-800 transition"
                    >
                      Apply for this Job
                    </button>
                  )}
                  {job.status === "Open" && hasApplied[job.id] && (
                    <button
                      disabled
                      className="py-2 px-4 bg-emerald-800 text-white font-semibold rounded-md cursor-not-allowed"
                    >
                      {applicationStatus[job.id]}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-alabaster p-6 rounded-lg shadow-lg w-11/12 md:w-2/5 max-h-[80vh] flex flex-col">
            <h3 className="text-xl font-semibold mb-4 text-emerald-dark">Apply for {selectedJob?.title}</h3>
            <textarea
              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 mb-4 resize-none"
              placeholder="Enter your cover letter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-emerald-800 hover:bg-coral text-white rounded-md transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-coral hover:bg-emerald-800 text-white rounded-md transition"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobApplications;
