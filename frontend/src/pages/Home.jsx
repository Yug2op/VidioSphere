import { useEffect, useState } from "react";
import API from "../api"; // Ensure this is the correct import
import VideoCards from "../components/VideoCards";
import Navbar from "../components/Navbar";

const Home = () => {
    const [videos, setVideos] = useState([]); // Default to an empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await API.get("/videos");
                let data = res.data?.data || [];    

                const videoList = data.sort(() => Math.random() - 0.5);
                setVideos(videoList);
            } catch (err) {
                setError("Failed to load videos");
                console.error("Error fetching videos:", err);

                if (err.response?.status === 401 || err.response?.status === 403) {
                    let countdown = 5;
                    document.body.innerHTML = `
                        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; font-family: Arial, sans-serif; text-align: center; background-color: #111827; color: tomato;">
                            <h2>You are not logged in</h2>
                            <p>
                                Please <a href="/login" style="color: blue; text-decoration: none;">Log In</a> again to watch videos.
                            </p>
                            <p>Redirecting to login in <span id="countdown">${countdown}</span> seconds...</p>
                        </div>
                    `;

                    const interval = setInterval(() => {
                        countdown--;
                        document.getElementById("countdown").textContent = countdown;
                        if (countdown <= 0) {
                            clearInterval(interval);
                            window.location.href = "/login";
                        }
                    }, 1000);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    return (
        <>
            <Navbar />
            <div className="px-4 sm:px-6 md:px-8 lg:px-10 bg-gray-900 min-h-screen">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-6">
                    Recommended Videos
                </h1>

                {loading ? (
                    <p className="text-sm sm:text-base text-gray-400">Loading videos...</p>
                ) : error ? (
                    <p className="text-sm sm:text-base text-red-400">{error}</p>
                ) : videos.length === 0 ? (
                    <p className="text-sm sm:text-base text-gray-400">No videos available</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-4 md:gap-6">
                        {videos.map((video) => (
                            <VideoCards key={video._id} video={video} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Home;
