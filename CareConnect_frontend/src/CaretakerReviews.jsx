import React, { useState, useEffect } from 'react';
import api from "./api";
import { useNavigate, useParams } from 'react-router-dom';
import StarRating from './StarRating';

const CaretakerReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { caretakerId } = useParams();
    const navigate = useNavigate();
    const API_BASE_URL = "https://careconnect-2-j2tv.onrender.com";
    // const API_BASE_URL = "http://localhost:8000";


    useEffect(() => {
        const fetchReviews = async () => {
            const token = localStorage.getItem('accessToken');
            try {
                const response = await api.get(
                    `${API_BASE_URL}/api/caretaker/${caretakerId}/reviews/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (response.status === 200) {
                    setReviews(response.data); 
                }
            } catch (err) {
                console.error("Error fetching reviews:", err);
                setError('An error occurred while fetching the reviews.');
                if (err.response && err.response.status === 401) {
                    alert("Please login to view reviews.");
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [caretakerId, navigate]);

      
    return (
        <div className="mx-auto bg-beige w-full min-h-screen p-4">
                                       <div
          role="button"
          className="float-right text-3xl mr-4 m text-emerald-800 hover:text-coral transition"
          onClick={() => navigate(`/caretaker/${caretakerId}`)}
        >
          &times;
        </div>

            {loading && <p>Loading reviews...</p>}

            {reviews.length > 0 ? (
                <ul className="space-y-4 text-emerald-800">
                    {reviews.map((review) => (
                        <li key={review.id} className="p-4 bg-stone-50
                         border rounded-md shadow-md">
                            <h3 className="font-semibold flex text-lg">{review.reviewer_name}</h3>
                            <h3 className="font-semibold flex ">Rating:<p className='mt-1'>
                                <StarRating  rating={review.rating} />
                            </p></h3>
                            <p>{review.review_text}</p>
                            <p className="text-sm text-gray-500">Posted on {new Date(review.created_at).toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No reviews yet.</p>
            )}
        </div>
    );
};

export default CaretakerReviews;
