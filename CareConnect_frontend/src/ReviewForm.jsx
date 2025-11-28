import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "./api";
import { useNavigate } from "react-router-dom";



const ReviewForm = () => {
    const { id: caretakerId } = useParams();
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const API_BASE_URL = "https://careconnect-2-j2tv.onrender.com";
    // const API_BASE_URL = "http://localhost:8000";

        

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId");
    
        if (!token) {
            alert("Please login to view or rate this caretaker.");
            navigate("/login");  
            return;
        }
    
        api.get(`${API_BASE_URL}/api/caretaker/${caretakerId}/reviews/`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
            if (Array.isArray(response.data)) {
                setReviews(response.data);
                const userReview = response.data.find(review => review.user === userId);
                if (userReview) {
                    alert("You have already reviewed this caretaker.");
                    navigate(`/caretakers`);
                }
            }
        })
        .catch((err) => {
            console.error("Error fetching reviews:", err);
        });
    }, [caretakerId, navigate]);
        
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");  
    
        if (!rating || rating === 0) {
            alert("Please provide a valid rating.");
            return;
        }
    
        const token = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId");
    
        const existingReview = reviews.find(review => review.user === userId);
        if (existingReview) {
            alert("You have already reviewed this caretaker.");
            return;
        }
    
        try {
            const response = await api.post(
                `${API_BASE_URL}/api/caretaker/${caretakerId}/reviews/`,
                {
                    rating,
                    review_text: reviewText || "No additional comments",
                    user: userId,
                    caretaker: caretakerId,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            if (response.status === 201) {
                setReviews([...reviews, response.data]);
                setRating(0);
                setReviewText(""); 
                alert('Caretaker rated succesfully!')
                navigate(`/caretaker/${caretakerId}`);

            }
    
        } catch (error) {
            if (error.response?.status === 400 && error.response.data?.non_field_errors) {
                alert("You have already reviewed this caretaker.");
                navigate("/caretakers");
            } else {
                console.error("Error submitting review:", error.response?.data || error);
                alert("An error occurred while submitting your review. Please try again.");
            }
        }
    };
        
    return (
        <div className="min-h-screen bg-beige py-10 px-4 ">
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit} className="rounded-lg mx-auto p-6 bg-stone-50 w-1/2 shadow-md">
            <div role="button" className="float-right text-2xl text-emerald-800 hover:text-coral transition"  onClick={() => navigate(`/caretakers`)}>✖</div>   
            <h2 className="text-2xl font-semibold mb-4">Leave a Review</h2>
                <label className="block text-xl">
                    Rating:
                    <select
                        className="border  p-2 ml-2"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        required
                    >
                        <option value={0} disabled hidden>
                            Select...
                        </option>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <option key={num} value={num}>
                                {"⭐".repeat(num)} ({num} Star{num > 1 ? "s" : ""})
                            </option>
                        ))}
                    </select>
                </label>
                <label className="block mt-2 text-xl">
                    Review:
                    <textarea
                        className="border w-full p-2 h-32 mt-1"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                    ></textarea>
                </label>
                <button
                    type="submit"
                    className="bg-emerald-800 hover:bg-coral w-full text-white p-2 mt-3 rounded-md"
                >
                    Submit Review
                </button>
            </form>

        </div>
    );
};

export default ReviewForm;
