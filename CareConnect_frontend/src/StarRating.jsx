import React from 'react';

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating); 
  const halfStars = rating % 1 !== 0 ? 1 : 0; 
  const emptyStars = 5 - fullStars - halfStars; 
  
  return (
    <div className="flex">
      {[...Array(fullStars)].map((_, index) => (
        <svg key={`full-${index}`} className="w-5 h-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      ))}
      
      {halfStars === 1 && (
        <svg className="w-5 h-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      )}
      
      {[...Array(emptyStars)].map((_, index) => (
        <svg key={`empty-${index}`} className="w-5 h-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      ))}
    </div>
  );
};

export default StarRating;
