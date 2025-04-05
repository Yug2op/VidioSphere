import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiErrors.js"
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

    const existingVideo = await Video.findById(videoId);

    if (!existingVideo) {
        throw new ApiError(
            404,
            "Video does not exist"
        );
    }



    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    })

    if (existingLike) {

        const removeLike = await Like.findByIdAndDelete(existingLike._id);
        return res
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

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const existingComment = await Comment.findById(commentId);
    if (!existingComment) {
        throw new ApiError(404, "Comment does not exist");
    }


    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
    } else {
        await Like.create({
            comment: commentId,
            likedBy: userId
        });
    }

    // Get updated like count and users who liked the comment
    const likes = await Like.find({ comment: commentId }).select("likedBy");
    const likeCount = likes.length;
    const likedByUsers = likes.map(like => like.likedBy);

    return res.json(
        new ApiResponse(200, { likeCount, likedByUsers }, "Like status updated successfully")
    );
});



const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const existingTweet = await Tweet.findById(tweetId);

    if (!existingTweet) {
        throw new ApiError(404, "Tweet does not exist");
    }

    const likeIndex = existingTweet.likedBy.indexOf(userId);

    if (likeIndex !== -1) {
        // User already liked → remove like
        existingTweet.likedBy.splice(likeIndex, 1);
        await existingTweet.save();

        return res.json(new ApiResponse(200, {}, "Tweet unliked successfully."));
    } else {
        // User hasn't liked → add like
        existingTweet.likedBy.push(userId);
        await existingTweet.save();

        return res.json(new ApiResponse(200, {}, "Tweet liked successfully."));
    }
});


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