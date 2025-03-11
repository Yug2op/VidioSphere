import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import fs from "fs"


const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query
    //TODO: get all videos based on query, sort, pagination

    if (!req.user?._id) {
        throw new ApiError(
            401,
            "User needs to be logged in."
        )
    }

    // construsting the match object to filter videos

    const match = {
        ...(query ? { title: { $regex: query, $options: "i" } } : {}),
        ...(userId ? { owner: mongoose.Types.ObjectId(userId) } : {})
    }

    const videos = await Video.aggregate([
        {
            $match: match
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "videosByOwner",
                pipeline: [
                    { $project: { password: 0 } } // Exclude password field
                ]

            }
        },
        {
            $project: {
                videoFile: 1, // Video file link
                thumbnail: 1, // Thumbnail image link
                title: 1, // Video title
                description: 1, // Video description
                duration: 1, // Video duration
                views: 1, // Number of views
                isPublished: 1, // Whether the video is published or not
                createdAt: 1,
                updatedAt: 1,
                owner: {
                    $arrayElemAt: ["$videosByOwner", 0], // Extracts the first user object from the array
                },
            }
        },
        {
            $sort: { [sortBy]: sortType === "desc" ? -1 : 1 }
        },
        {
            $skip: (page - 1) * parseInt(limit)
        },
        {
            $limit: parseInt(limit)
        }
    ])

    if (!videos || videos.length === 0) {
        throw new ApiError(
            400,
            "Videos not found."
        )

    }

    return res
        .json(
            new ApiResponse(
                200,
                videos,
                "Videos fetched successfully"
            )
        )

})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video

    const { title, description } = req.body;


    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoFileLocalPath) {
        if (fs.existsSync(thumbnailLocalPath)) fs.unlinkSync(thumbnailLocalPath);
        throw new ApiError(
            400,
            "Video file is required."
        )
    }

    if (!thumbnailLocalPath) {
        if (fs.existsSync(videoFileLocalPath)) fs.unlinkSync(videoFileLocalPath);
        throw new ApiError(
            400,
            "Thumbnail is required."
        )
    }

    if (!title || !description) {
        if (fs.existsSync(thumbnailLocalPath)) fs.unlinkSync(thumbnailLocalPath);
        if (fs.existsSync(videoFileLocalPath)) fs.unlinkSync(videoFileLocalPath);

        throw new ApiError(
            400,
            "All fields are required."
        )
    }


    const videoFile = await uploadOnCloudinary(videoFileLocalPath);

    if (!videoFile) {
        throw new ApiError(
            400,
            "Cloudinary Error: Video file is required."
        )
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail) {
        throw new ApiError(
            400,
            "Cloudinary Error: Thumbnail is required."
        )
    }

    const videoDoc = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user?._id
    })

    if (!videoDoc) {
        throw new ApiError(
            500,
            "Something went wrong while uploading the video"
        )
    }

    return res
        .json(
            new ApiResponse(
                200,
                videoDoc,
                "Video uploaded successfully"
            )
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user ? req.user.id : null;

    // Validate Video ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }

    // Fetch video details
    const video = await Video.findById(videoId).populate("owner", "name email");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Get total likes for the video
    const likeCount = await Like.countDocuments({ video: videoId });

    // Check if the user has already liked the video
    const userLike = userId ? await Like.findOne({ video: videoId, likedBy: userId }) : null;

    // Return video data along with like information
    return res.json(
        new ApiResponse(200, {
            video,
            likeCount,
            likedByUser: !!userLike // Returns true if user liked, false otherwise
        }, "Video fetched successfully")
    );

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body;
    //TODO: update video details like title, description, thumbnail
    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid Video Id"
        )
    }

    if (!title || !description) {
        throw new ApiError(
            400,
            "All fields are required"
        )
    }

    const updateData = { title, description };

    if (req.file) {
        const thumbnailLocalPath = req.file.path;

        if (!thumbnailLocalPath) {
            throw new ApiError(
                400,
                "Thumbnail file is missing"
            );
        }
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if (fs.existsSync(thumbnailLocalPath)) fs.unlinkSync(thumbnailLocalPath)

        if (!thumbnail.url) {
            throw new ApiError(
                400,
                "Error while uploading thumbnail"
            );
        }

        // Add the new thumbnail URL to the updateData
        updateData.thumbnail = thumbnail.url;
    }




    const updatedVideo = await Video.findByIdAndUpdate(videoId,
        {
            $set: updateData
        },
        {
            new: true,
            runValidators: true
        }
    );

    // If the video is not found, return error.
    if (!updatedVideo) {
        throw new ApiError(
            404,
            "Video not found"
        );
    }

    // Send a success response with the updated video details.
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedVideo,
            "Video updated successfully"
        )
        );
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video

    // Validate if the provided videoId is a valid MongoDB ObjectId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    /*
          Delete the video from the database.
      - `findByIdAndDelete(videoId)`: Finds a video by its ID and removes it.
      - If the video does not exist, `deletedVideo` will be null.
    */
    const deletedVideo = await Video.findByIdAndDelete(videoId);

    // If no video was found to delete, return a 404 error.
    if (!deletedVideo) {
        throw new ApiError(
            404,
            "Video not found"
        );
    }

    // Send a success response with the deleted video details.
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            deletedVideo,
            "Video deleted successfully"
        ));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // Validate if the provided videoId is a valid MongoDB ObjectId.
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    /*
      Find the video by its ID.
      - `findById(videoId)`: Fetches the video document if it exists.
      - If the video is not found, we throw a 404 error.
    */
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(
            404,
            "Video not found"
        );
    }

    /*
      Toggle the `isPublished` status of the video.
      - If it's `true`, set it to `false`.
      - If it's `false`, set it to `true`.
    */
    video.isPublished = !video.isPublished;

    // Save the updated video status in the database.
    await video.save();

    /*
      Send a success response with the updated video details.
      - `video` contains the updated publish status.
    */
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video publish status toggled successfully"
            )
        );
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}