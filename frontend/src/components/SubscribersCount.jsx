import { useState } from "react";
import { X } from "lucide-react";

const SubscribersCount = ({
    subscriberCount,
    subscriberName,
    subscribedChannel,
    subscribedCount,
    isOwner
}) => {
    const [showSubscribers, setShowSubscribers] = useState(false);
    const [showSubscribed, setShowSubscribed] = useState(false);

    return (
        <div className="relative flex flex-col gap-2">
            {/* Subscribers Button (Only clickable for owner) */}
            <div className="flex items-center justify-start ">
    <button
        onClick={() => isOwner && setShowSubscribers(!showSubscribers)}
        className={`text-gray-400 text-xs sm:text-sm md:text-lg rounded-md 
            ${isOwner ? "hover:text-white bg-gray-900 cursor-pointer" : "cursor-not-allowed"}`}
    >
        {subscriberCount} Subscribers
    </button>
</div>


            {/* Subscriber list dropdown (only for owner) */}
            {isOwner && showSubscribers && (
                <div className="absolute sm:left-full sm:ml-2 mt-2 w-48 sm:w-64 bg-gray-800 text-white shadow-lg rounded-lg p-3 z-10
                    left-1/2 transform -translate-x-1/2 sm:translate-x-0 sm:top-auto">

                    {/* Header with Close Button */}
                    <div className="flex justify-between items-center border-b pb-1 mb-2">
                        <p className="font-semibold">Subscribers</p>
                        <button onClick={() => setShowSubscribers(false)} className="text-gray-400 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Subscribers List */}
                    <ul className="max-h-40 overflow-auto">
                        {subscriberName.length > 0 ? (
                            subscriberName.map((name, index) => (
                                <li key={index} className="p-2 border-b last:border-none">
                                    {name}
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm">No subscribers yet</p>
                        )}
                    </ul>
                </div>
            )}

            {/* Subscribed Channels Button (Only clickable for owner) */}
            <div className="flex justify-between items-center w-full">
    

            <div className="flex items-center">
    <button
        onClick={() => isOwner && setShowSubscribed(!showSubscribed)}
        className={`text-gray-400 text-xs sm:text-sm md:text-lg rounded-md 
            ${isOwner ? "hover:text-white bg-gray-900 cursor-pointer" : "cursor-not-allowed"}`}
    >
        {subscribedCount} Channel Subscribed
    </button>
</div>

</div>


            {/* Subscribed Channels List (Only for owner) */}
            {isOwner && showSubscribed && (
                <div className="absolute sm:left-full sm:ml-2 mt-2 w-48 sm:w-64 bg-gray-800 text-white shadow-lg rounded-lg p-3 z-10
                    left-1/2 transform -translate-x-1/2 sm:translate-x-0 sm:top-auto">

                    {/* Header with Close Button */}
                    <div className="flex justify-between items-center border-b pb-1 mb-2">
                        <p className="font-semibold">Subscribed Channels</p>
                        <button onClick={() => setShowSubscribed(false)} className="text-gray-400 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Subscribed Channels List */}
                    <ul className="max-h-40 overflow-auto">
                        {subscribedChannel.length > 0 ? (
                            subscribedChannel.map((channel, index) => (
                                <li key={index} className="p-2 border-b last:border-none">
                                    {channel}
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm">Not subscribed to any channel</p>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SubscribersCount;
