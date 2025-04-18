import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import API from "../api";
import { Edit2, Trash2, Video, MoreVertical } from "lucide-react";
import PlaylistCreationPopup from "../components/PlaylistCreationPopup.jsx";
import AddToPlaylistPopup from "../components/AddToPlaylistPopup.jsx";

export default function Playlist() {
    const { playlistId } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("newest");
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [isVideoModalOpen, setVideoModalOpen] = useState(false);
    const [isPlaylistModalOpen, setPlaylistModalOpen] = useState(false);
    const [refreshPlaylist, setRefreshPlaylist] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const res = await API.get(`/playlist/${playlistId}`);
                setPlaylist({
                    ...res.data.data,
                    videos: res.data.data.videos.filter(video => video.isPublished) // Keep only published videos
                });
            } catch (error) {
                console.error("Error fetching playlist:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylist();
    }, [playlistId, refreshPlaylist]);

    useEffect(() => {
        const fetchLoggedInUser = async () => {
            try {
                const res = await API.get("/users/current-user");
                if (res.data.success) {
                    setLoggedInUserId(res.data?.data?._id);
                }
            } catch (error) {
                console.error("Error fetching logged-in user:", error);
            }
        };
        fetchLoggedInUser();
    }, []);

    const handleRemoveFromPlaylist = async (videoId) => {
        try {
            await API.patch(`/playlist/remove/${videoId}/${playlistId}`);
            setRefreshPlaylist((prev) => prev + 1);
            alert("Video Removed Successfully.");
        } catch (error) {
            console.error("Error removing video from playlist:", error);
        }
    };

    const handleDelete = async () => {
        const res = await API.delete(`/playlist/${playlistId}`);
        if (res.data.success) {
            alert("Playlist deleted Successfully");
            navigate(-1);
        } else {
            alert("Playlist Deletion Failed");
        }
    };

    if (loading) return <div className="bg-gray-900 text-white text-center p-10">Loading Playlist...</div>;
    if (!playlist) return <div className="bg-gray-900 text-white text-center p-10">Playlist not found.</div>;

    const sortedVideos = [...playlist.videos].sort((a, b) => {
        if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === "mostViewed") return b.views - a.views;
        return 0;
    });

    return (
        <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center p-4">
            <div className="w-full max-w-4xl p-4 bg-gray-800 rounded-lg shadow-lg mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                            {playlist.name.charAt(0).toUpperCase() + playlist.name.slice(1)}
                        </h1>
                        <p className="text-gray-400 text-xs sm:text-sm md:text-base">{playlist.description}</p>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">{playlist.videos.length} videos</p>
                    </div>

                    {/* Three-dot button for actions */}
                    {loggedInUserId && playlist?.owner && loggedInUserId === playlist.owner && (
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="p-2 rounded-full hover:bg-gray-700 focus:outline-none"
                            >
                                <MoreVertical size={20} />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-gray-900 text-white rounded-lg shadow-lg">
                                    <button
                                        onClick={() => {
                                            setPlaylistModalOpen(true);
                                            setMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
                                    >
                                        <Edit2 size={16} /> Edit Playlist
                                    </button>
                                    <button
                                        onClick={() => {
                                            setVideoModalOpen(true);
                                            setMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
                                    >
                                        <Video size={16} /> Add Video
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleDelete();
                                            setMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-700 flex items-center gap-2"
                                    >
                                        <Trash2 size={16} /> Delete Playlist
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Sorting Dropdown */}
            <div className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                <label className="text-gray-400 text-sm sm:text-base">Sort By:</label>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-800 text-white p-2 rounded-md w-full sm:w-auto"
                >
                    <option value="newest">Newest First</option>
                    <option value="mostViewed">Most Viewed</option>
                </select>
            </div>

            {/* Video List */}
            <div className="w-full max-w-4xl space-y-4">
                {sortedVideos.map((video) => (
                    <div key={video._id} className="flex flex-col sm:flex-row gap-4 p-3 rounded-lg bg-gray-800 hover:bg-gray-700">
                        <Link to={`/video/${video._id}`} className="flex flex-col sm:flex-row gap-4 w-full">
                            {/* Thumbnail */}
                            <img src={video.thumbnail} alt={video.title} className="w-full sm:w-44 h-24 object-cover rounded-md" />

                            {/* Video Details */}
                            <div className="flex-1">
                                <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg">{video.title}</h3>
                                <p className="text-gray-400 text-xs sm:text-sm">
                                    {video.views} views • {format(new Date(video.createdAt), "MMM d, yyyy")}
                                </p>
                            </div>
                        </Link>

                        {/* Remove Button */}
                        {loggedInUserId && playlist?.owner && loggedInUserId === playlist.owner && (
                            <button onClick={() => handleRemoveFromPlaylist(video._id)} className="text-red-400 hover:text-red-500 self-end cursor-pointer">
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Popups */}
            <PlaylistCreationPopup isOpen={isPlaylistModalOpen} onClose={() => setPlaylistModalOpen(false)} />
            <AddToPlaylistPopup
                playlistId={playlistId}
                isOpen={isVideoModalOpen}
                onClose={() => {
                    setVideoModalOpen(false);
                    setRefreshPlaylist((prev) => prev + 1);
                }}
            />
        </div>
    );
}
