import { useState } from 'react';
import api from "./api";

function CreateJobPost() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [requiredSkills, setRequiredSkills] = useState('');
    const [payRate, setPayRate] = useState('');
    const [rateType, setRateType] = useState('hour');
    const [duration, setDuration] = useState('');
    const [status, setStatus] = useState('Open');
    const API_BASE_URL = "https://careconnect-2-j2tv.onrender.com";
    // const API_BASE_URL = "http://localhost:8000";


    const handleSubmit = async (e) => {
        e.preventDefault();
        const jobData = {
            title,
            description,
            location,
            required_skills: requiredSkills,
            pay_rate: payRate,
            rate_type: rateType,
            duration,
            status
        };
        try {
            await api.post(`${API_BASE_URL}/api/jobs/`, jobData, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                  'Content-Type': 'application/json',
                },
              });
            alert("Job posted successfully");
        } catch (error) {
            console.error(error);
            alert("Error posting job");
        }
    };

    return (
        <div className="bg-[#e3e7da] min-h-screen flex items-center justify-center py-12 px-6">
            <div className="max-w-4xl w-full bg-white p-8 text-gray-700 shadow-lg rounded-lg">
                <h2 className="text-3xl font-semibold text-center mb-6">Post a New Job</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-700 font-semibold">Job Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Job Title"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="description" className="block text-gray-700 font-semibold">Job Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Job Description"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="location" className="block text-gray-700 font-semibold">Location</label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Location"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="requiredSkills" className="block text-gray-700 font-semibold">Required Skills</label>
                        <textarea
                            id="requiredSkills"
                            value={requiredSkills}
                            onChange={(e) => setRequiredSkills(e.target.value)}
                            placeholder="List of Required Skills"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="payRate" className="block text-gray-700 font-semibold">Pay Rate</label>
                            <input
                                type="number"
                                id="payRate"
                                value={payRate}
                                onChange={(e) => setPayRate(e.target.value)}
                                placeholder="Pay Rate"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="rateType" className="block text-gray-700 font-semibold">Rate Type</label>
                            <select
                                id="rateType"
                                value={rateType}
                                onChange={(e) => setRateType(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="hour">Hour</option>
                                <option value="day">Day</option>
                                <option value="week">Week</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="duration" className="block text-gray-700 font-semibold">Job Duration</label>
                        <input
                            type="text"
                            id="duration"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="Job Duration (e.g., 3 weeks)"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="status" className="block text-gray-700 font-semibold">Job Status</label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                            <option value="In Progress">In Progress</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-coral text-white font-semibold rounded-md hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        Post Job
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateJobPost;
