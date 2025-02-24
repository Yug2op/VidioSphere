import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "invalid video Id."
        )
    }
    const videoObjectId = mongoose.Types.ObjectId(videoId);

    const fetchedComments = await Comment.aggregate([
        {
            $match: {
                video: videoObjectId
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "CommentOnWhichVideo",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "OwnerOfComment"
            },
        },
        {
            $project: {
                content: 1,
                owner: {
                    $arrayElemAt: ["$OwnerOfComment", 0],
                },
                video: {
                    $arrayElemAt: ["$CommentOnWhichVideo", 0]
                },
                createdAt: 1,
            },
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: (page - 1) * parseInt(limit),
        },
        {
            $limit: parseInt(limit),
        },
    ])

    if (!fetchedComments?.length) {
        throw new ApiError(
            404,
            "Comments not found."
        )
    }

    return res
        .json(
            new ApiResponse(
                200,
                fetchedComments,
                "Comments fetched successfully"
            )
        )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content } = req.body;
    const { videoId } = req.params;
    const userId = req.user?._id;



    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid video ID"
        )
    }

    if (!userId) {
        throw new ApiError(
            401,
            "User must be logged in to comment."
        )
    }

    if (!content?.trim()) {
        throw new ApiError(
            400,
            "Content con not be empty."
        )
    }

    const existVideo = await Video.findById(videoId)

    if (!existVideo) {
        throw new ApiError(
            404,
            "Video does not exist."
        )
    }


    const createComment = await Comment.create({
        content: content,
        owner: userId,
        video: videoId
    })

    if (!createComment) {
        throw new ApiError(
            500,
            "Server Problem : Comment creation failed."
        )
    }

    return res
        .json(
            new ApiResponse(
                200,
                createComment,
                "Comment created successfully"
            )
        )
})

const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(
            400,
            "Invalid comment Id"
        )
    }

    if (!content?.trim()) {
        throw new ApiError(
            400,
            "Content cannot be empty."
        )
    }

    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: userId,
        },
        {
            $set: {
                content: content
            },
        },
        {
            new: true
        }
    )



    if (!updatedComment) {
        const commentExists = await Comment.findById(commentId);

        if (commentExists) {
            throw new ApiError(
                403,
                "You are not authorized to update this comment."
            );
        }
        throw new ApiError(
            404,
            "Comment not found."
        );
    }

    return res
        .json(
            new ApiResponse(
                200,
                updatedComment,
                "Comment updated Successfully"
            )
        )
})

const deleteComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(
            400,
            "Invalid comment Id"
        )
    }

    const removeComment = await Comment.findOneAndDelete(
        {
            _id: commentId,
            owner: userId
        }
    )

    if (!removeComment) {

        const commentExists = await Comment.findById(commentId);

        if (commentExists) {
            throw new ApiError(
                403,
                "You are not authorized to delete this comment."
            );
        }
        throw new ApiError(
            404,
            "Comment not found."
        );

    }

    return res
        .json(
            new ApiResponse(
                200,
                removeComment,
                "Comment deleted successfully."
            )
        )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}