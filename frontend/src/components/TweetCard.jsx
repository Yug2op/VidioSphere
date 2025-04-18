import { Heart, MessageCircle, Edit, X, Trash2, Send, MoreVertical } from "lucide-react";
import API from "../api";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

const TweetCard = ({ tweet, userId, activeTweetId, setActiveTweetId }) => {
    const [comments, setComments] = useState([]);
    const [likedByCurrentUser, setLikedByCurrentUser] = useState(tweet.likedBy?.includes(userId) || false);
    const [likeCount, setLikeCount] = useState(tweet.likeCount || 0);
    const [commentsCount, setCommentsCount] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [loadingComment, setLoadingComment] = useState(false);
    const [activeCommentId, setActiveCommentId] = useState(null);
    const [editCommentId, setEditCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState("");
    const [isHovered, setIsHovered] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editTweetText, setEditTweetText] = useState(tweet.content);



    const menuRef = useRef(null);
    const isCommentsOpen = activeTweetId === tweet._id;

    // Fetch comments count
    useEffect(() => {
        const fetchCommentCount = async () => {
            try {
                const res = await API.get(`/comments/tweet/${tweet._id}`);
                if (res.data.success) {
                    setCommentsCount(res.data.data.length);
                }
            } catch (error) {
                console.error("Error fetching comment count:", error);
            }
        };

        fetchCommentCount();
    }, [tweet._id]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveCommentId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Toggle comments section (ensuring only one stays open)
    const toggleComments = async () => {
        if (isCommentsOpen) {
            setActiveTweetId(null); // Close if already open
        } else {
            setActiveTweetId(tweet._id); // Open this tweet's comments
            try {
                const res = await API.get(`/comments/tweet/${tweet._id}`);
                if (res.data.success) {
                    setComments(res.data.data);
                }
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        }
    };

    // Toggle like for the tweet
    const toggleLike = async () => {
        try {
            const res = await API.post(`/likes/toggle/t/${tweet._id}`);
            if (res.data.message === "Tweet unliked successfully.") {
                setLikedByCurrentUser(false);
                setLikeCount((prev) => (prev > 0 ? prev - 1 : prev));
            } else {
                setLikedByCurrentUser(true);
                setLikeCount((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };
    

    // Add a new comment
    const addComment = async () => {
        if (!newComment.trim()) return;
        setLoadingComment(true);

        try {
            const res = await API.post(`/comments/tweet/${tweet._id}`, { content: newComment });
            if (res.data.success) {
                setComments((prevComments) => [res.data?.data, ...prevComments]);
                setNewComment("");
                setCommentsCount((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setLoadingComment(false);
        }
    };

    // Function to handle comment update
    const handleEditComment = async (commentId) => {
        if (!editCommentText.trim()) return;

        try {
            const res = await API.patch(`/comments/c/${commentId}`, { content: editCommentText });
            if (res.data.success) {
                setComments((prevComments) =>
                    prevComments.map((comment) =>
                        comment._id === commentId ? { ...comment, content: editCommentText } : comment
                    )
                );
                setEditCommentId(null);
                setEditCommentText("");
            }
        } catch (error) {
            console.error("Error updating comment:", error);
        }
    };

    // Delete a comment
    const deleteComment = async (commentId) => {
        try {
            const res = await API.delete(`/comments/c/${commentId}`);
            if (res.data.success) {
                setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));
                setCommentsCount((prev) => (prev > 0 ? prev - 1 : prev));
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
        } finally {
            setActiveCommentId(null);
        }
    };

    // Open edit modal
    const openEditModal = () => {
        setEditTweetText(tweet.content);
        setIsEditModalOpen(true);
    };

    // Close edit modal
    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    //Edit tweet
    const editTweet = async () => {
        if (!editTweetText.trim()) return;
        try {
            const res = await API.patch(`/tweets/${tweet._id}`, { content: editTweetText });
            if (res.data.success) {
                // console.log("Tweet Updated successfully.");
                tweet.content = editTweetText; // Update UI without re-fetching
                closeEditModal();
            }
        } catch (error) {
            console.error("Error in Updating tweet:", error);
        }
    }
    //Delete tweet
    const deleteTweet = async () => {
        try {
            const res = await API.delete(`/tweets/${tweet._id}`);
            if (res.data.success) {
                // console.log("Tweet deleted successfully.");
            }
        } catch (error) {
            console.error("Error deleting tweet:", error);
        }
    }

    return (
        <div className="flex items-start gap-4 p-4 border-b border-gray-700 relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={`/profile/${tweet.owner.username}`}>
                <img
                    src={tweet.owner.avatar || "/default-avatar.png"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full cursor-pointer"
                />
            </Link>

            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm md:text-base">{tweet.owner.fullName}</span>
                    <Link to={`/profile/${tweet.owner.username}`}>
                        <span className="text-gray-500 text-xs md:text-sm hover:text-blue-400 transition-all duration-300">@{tweet.owner.username}</span>
                    </Link>
                    <span className="text-gray-500 text-xs md:text-sm">· {new Date(tweet.createdAt).toDateString()}</span>
                </div>

                <p className="text-white text-sm md:text-base lg:text-lg mt-1">{tweet.content}</p>

                <div className="flex items-center gap-6 mt-3 text-gray-500">
                    <button onClick={toggleComments} className="flex items-center gap-2 hover:text-blue-500">
                        <MessageCircle size={18} />
                        <span>{commentsCount || "0"}</span>
                    </button>

                    <button
                        className={`flex items-center gap-2 ${likedByCurrentUser ? "text-red-600" : "text-gray-500"} hover:text-red-500`}
                        onClick={toggleLike}
                    >
                        <Heart size={18} fill={likedByCurrentUser ? "red" : "none"} />
                        <span>{likeCount}</span>
                    </button>
                </div>
                {isHovered && userId === tweet.owner._id && (
                    <div className="absolute top-2 right-4 flex gap-2">
                        <button onClick={openEditModal} className="text-gray-400 hover:text-blue-500">
                            <Edit size={18} />
                        </button>
                        <button onClick={deleteTweet} className="text-gray-400 hover:text-red-500">
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}

                {/* Edit Tweet Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-gray-900 p-6 rounded-lg w-96 shadow-lg relative">
                            <button onClick={closeEditModal} className="absolute top-3 right-3 text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                            <h2 className="text-lg font-semibold text-white mb-4">Edit Tweet</h2>
                            <textarea
                                className="w-full p-2 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none"
                                rows="3"
                                value={editTweetText}
                                onChange={(e) => setEditTweetText(e.target.value)}
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={closeEditModal} className="px-4 py-2 text-gray-400 hover:text-white">
                                    Cancel
                                </button>
                                <button
                                    onClick={editTweet}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isCommentsOpen && (
                    <div className="mt-4 bg-gray-800 p-3 rounded-lg max-h-60 overflow-y-auto">
                        {/* Add Comment Input */}
                        <div className="flex items-center gap-2 mt-3">
                            <input
                                type="text"
                                className="flex-1 px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <button onClick={addComment} disabled={loadingComment} className="text-blue-500 hover:text-blue-400">
                                <Send size={18} />
                            </button>
                        </div>
                        {/* Comments List */}
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment._id} className="p-3 border-b border-gray-700 flex items-start space-x-3">
                                    {/* Avatar */}
                                    <Link to={`/profile/${comment.owner?.username}`}>
                                        <img
                                            src={comment.owner?.avatar || "/default-avatar.png"}
                                            alt="Profile"
                                            className="h-8 w-8 rounded-full object-cover"
                                        />
                                    </Link>

                                    {/* Comment Content */}
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-5">
                                                <Link to={`/profile/${comment.owner?.username}`}>
                                                    <span className="font-bold text-gray-100 text-sm hover:text-blue-400">
                                                        {comment.owner?.username || "unknown"}
                                                    </span>
                                                </Link>

                                                {/* Like Button Next to Username */}
                                                <button
                                                    className={`flex items-center gap-1 text-gray-400 hover:text-red-500`}
                                                >
                                                    <Heart size={16} />
                                                    <span className="text-sm">2</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Comment Text or Editable Input */}
                                        {editCommentId === comment._id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={editCommentText}
                                                    onChange={(e) => setEditCommentText(e.target.value)}
                                                    className="flex-1 px-3 py-1 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none"
                                                />
                                                <button onClick={() => handleEditComment(comment._id)} className="text-green-500 hover:text-green-400 text-sm">
                                                    Save
                                                </button>
                                                <button onClick={() => setEditCommentId(null)} className="text-red-500 hover:text-red-400 text-sm">
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-gray-300 text-xs md:text-sm">{comment.content}</p>
                                        )}
                                    </div>

                                    {/* Comment Actions (Edit/Delete) */}
                                    {comment.owner?._id && userId && comment.owner?._id === userId && (
                                        <div className="relative">
                                            <button
                                                onClick={() => setActiveCommentId(activeCommentId === comment._id ? null : comment._id)}
                                                className="p-1 rounded-full hover:bg-gray-700 focus:outline-none"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {activeCommentId === comment._id && (
                                                <div className="absolute right-0 mt-2 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
                                                    <button
                                                        onClick={() => {
                                                            setEditCommentId(comment._id);
                                                            setEditCommentText(comment.content);
                                                            setActiveCommentId(null);
                                                        }}
                                                        className="block w-full px-4 py-2 text-xs text-left text-white hover:bg-gray-700"
                                                    >
                                                        Edit Comment
                                                    </button>
                                                    <button onClick={() => deleteComment(comment._id)} className="block w-full px-4 py-2 text-left text-xs text-red-500 hover:bg-gray-700">
                                                        Delete Comment
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No comments yet.</p>
                        )}



                    </div>
                )}
            </div>

        </div>
    );
};

export default TweetCard;
