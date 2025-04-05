import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getComments = asyncHandler(async (req, res) => {
    const { videoId, tweetId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user?._id; // Get current user ID

    let matchCondition = {};
    let lookupCollection = "";
    let lookupField = "";
    let commentOnField = "";

    if (videoId) {
        if (!isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid video ID.");
        }
        matchCondition.video = new mongoose.Types.ObjectId(videoId);
        lookupCollection = "videos";
        lookupField = "video";
        commentOnField = "CommentOnWhichVideo";
    } else if (tweetId) {
        if (!isValidObjectId(tweetId)) {
            throw new ApiError(400, "Invalid tweet ID.");
        }
        matchCondition.tweet = new mongoose.Types.ObjectId(tweetId);
        lookupCollection = "tweets";
        lookupField = "tweet";
        commentOnField = "CommentOnWhichTweet";
    } else {
        throw new ApiError(400, "Either videoId or tweetId must be provided.");
    }

    const fetchedComments = await Comment.aggregate([
        { $match: matchCondition },

        // Lookup the comment owner (User details)
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "OwnerOfComment",
                pipeline: [
                    {
                        $project: {
                            password: 0,
                            email: 0,
                            watchHistory: 0,
                            coverImage: 0,
                            refreshToken: 0,
                            __v: 0
                        }
                    }
                ]
            },
        },

        // Lookup the associated video or tweet
        {
            $lookup: {
                from: lookupCollection,
                localField: lookupField,
                foreignField: "_id",
                as: commentOnField,
            },
        },

        // Lookup the total like count for each comment
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "LikesData",
            },
        },

        // Lookup if the current user has liked this comment
        {
            $lookup: {
                from: "likes",
                let: { commentId: "$_id", userId: userId },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$comment", "$$commentId"] },
                                    { $eq: ["$likedBy", userId] }
                                ]
                            }
                        }
                    }
                ],
                as: "UserLikeData"
            }
        },

        // Format the response
        {
            $project: {
                content: 1,
                owner: { $arrayElemAt: ["$OwnerOfComment", 0] },
                createdAt: 1,
                likeCount: { $size: "$LikesData" }, // Get total like count
                likedByCurrentUser: { $gt: [{ $size: "$UserLikeData" }, 0] }, // True if user has liked
                [lookupField]: { $arrayElemAt: [`$${commentOnField}`, 0] }
            },
        },

        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * parseInt(limit) },
        { $limit: parseInt(limit) },
    ]);

    if (!fetchedComments?.length) {
        throw new ApiError(404, "Comments not found.");
    }

    return res.json(new ApiResponse(200, fetchedComments, "Comments fetched successfully"));
});

 

const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { videoId, tweetId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User must be logged in to comment.");
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Content cannot be empty.");
    }

    // Validate at least one ID
    if (!isValidObjectId(videoId) && !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid video or tweet ID.");
    }

    let targetType = null;

    // Check if video exists
    if (videoId) {
        const existVideo = await Video.findById(videoId);
        if (!existVideo) {
            throw new ApiError(404, "Video does not exist.");
        }
        targetType = { video: videoId };
    }

    // Check if tweet exists
    if (tweetId) {
        const existTweet = await Tweet.findById(tweetId);
        if (!existTweet) {
            throw new ApiError(404, "Tweet does not exist.");
        }
        targetType = { tweet: tweetId };
    }

    // Create comment linked to either video or tweet
    const createComment = await Comment.create({
        content: content,
        owner: userId,
        ...targetType, // Dynamically assign either video or tweet
    });
    
    
    if (!createComment) {
        throw new ApiError(500, "Server Problem: Comment creation failed.");
    }
    const newComment = await Comment.findById(createComment._id).populate("owner","username fullname avatar")

    return res.json(new ApiResponse(200, newComment, "Comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID.");
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Content cannot be empty.");
    }

    // Find and update comment only if the logged-in user is the owner
    const updatedComment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: userId },
        { $set: { content: content } },
        { new: true }
    );

    if (!updatedComment) {
        const commentExists = await Comment.findById(commentId);
        if (commentExists) {
            throw new ApiError(403, "You are not authorized to update this comment.");
        }
        throw new ApiError(404, "Comment not found.");
    }

    return res.json(new ApiResponse(200, updatedComment, "Comment updated successfully."));
});


const deleteComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID.");
    }

    // Find and delete comment only if the logged-in user is the owner
    const removedComment = await Comment.findOneAndDelete(
        { _id: commentId, owner: userId }
    );

    if (!removedComment) {
        const commentExists = await Comment.findById(commentId);
        if (commentExists) {
            throw new ApiError(403, "You are not authorized to delete this comment.");
        }
        throw new ApiError(404, "Comment not found.");
    }

    return res.json(new ApiResponse(200, removedComment, "Comment deleted successfully."));
});


export {
    getComments,
    addComment,
    updateComment,
    deleteComment
}