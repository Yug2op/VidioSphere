import mongoose, { isValidObjectId } from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user?._id;
    // TODO: toggle subscription

    if (!isValidObjectId(channelId)) {
        throw new ApiError(
            400,
            "Invalid channel ID"
        )
    }

    if (subscriberId.toString() === channelId.toString()) {
        throw new ApiError(
            400,
            "You cannot subscribe to your own channel"
        )

    }

    const exsistingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    })

    if (exsistingSubscription) {
        const removeSubscription = await Subscription.findByIdAndDelete(exsistingSubscription._id)

        return res
            .json(
                new ApiResponse(
                    200,
                    removeSubscription,
                    "Channel Unsubscribed Successfully."
                )
            )
    }

    const subscribed = await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
    })

    return res
        .json(
            new ApiResponse(
                200,
                subscribed,
                "Channel Subscribed Successfully."

            )
        )



})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(
            400,
            "Invalid channel ID"
        )
    }

    if (channelId.toString() !== userId.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to view this channel's subscribers."
        )
    }

    const subscribers = await Subscription.find({
        channel : channelId
    }).populate("subscriber","_id name email");

    if(subscribers.length === 0){
        throw new ApiError(
            404,
            "No subscribers found for this channel"
        )
    }

    return res
    .json(
        new ApiResponse(
            200,
            subscribers,
            "Subscribers fetched successfully."
        )

    )

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(
            400,
            "invalid subscriber ID"
        )
    }

    const subscribedChannels = await Subscription.find({
        subscriber:subscriberId
    }).populate("channel", "_id name email")

    if (subscribedChannels.length === 0) {
        throw new ApiError(
            404,
            "No subscribed channel found"
        )
    }

    return res
    .json(
        new ApiResponse(
            200,
            subscribedChannels,
            "Subscribed channels fetched successfully."
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}