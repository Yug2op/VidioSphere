import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import API from "../api.js";
import SubscribersCount from "./SubscribersCount"; // Import the new component

const SubscriptionButton = ({ channelId, currentUser, profileUser }) => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscriberCount, setSubscriberCount] = useState(0);
    const [subscriberName, setSubscriberName] = useState("");
    const [subscribedChannel, setSubscribedChannel] = useState("");
    const [loading, setLoading] = useState(true);
    const location = useLocation(); // Get current route    

    const isOwner = currentUser && currentUser !== profileUser;

    useEffect(() => {
        const fetchSubscriptionData = async () => {
            try {
                const [resSubscribers, resUserSubscriptions] = await Promise.all([
                    API.get(`/subscriptions/${channelId}/channel-subscribers`),
                    API.get(`/subscriptions/user/subscribed-channels`)
                ]);

                if (resSubscribers.data.success) {
                    setSubscriberCount(resSubscribers.data.data.length);
                    setSubscriberName(resSubscribers.data?.data?.map(sub => sub.subscriber?.username || "Unknown")); // Store an array of names
                }

                if (resUserSubscriptions.data.success) {
                    const userSubscribedChannels = resUserSubscriptions.data.data.map(sub => sub.channel._id);
                    setIsSubscribed(userSubscribedChannels.includes(channelId));
                    setSubscribedChannel(resUserSubscriptions.data?.data?.map(sub => sub.channel.username)); // Store an array of channel IDs
                    
                }
            } catch (error) {
                console.error("Error fetching subscription data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptionData();
    }, [channelId]);

    const toggleSubscription = async () => {
        try {
            const res = await API.post(`/subscriptions/c/${channelId}`);
            if (res.data.success) {
                setIsSubscribed(prev => !prev);
                setSubscriberCount(prev => (isSubscribed ? prev - 1 : prev + 1));
            }
        } catch (error) {
            console.error("Subscription toggle failed:", error);
        }
    };

    if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;

    // Determine button styles based on route
    const isProfilePage = location.pathname.includes("/profile");
    const isVideosPage = location.pathname.includes("/videos");

    let buttonClasses = `px-4 sm:px-6 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out `;

    if (isProfilePage) {
        buttonClasses += isSubscribed
            ? " bg-gray-700 text-white ml-7 hover:bg-gray-500 hover:text-gray-200"
            : " bg-red-600 text-white ml-7 hover:bg-red-500 hover:text-gray-100";
    } else if (isVideosPage) {
        buttonClasses += isSubscribed
            ? " bg-blue-600 text-white hover:bg-blue-500 hover:text-gray-200"
            : " bg-green-600 text-white hover:bg-green-500 hover:text-gray-100";
    } else {
        buttonClasses += isSubscribed
            ? " bg-gray-800 text-white hover:bg-gray-700"
            : " bg-red-500 text-white hover:bg-red-400";
    }

    return (
        <div className="flex  sm:flex-row items-center justify-between w-full mt-2">
            {/* Separate Subscribers Count Component */}
            <SubscribersCount 
                subscriberCount={subscriberCount} 
                subscriberName={subscriberName} 
                isOwner={!isOwner} 
                subscribedChannel={subscribedChannel} 
                subscribedCount={subscribedChannel.length}
            />

            {/* Subscription Button */}
            {isOwner && (
                <button onClick={toggleSubscription} className={`${buttonClasses}  `}>
                    {isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
            )}
        </div>
    );
};

export default SubscriptionButton;
