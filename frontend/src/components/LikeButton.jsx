import { useState, useRef } from "react";
import { ThumbsUp } from "lucide-react";
import API from "../api";
import { useParams } from "react-router";

const LikeButton = ({ initialLiked, initialLikeCount }) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const { videoId } = useParams();
  const isUpdating = useRef(false); // Prevent duplicate clicks

  const toggleLike = async () => {
    if (isUpdating.current) return; // Avoid multiple rapid clicks
    isUpdating.current = true;

    try {
      const res = await API.post(`/likes/toggle/v/${videoId}`);
      
      if (res.status === 200) {
        setLiked((prevLiked) => !prevLiked);
        setLikeCount((prevCount) => (liked ? prevCount - 1 : prevCount + 1));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      isUpdating.current = false; // Reset after API call
    }
  };

  return (
    <button
      onClick={toggleLike}
      className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all hover:cursor-pointer ${
        liked ? "text-blue-500" : "text-gray-500"
      }`}
    >
      <ThumbsUp
        className={`w-6 h-6 ${liked ? "fill-blue-500 stroke-none" : "stroke-gray-500"}`}
      />
      <span className="text-lg font-medium">{likeCount}</span>
    </button>
  );
};

export default LikeButton;
