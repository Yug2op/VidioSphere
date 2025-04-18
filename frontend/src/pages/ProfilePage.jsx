import { useState, useEffect } from "react";
import API from "../api"; // Ensure API is set up correctly
import Navbar from "../components/Navbar";
import { Link, useParams } from "react-router-dom";
import VideoCards from "../components/VideoCards";
import PlaylistCard from "../components/PlaylistCard";
import PlaylistCreationPopup from "../components/PlaylistCreationPopup";
import SubscriptionButton from "../components/SubscriptionButton";
import TweetCard from "../components/TweetCard";
import Button from "../components/Button";
import WatchedVideos from "../components/WatchedVideos";
import { CameraIcon } from "lucide-react";
import UploadImagePopup from "../components/UpdateImages";

export default function ProfilePage() {
    const { username } = useParams();
    const [user, setUser] = useState(null);
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [activeTab, setActiveTab] = useState("videos");
    const [videos, setVideos] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [loadingPlaylists, setLoadingPlaylists] = useState(true);
    const [tweets, setTweets] = useState([])
    const [activeTweetId, setActiveTweetId] = useState(null); // Track which tweet has comments open    
    const [refreshPlaylist, setRefreshPlaylist] = useState(0);
    const [isImageUploadPopupOpen, setImageUploadPopupOpen] = useState(false);
    const [uploadType, setUploadType] = useState('');
    const [loading, setLoading] = useState(false);

    





    useEffect(() => {
        const fetchUser = async () => {
            try {
                setUser(null);
                const res = await API.get(`/users/c/${username}`);
                setUser(res.data?.data);
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };

        if (username) fetchUser();
    }, [username, loading]);

    useEffect(() => {
        const fetchUserTweet = async () => {
            if (!user?._id) return; // Prevent API call if user ID is missing

            try {
                const res = await API.get(`/tweets/user/${user._id}`);
                if (res.data.success) {
                    setTweets(res.data?.data || [])
                }
            } catch (error) {
                console.error("Error fetching user tweets:", error);
            }
        };

        const timeout = setTimeout(() => {
            fetchUserTweet();
        }, 1000); // Delay API call by 1 second

        return () => clearTimeout(timeout); // Cleanup function to prevent multiple calls
    }, [username, user?._id]);



    useEffect(() => {
        const fetchUserVideos = async () => {
            try {
                setVideos([]);
                const res = await API.get(`/dashboard/${username}/videos`);
                setVideos(res.data?.data);
            } catch (error) {
                console.error("Error fetching videos", error);
            }
        };
        if (username) fetchUserVideos();
    }, [username]);

    useEffect(() => {
        const fetchUserPlaylists = async () => {
            if (!user) return;
            try {
                setLoadingPlaylists(true);
                const res = await API.get(`/playlist/user/${user._id}`);
                setPlaylists(res.data?.data || []);
            } catch (error) {
                console.error("Error fetching playlists:", error);
            } finally {
                setLoadingPlaylists(false);
            }
        };

        if (user) fetchUserPlaylists();
    }, [user, refreshPlaylist]);

    // Function to remove deleted playlist from state
    const handleDeleteSuccess = (deletedPlaylistId) => {
        setPlaylists((prev) => prev.filter((p) => p._id !== deletedPlaylistId));
    };

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

    if (!user) {
        return (
            <p className="text-center text-gray-400 mt-10">
                <Link to="" className="text-accent font-bold">Featching User profile...</Link>
            </p>
        );
    }

    const openPopup = (type) => {
        setUploadType(type);
        setImageUploadPopupOpen(true);
    };

    const handleImageUpload = async (file, type) => {
        if (!file || !type) {
            console.error("File or type is missing");
            return;
        }



        try {
            setLoading(true)
            const formData = new FormData();
            formData.append(type === "avatar" ? "avatar" : "coverImage", file);
            const endpoint =
                type === "avatar" ? `/users/avatar` : `/users/coverImage`;

            await API.patch(endpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

        } catch (error) {
            console.error("Error uploading image:", error);
        }
        finally {
            setLoading(false);
        }
    };

    const tabs = ["videos", "playlists", "tweets"];

    // Add "watchedHistory" if the condition is met
    if (loggedInUserId && user?._id && loggedInUserId === user._id) {
        tabs.push("watchedHistory");
    }



    return (
        <>
            <Navbar />
            <hr className="text-gray-900 h-0.125" />
            <div className="bg-gray-900 text-text shadow-md min-h-screen">
                <div className="max-w-5xl mx-auto">
                    {/* Cover Image */}
                    <div className="relative w-full h-45 rounded-xl overflow-hidden group">
                        <img src={user.coverImage || "/default-cover.jpg"} alt="Cover"
                            className="w-full h-auto object-cover" />

                        {/* Edit Icon (Appears on Hover) */}

                        {loggedInUserId && user?._id && loggedInUserId === user._id && (
                            <div className="absolute inset-0 bg-gray-900 bg-opacity-10 flex items-center justify-center 
                            opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-xl">
                                <button
                                    className="absolute top-2 right-4 text-white text-3xl cursor-pointer"
                                    onClick={() => openPopup("coverImage")}
                                >
                                    <CameraIcon /> 
                                </button>
                            </div>
                        )}

                    </div>

                    {/* Profile Image & Info */}
                    <div className="relative flex items-center px-4 md:px-8 mt-[-4rem]">
                        <div className="relative group">
                            {/* Profile Image */}
                            <img
                                src={user.avatar || "/default-avatar.png"}
                                alt="Profile"
                                className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover border-5 border-gray-900 bg-background"
                            />

                            {/* Hover Overlay with Edit Icon */}
                            {loggedInUserId && user?._id && loggedInUserId === user._id && (
                                <div className="absolute inset-0 bg-gray-900 bg-opacity-10 flex items-center justify-center 
                                 opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-xl">
                                    <button
                                        className="text-white text-2xl cursor-pointer"
                                        onClick={() => openPopup("avatar")}
                                    >
                                        <CameraIcon />
                                    </button>
                                </div>
                            )}

                        </div>

                        {/* Upload Image Popup */}
                        <UploadImagePopup
                            isOpen={isImageUploadPopupOpen}
                            onClose={() => setImageUploadPopupOpen(false)}
                            type={uploadType}
                            currentImage={user?.[uploadType]}
                            onUpload={handleImageUpload}
                        />

                        {/* User Info */}
                        <div className="ml-4">
                            <h1 className="text-3xl sm:text-4xl text-accent font-bold mb-2 mt-5">{user.fullName}</h1>
                            <p className="text-gray-200 text-md sm:text-lg">@{user.username}</p>

                            {/* Subscribe Button */}
                            <div>
                                <SubscriptionButton channelId={user._id} currentUser={loggedInUserId} profileUser={user._id} />
                            </div>
                        </div>
                    </div>




                    {/* Navigation Tabs */}
                    <div className="mt-6 border-b border-gray-700">
                        <div className="flex flex-wrap space-x-2.5 md:space-x-6 px-2 md:px-8 text-xs sm:text-sm md:text-lg">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-2 text-sm md:text-lg font-medium ${activeTab === tab ? "text-accent border-b-2 border-accent" : "text-gray-400"
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="mt-6 px-4 md:px-8">
                        {/* Videos Tab */}
                        {activeTab === "videos" && (
                            <div className="text-gray-400">
                                {videos.length === 0 ? "No videos uploaded yet." : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3  gap-2 sm:gap-4">
                                        {videos.map((video) => (
                                            <VideoCards key={video._id} video={video} loggedInUserId={loggedInUserId} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* VideosHistory Tab */}
                        {(activeTab === "watchedHistory" && (
                            <div className="text-gray-400">
                                <WatchedVideos />
                            </div>
                        ))}

                        {/* Playlists Tab */}
                        {activeTab === "playlists" && (
                            <div className="space-y-4">
                                <div>
                                    {/* Show button only if logged-in user is the profile owner */}
                                    {loggedInUserId && user?._id && loggedInUserId === user._id && (
                                        <Button onClick={() => setModalOpen(true)}>Create Playlist</Button>
                                    )}
                                    <PlaylistCreationPopup
                                        isOpen={isModalOpen}
                                        onClose={() => { setModalOpen(false); setRefreshPlaylist(prev => prev + 1) }}
                                    />
                                </div>
                                {loadingPlaylists ? (
                                    <p className="text-gray-400">Loading playlists...</p>
                                ) : playlists.length === 0 ? (
                                    <p className="text-gray-400">No playlists found.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {playlists.map((playlist) => (
                                            <PlaylistCard
                                                key={playlist._id}
                                                playlist={playlist}
                                                onDeleteSuccess={handleDeleteSuccess}
                                                loggedInUserId={loggedInUserId}
                                                playlistOwner={playlist.owner}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tweets Tab */}
                        {activeTab === "tweets" && (
                            <div className="space-y-4">
                                {tweets.length === 0 ? (
                                    <p className="text-gray-400">No tweets yet.</p>
                                ) : (
                                    <div className="flex justify-center bg-gray-900 text-white min-h-screen p-4">
                                        <div className="w-full max-w-2xl mx-auto">
                                            <h2 className="text-xl font-bold mb-4 text-center">Latest Tweets</h2>

                                            {tweets.length > 0 ? (
                                                tweets.map((tweet) => (
                                                    <TweetCard
                                                        key={tweet._id}
                                                        tweet={tweet}
                                                        userId={loggedInUserId}
                                                        activeTweetId={activeTweetId}
                                                        setActiveTweetId={setActiveTweetId}
                                                    />
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-center">No tweets available.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                    {loading && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-10 z-50">
                            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                                <h2 className="text-xl font-semibold text-white mb-4">Uploading...</h2>
                                <p className="text-white">Please wait...</p>
                            </div>
                        </div>
                    )}
                </div>

            </div>

        </>

    );
}
