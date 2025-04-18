import { Link } from "react-router-dom";
import { format } from "date-fns"; // For formatting date
import { Trash2, ToggleRight, ToggleLeft } from "lucide-react";
import API from "../api";
import { useState } from "react";

const VideoCards = ({ video, loggedInUserId }) => {
    const isOwner = video.owner?._id === loggedInUserId;
    const [isPublished, setIsPublished] = useState(video.isPublished);

    if (!isPublished && !isOwner) {
        return null; // Hide unpublished videos from non-owners
    }

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this video?");
        if (confirmDelete) {
            const res = await API.delete(`/videos/${video._id}`)
            if (res.status === 200) {
                alert("Video deleted successfully");
                window.location.reload();
            }
        }
    }

    const togglePublish = async () => {
        try {
            const response = await API.patch(`/videos/toggle/publish/${video._id}`);
            setIsPublished(response.data?.data?.isPublished);
        } catch (error) {
            console.error("Error updating publish status", error);
        }
    };

    return (
        <div className="relative group block bg-transparent rounded-lg overflow-hidden hover:shadow-xl hover:scale-105 hover:bg-gray-900 transition-all duration-300 ease-in-out hover:rounded-none max-h-92">
            <Link to={`/video/${video._id}`}>
                {/* Video Thumbnail */}
                <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover" />
            </Link>

            {/* Delete Button (Visible only for owner & on hover) */}
            {isOwner && (
                <button
                    onClick={handleDelete}
                    className="absolute mid right-2 p-2 text-red-500 rounded-full opacity-0 group-hover:opacity-90 transition cursor-pointer"
                >
                    <Trash2 size={24} />
                </button>
            )}

            {/* Video Info */}
            <div className="p-4 flex items-start">
                {/* User Avatar */}
                <img
                    src={video.owner?.avatar}
                    alt={video.owner?.username || "Unknown User"}
                    className="w-10 h-10 rounded-full border border-gray-500 mr-3"
                />

                <div className="flex flex-col space-y-1 w-full">
                    <h3 className="text-white font-semibold truncate whitespace-nowrap overflow-hidden w-full">
                        {video.title}
                    </h3>
                    <div className="text-gray-400 text-sm font-bold leading-tight">
                        <Link to={`/profile/${video.owner.username}`}>
                            <p className="hover:text-blue-500 duration-300 inline-block">
                                {video.owner?.username
                                    ? video.owner.username.charAt(0).toUpperCase() + video.owner.username.slice(1)
                                    : "Unknown User"}
                            </p>
                        </Link>
                        <p className="flex items-center gap-1 text-gray-400 text-xs">
                            {video.views} views
                            <span className="text-lg"> • </span>
                            {video.createdAt ? format(new Date(video.createdAt), "MMM d, yyyy") : "No Date"}
                        </p>
                        <p className="text-gray-500">{isPublished ? "Public" : "Private"}</p>

                    </div>
                    {isOwner && (
                        <div className="mt-1 flex justify-between items-center border-t pt-2">
                            <p className="text-gray-500 text-sm">Manage video visibility</p>
                            <button
                                onClick={togglePublish}
                                className="text-center gap-1 align-center cursor-pointer flex items-center">
                                {isPublished ? <ToggleRight size={24} className="text-green-500" /> : <ToggleLeft size={24} className="text-red-500" />}
                                {isPublished ? "Unpublish" : "Publish"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoCards;
