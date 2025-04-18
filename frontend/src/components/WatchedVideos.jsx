import { useEffect, useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";

const WatchedVideos = () => {
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchWatchHistory();
  }, []);

  const fetchWatchHistory = async () => {
    try {
      setLoading(true);
      const userResponse = await API.get("/users/current-user");
      if (userResponse.data.success) {
        const history = userResponse.data.data?.watchHistory || [];
        setWatchHistory(history);
        if (history.length > 0) {
          setPage(0); // Reset page
          fetchVideos(history, 0, true); // Fetch first 5 videos
        } else {
          setLoading(false);
          setHasMore(false);
        }
      } else {
        setError("Failed to fetch watch history.");
      }
    } catch (error) {
      setError("Error fetching watched videos.");
      console.error(error);
    }
  };

  const fetchVideos = async (history, pageNumber, reset = false) => {
    setLoading(true);
    try {
      const startIndex = pageNumber * 5;
      const paginatedIds = history.slice(startIndex, startIndex + 5);

      if (paginatedIds.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      const videoDetailsPromises = paginatedIds.map(videoId =>
        API.get(`/videos/${videoId}`)
      );

      const videosResponse = await Promise.all(videoDetailsPromises);
      const videos = videosResponse.map(res => res.data.data.video);

      setWatchedVideos(prev => (reset ? videos : [...prev, ...videos]));

      // Correct hasMore logic
      setHasMore(startIndex + 5 < history.length);
    } catch (error) {
      setError("Error fetching videos.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchVideos(watchHistory, nextPage);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Watch History</h2>

      {error && <p className="text-red-500">{error}</p>}

      {loading && watchedVideos.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : watchedVideos.length === 0 ? (
        <p className="text-gray-500 text-center">No watch history available.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {watchedVideos.map((video) => (
            <Link
              to={`/video/${video._id}`}
              key={video._id}
              className="flex flex-col sm:flex-row gap-4 border-b pb-4 p-2 rounded-lg transition transform hover:scale-105 duration-300"
            >
              <div className="w-full sm:w-60 flex-shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-36 sm:h-24 object-cover rounded-lg"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold">{video.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                <p className="text-sm text-gray-500">
                  {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white font-semibold transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default WatchedVideos;
