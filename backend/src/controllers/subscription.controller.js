import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user?._id;


    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (subscriberId.toString() === channelId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const existingSubscription = await Subscription.findOne({ subscriber: subscriberId, channel: channelId });

    if (existingSubscription) {
        await Subscription.findOneAndDelete({ subscriber: subscriberId, channel: channelId });
        return res.json(new ApiResponse(200, null, "Channel Unsubscribed Successfully."));
    }

    const subscribed = await Subscription.create({ subscriber: subscriberId, channel: channelId });

    return res.json(new ApiResponse(200, subscribed, "Channel Subscribed Successfully."));
});

// Get subscribers of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params; // Use channelId from params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber", "_id username");

    return res.json(new ApiResponse(200, subscribers, subscribers.length ? "Subscribers fetched successfully." : "No subscribers found."));
});

// Get channels a user has subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const subscriberId = req.user?._id;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const subscribedChannels = await Subscription.find({ subscriber: subscriberId }).populate("channel", "_id name");

    return res.json(new ApiResponse(200, subscribedChannels, subscribedChannels.length ? "Subscribed channels fetched successfully." : "No subscribed channels found."));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};