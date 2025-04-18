import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import API from "../api";

export default function PlaylistCard({ playlist, onDeleteSuccess, loggedInUserId, playlistOwner }) {
    const [thumbnails, setThumbnails] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchThumbnails = async () => {
            if (playlist.videos.length === 0) return;
    
            try {
                const videoRequests = playlist.videos.slice(0, 4).map(videoId =>
                    API.get(`/videos/${videoId}`)
                );
    
                const responses = await Promise.all(videoRequests);
    
                // Filter out unpublished videos
                const publishedVideos = responses
                    .map(res => res.data?.data.video)
                    .filter(video => video.isPublished); // Keep only published ones
    
                setThumbnails(publishedVideos.map(video => video.thumbnail));
            } catch (error) {
                console.error("Error fetching video thumbnails:", error);
            }
        };
    
        fetchThumbnails();
    }, [playlist.videos]);
    

    const handleDeletePlaylist = async () => {
        if (!window.confirm("Are you sure you want to delete this playlist?")) return;

        setIsDeleting(true);
        try {
            await API.delete(`/playlist/${playlist._id}`);
            onDeleteSuccess(playlist._id);
        } catch (error) {
            console.error("Error deleting playlist:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="relative group block bg-transparent rounded-lg overflow-hidden hover:shadow-xl hover:scale-105 hover:bg-gray-900 transition-all duration-300 ease-in-out hover:rounded-none">
            {/* Debugging: Check if the button is visible by setting opacity to 100 */}
            { loggedInUserId && playlistOwner && loggedInUserId === playlistOwner && (
                <button
                onClick={handleDeletePlaylist}
                className="absolute bottom-[4rem] right-2 p-2 rounded-full bg-transparent text-gray-400 z-10 transition-opacity duration-300 hover:text-red-500 cursor-pointer opacity-100 group-hover:opacity-50"
                disabled={isDeleting}
            >
                <Trash2 size={18} />
            </button>
            )}
            

            {/* Playlist Thumbnail Collage */}
            <Link to={`/playlist/${playlist._id}`}>
                <div className="relative w-full h-48 grid grid-cols-2 grid-rows-2 gap-1 rounded-lg overflow-hidden">
                    {thumbnails.length > 0 ? (
                        thumbnails.map((thumbnail, index) => (
                            <img
                                key={index}
                                src={thumbnail}
                                alt={`Video ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        ))
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400">
                            Loading...
                        </div>
                    )}
                </div>
            </Link>

            {/* Playlist Details */}
            <div className="p-4">
                <h2 className="text-white font-semibold line-clamp-2">{playlist.name}</h2>
                <p className="text-gray-400 text-sm truncate">{playlist.description}</p>
                <Link to={`/playlist/${playlist._id}`} className="text-blue-500 mt-2 block">
                    View Full Playlist
                </Link>
            </div>
        </div>
    );
}
