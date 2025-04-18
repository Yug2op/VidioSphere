import { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";
import API from "../api";
import { useParams } from "react-router";

const VideoLikeButton = () => {
    const { videoId } = useParams();
    const [likeCount, setLikeCount] = useState(0);
    const [liked, setLiked] = useState(false);
    

    // Fetch like status when component mounts
    useEffect(() => {
        const fetchLikeStatus = async () => {
            try {
                const res = await API.get(`/videos/${videoId}`);
                setLikeCount(res.data.likeCount);
                setLiked(res.data.likedByUser);
                
                
            } catch (error) {
                console.error("Error fetching like status", error);
            }
        };

        fetchLikeStatus();
    }, [videoId]);
    
    // Function to handle like toggle
    const handleLikeToggle = async () => {
        try {
            const res = await API.post(`/likes/toggle/v/${videoId}`);

            if (res.data.success) {
                setLiked(res.data.data.likedBy); // Update the liked state
                setLikeCount((prevCount) => (res.data.data.likedBy ? prevCount - 1 : prevCount + 1)); // Update the like count
            }
        } catch (error) {
            console.error("Error toggling like", error);
        }
    };

    return (
        <button
            className={`flex items-center gap-2 px-3 py-1 rounded-md transition-all duration-100 ${
                liked ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
            onClick={handleLikeToggle}
        >
            <ThumbsUp className="w-5 h-5" />
            <span>{isNaN(likeCount) ? 0 : likeCount}</span>
        </button>
    );
};

export default VideoLikeButton;
