import React, { useEffect, useState } from "react";
import API from "../api.js";
import TweetCard from "../components/TweetCard.jsx";
import { Navbar } from "../components/Index.js";

function TwitterPage() {
    const [tweets, setTweets] = useState([]); // Store fetched tweets    
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTweetId, setActiveTweetId] = useState(null); // Track which tweet has comments open


    useEffect(() => {
        const fetchAllTweets = async () => {
            try {
                const res = await API.get("/tweets/allTweets");
                const sortedTweets = res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first
                setTweets(sortedTweets);
            } catch (error) {
                console.error("Failed to fetch tweets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllTweets();
    }, [tweets]);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await API.get(`/users/current-user`);
                if (res.data.success) {
                    setUserId(res.data.data._id);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };

        fetchCurrentUser();
    }, []);

    if (loading) return <div className="bg-gray-900 text-white h-screen text-center p-10">Loading Tweet...</div>;
    if (!tweets || tweets.length === 0) return <div className="bg-gray-900 text-white text-center p-10">No tweets available.</div>;

    return (
        <>
            <Navbar />
            <div className="flex justify-center bg-gray-900 text-white min-h-screen p-4">
                <div className="w-full max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold mb-4 text-center">Latest Tweets</h2>

                    {tweets.length > 0 && (
                        tweets.map((tweet) => (
                            <TweetCard
                                key={tweet._id}
                                tweet={tweet}
                                userId={userId}
                                activeTweetId={activeTweetId}
                                setActiveTweetId={setActiveTweetId}
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

export default TwitterPage;
