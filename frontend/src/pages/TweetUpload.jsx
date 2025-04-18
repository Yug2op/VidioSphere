import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const TweetUpload = () => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim().length === 0) {
      setError("Tweet cannot be empty.");
      return;
    }
    if (content.length > 280) {
      setError("Tweet must be within 280 characters.");
      return;
    }

    try {
      await API.post("/tweets/upload/tweet", { content }, { withCredentials: true });
      navigate("/twitter"); // Redirect to home after upload
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload tweet.");
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-900 min-h-screen p-4">
      <div className="bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg w-full max-w-sm md:max-w-md lg:max-w-lg">
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-300">Post a Tweet</h2>
        {error && <p className="text-red-500 text-xs md:text-sm">{error}</p>}
        <textarea
          className="w-full h-24 md:h-32 text-white bg-gray-600 border p-2 rounded-md text-sm md:text-base"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white text-sm md:text-base px-4 py-2 rounded-md mt-3 hover:bg-blue-600 w-full"
        >
          Tweet
        </button>
      </div>
    </div>
  );
};

export default TweetUpload;
