import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user?._id;
    //TODO: toggle like on video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid video ID."
        )
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    })

    if (existingLike) {

        removeLike = await Like.findByIdAndDelete(existingLike._id);

        return req
            .json(
                new ApiResponse(
                    200,
                    removeLike,
                    "Video unliked Successfully"
                )
            )
    }

    const newLike = await Like.create({
        video: videoId,
        likedBy: userId,
    })

    return res
        .json(
            new ApiResponse(
                200,
                newLike,
                "Video liked Successfully"
            )
        )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const userId = req.user?._id;
    //TODO: toggle like on comment

    if (!isValidObjectId(commentId)) {
        throw new ApiError(
            400,
            "Invalid comment ID"
        )
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    if (existingLike) {
        removeLike = await Like.findByIdAndDelete(existingLike._id)

        return res
            .json(
                new ApiResponse(
                    200,
                    removeLike,
                    "comment unliked Successfully"
                )
            )
    }

    const newLike = await Like.create({
        comment: commentId,
        likedBy: userId
    })

    return res
        .json(
            new ApiResponse(
                200,
                newLike,
                "comment liked Successfully"
            )
        )




})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user?._id;
    //TODO: toggle like on tweet

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(
            400,
            "Invalid tweet ID"
        )
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })

    if (existingLike) {
        const removeLike = await Like.findByIdAndDelete(existingLike._id);

        return res
            .json(
                new ApiResponse(
                    201,
                    removeLike,
                    "Tweet unliked successfully."
                )
            )

    }

    const newLike = await Like.create({
        tweet: tweetId,
        likedBy: userId
    })

    return res
        .json(
            new ApiResponse(
                201,
                newLike,
                "Tweet liked successfully."
            )
        )

})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    // Get pagination and sorting params (default values provided)
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const sortDirection = sortType === "desc" ? -1 : 1;

    const likedVideos = await Like.find({
        likedBy: userId,
        video: { $exists: true },
    })
        .populate("video", "title _id url createdAt")
        .sort({ [sortBy]: sortDirection }) // Sorting
        .skip((pageNumber - 1) * limitNumber) // Pagination: Skip previous pages
        .limit(limitNumber); // Limit results per page

    // Get total count for pagination info
    const totalLikedVideos = await Like.countDocuments({ likedBy: userId });
    const totalPages = Math.ceil(totalLikedVideos / limitNumber);

    return res.json(
        new ApiResponse(
            200, 
            { likedVideos, currentPage: pageNumber, totalPages, totalLikedVideos }, 
            "Fetched liked videos successfully"
        )
    );

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}