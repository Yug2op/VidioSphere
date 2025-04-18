import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api";
import { Button } from "../components/Index.js";
import Navbar from "../components/Navbar.jsx";
import { Heart, MoreVertical } from "lucide-react";
import SubscriptionButton from "../components/SubscriptionButton.jsx";
import LikeButton from "../components/LikeButton.jsx";
export default function VideoPlayer() {
    const { videoId } = useParams();
    const [currentUserId, setCurrentUserId] = useState(null);
    const [video, setVideo] = useState(null);
    const [likedByUser, setLikedByUser] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editCommentId, setEditCommentId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [showOptions, setShowOptions] = useState(null); // To handle the three-dot menu
    const videoRef = useRef(null);
    const dropdownRef = useRef(null);

    // Fetch the logged in userId
    useEffect(() => {
        const fetchLoggedInUser = async () => {
            try {
                const res = await API.get("/users/current-user");
                setCurrentUserId(res.data?.data._id);
            } catch (error) {
                console.error("Error fetching logged-in user:", error);
            }
        };
        fetchLoggedInUser();
    }, []);

    // Fetch video, comments, and related videos
    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await API.get(`/videos/${videoId}`);
                setVideo(res.data.data.video);
                setLikedByUser(res.data.data.likedByUser);
                setLikeCount(res.data.data.likeCount);
            } catch (error) {
                console.error("Error fetching video:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [videoId]);

    // Fetch comments for the current video
    useEffect(() => {
        const fetchComments = async () => {
            setComments([]); // Reset comments state before fetching new comments
            try {
                const res = await API.get(`/comments/video/${videoId}`);
                setComments(res.data.data);
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        };
        fetchComments();
    }, [videoId]);

    // Fetch related videos
    useEffect(() => {
        const fetchRelatedVideos = async () => {
            try {
                const res = await API.get(`/videos`);
                setRelatedVideos(res.data.data);
            } catch (error) {
                console.error("Error fetching related videos:", error);
            }
        };
        fetchRelatedVideos();
    }, [videoId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowOptions(null); // Close dropdown
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside); // Cleanup the event listener
        };
    }, []);

    const handleAddComment = async () => {
        if (newComment.trim()) {
            try {
                await API.post(`/comments/video/${videoId}`, { content: newComment });
                const updatedCommentsRes = await API.get(`/comments/video/${videoId}`);
                setComments(updatedCommentsRes.data.data); // Update comments with refetched data

                setNewComment(""); // Clear input after adding comment
            } catch (error) {
                console.error("Error adding comment:", error);
            }
        }
    };


    const handleEditComment = async () => {
        if (editContent.trim()) {
            try {
                const res = await API.patch(`/comments/c/${editCommentId}`, { content: editContent });
                const updatedComment = res.data.data;

                // Update comments state using the functional update form
                setComments(prevComments =>
                    prevComments.map(comment =>
                        comment._id === editCommentId ? updatedComment : comment
                    )
                );

                // Refetch comments after editing
                const updatedCommentsRes = await API.get(`/comments/${videoId}`);
                setComments(updatedCommentsRes.data.data); // Update comments with refetched data

                setIsEditing(false);
                setEditCommentId(null);
                setEditContent("");
            } catch (error) {
                console.error("Error editing comment:", error);
            }
        }
    };



    const handleDeleteComment = async (commentId) => {
        try {
            await API.delete(`/comments/c/${commentId}`);
            setComments(comments.filter((comment) => comment._id !== commentId));
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const handleFullscreen = () => {
        if (!videoRef.current) return;
        if (!document.fullscreenElement) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            } else if (videoRef.current.webkitRequestFullscreen) {
                videoRef.current.webkitRequestFullscreen();
            } else if (videoRef.current.mozRequestFullScreen) {
                videoRef.current.mozRequestFullScreen();
            } else if (videoRef.current.msRequestFullscreen) {
                videoRef.current.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key.toLowerCase() === "f") {
                event.preventDefault();
                handleFullscreen();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    if (loading) return <div className="bg-gray-900 text-white h-screen text-center p-10">Loading Video...</div>;
    if (!video) return <div className="bg-gray-900 text-white h-screen text-center p-10">Video not found.</div>;

    return (
        <>
            <Navbar />
            <div className="bg-gray-900 min-h-screen text-white p-4 flex flex-col md:flex-row gap-6">
                <div className="flex-1 max-w-5xl">
                    <div className="w-full bg-black rounded-lg overflow-hidden relative">
                        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                            <video
                                ref={videoRef}
                                src={video.videoFile}
                                controls
                                autoPlay
                                controlsList="nodownload"
                                className="absolute top-0 left-0 w-full h-full"
                            />
                        </div>

                        {/* video Like button */}
                        <LikeButton initialLikeCount={likeCount} initialLiked={likedByUser} />

                        {currentUserId && currentUserId !== video.owner._id && (
                            <div>
                                <SubscriptionButton channelId={video.owner._id} />
                            </div>
                        )}

                        <div className="p-4">
                            <h2 className="text-xl font-semibold">{video.title}</h2>
                            <Link to={`/profile/${video.owner.username}`} >
                                <p
                                    className="hover:text-blue-500 duration-300 ml-auto inline-block"
                                >{video.owner?.username ? video.owner.username.charAt(0).toUpperCase() + video.owner.username.slice(1) : "Unknown User"}</p>
                            </Link>
                            <p className="text-sm" >{video.description}</p>
                            <p className="text-gray-400">{video.views} views • {new Date(video.createdAt).toDateString()}</p>
                        </div>
                    </div>



                    {/* Number of Comments */}
                    <p className="mt-4 text-gray-400">{comments.length} Comments</p>

                    {/* Add Comment Section */}
                    <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">Add a Comment</h3>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full p-2 bg-gray-700 text-white rounded-md mb-3"
                        />
                        <Button onClick={handleAddComment} className="bg-blue-600 hover:bg-blue-700">
                            Add Comment
                        </Button>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">Comments</h3>
                        <div className="space-y-3 mt-3">
                            {comments.map((comment) => (
                                <div key={comment._id} className="bg-gray-700 p-2 rounded-md">
                                    <div className="flex items-center gap-3">
                                        <img src={comment.owner.avatar} alt={comment.owner.username} className="w-8 h-8 rounded-full" />
                                        <span className="text-text font-medium">{comment.owner.username}</span>

                                         {/* Like Button Next to Username */}
                                         <button
                                                    className={`flex items-center gap-1 text-gray-400 hover:text-red-500`}
                                                >
                                                    <Heart size={16} />
                                                    <span className="text-sm">2</span>
                                                </button>
                                    </div>

                                    {/* Show three-dot menu only if the logged-in user owns the comment */}
                                    {comment.owner._id === currentUserId && (
                                        <div className="relative">
                                            <Button
                                                onClick={() => setShowOptions(showOptions === comment._id ? null : comment._id)}
                                                className="bg-transparent absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-grey-600 p-2 rounded-full"
                                            >
                                                <MoreVertical size={16} />
                                            </Button>
                                            {showOptions === comment._id && (
                                                <div ref={dropdownRef} className="bg-gray-900 absolute right-0 top-full mt-2 text-white rounded-md z-1 p-2 w-32 shadow-lg">
                                                    <Button
                                                        onClick={() => {
                                                            setIsEditing(true);
                                                            setEditCommentId(comment._id);
                                                            setEditContent(comment.content);
                                                            setShowOptions(null);
                                                        }}
                                                        className="w-full text-left m-0.5 bg-transparent hover:bg-gray-700"
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            handleDeleteComment(comment._id);
                                                            setShowOptions(null);
                                                        }}
                                                        className="w-full text-left m-0.5 bg-transparent text-red-600 hover:bg-gray-700"
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <p className="text-gray-300 text-sm mt-1 pl-11">{comment.content}</p>

                                    {/* Edit Section */}
                                    {isEditing && editCommentId === comment._id && (
                                        <div className="mt-2">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full p-2 bg-gray-600 text-white rounded-md mb-3"
                                            />
                                            <button onClick={handleEditComment} className="border-1 border-gray-500 p-1 text-green-500 hover:text-green-400 text-sm ">
                                                Save Changes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}

                        </div>
                    </div>
                </div>
                {/* Related Videos Section */}
                <div className="w-full md:w-1/3 space-y-4">
                    <h3 className="text-lg font-semibold">Related Videos</h3>
                    {relatedVideos.map((related) => (
                        <Link
                            key={related._id}
                            to={`/video/${related._id}`}
                            className={`relative flex gap-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all ${related._id === videoId ? 'bg-blue-800' : ''
                                }`}
                        >
                            {/* Thumbnail with "Now Playing" Overlay */}
                            <div className="relative">
                                <img
                                    src={related.thumbnail}
                                    alt={related.title}
                                    className="w-36 h-20 object-cover rounded-md"
                                />
                                {related._id === videoId && (
                                    <div className="absolute top-1 left-1 bg-blue-600 text-white py-1 px-2 rounded-md text-xs">
                                        Now Playing
                                    </div>
                                )}
                            </div>

                            {/* Video Details */}
                            <div className="flex-1">
                                <h4 className="text-white font-semibold line-clamp-2">{related.title}</h4>
                                <p className="text-gray-400 text-xs">
                                    {related.views} views • {new Date(related.createdAt).toDateString()}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </>
    );
}
