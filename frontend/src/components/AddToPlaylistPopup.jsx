import { useEffect, useState } from "react";
import API from "../api";
import { Search, X } from "lucide-react";

export default function AddToPlaylistPopup({ isOpen, onClose, playlistId }) {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedVideos, setSelectedVideos] = useState([]);  

  // Fetch videos when popup opens
  useEffect(() => {
    if (isOpen) {
      const fetchVideos = async () => {
        try {
          const res = await API.get("/videos");
          setVideos(res.data?.data || []);
        } catch (error) {
          console.error("Error fetching videos:", error);
        }
      };
      fetchVideos();
    }
  }, [isOpen]);

  // Filter videos based on search query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredVideos(videos);
    } else {
      const results = videos.filter((video) =>
        video.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredVideos(results);
    }
  }, [query, videos]);

  // Handle video selection
  const toggleVideoSelection = (videoId) => {
    setSelectedVideos((prev) =>
      prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [...prev, videoId]
    );
  };

  // Handle adding selected videos to the playlist
  const handleAddToPlaylist = async () => {
    try {
      await API.patch(`/playlist/add/${playlistId}`, { videoIds: selectedVideos });
      onClose(); // Close popup after adding
    } catch (error) {
      console.error("Error adding videos to playlist:", error);
    }
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-gray-900 p-5 rounded-lg w-[35rem]">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-2 mb-3">
            <h2 className="text-lg font-semibold text-white">Add Videos to Playlist</h2>
            <button onClick={onClose}>
              <X className="text-white" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search videos"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-gray-800 text-white pl-10 p-2 rounded"
            />
          </div>

          {/* Video List */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredVideos.length > 0 ? (
              filteredVideos.map((video) => (
                <div
                  key={video._id}
                  className="flex items-center p-2 bg-gray-800 rounded cursor-pointer hover:bg-gray-700"
                  onClick={() => toggleVideoSelection(video._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedVideos.includes(video._id)}
                    readOnly
                    className="mr-3"
                  />
                  <img src={video.thumbnail} alt={video.title} className="w-12 h-12 object-cover rounded" />
                  <div className="ml-3">
                    <p className="text-white text-sm">{video.title}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No videos found</p>
            )}
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddToPlaylist}
            className="w-full bg-blue-600 text-white mt-4 py-2 rounded hover:bg-blue-700"
            disabled={selectedVideos.length === 0}
          >
            Add to Playlist
          </button>
        </div>
      </div>
    )
  );
}
