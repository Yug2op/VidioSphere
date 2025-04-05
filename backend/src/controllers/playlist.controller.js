import { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const userId = req.user?._id;
    //TODO: create playlist

    if (!name?.trim() || !description?.trim()) {
        throw new ApiError(
            400,
            "All fields are required"
        )
    }

    const newPlaylist = await Playlist.create({
        name: name,
        description: description,
        owner: userId
    })

    if (!newPlaylist) {
        throw new ApiError(
            500,
            "Playlist creation failed."
        )
    }

    return res
        .json(
            new ApiResponse(
                201,
                newPlaylist,
                "Playlist Created successfully."
            )
        )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    //TODO: get user playlists

    if (!isValidObjectId(userId)) {
        throw new ApiError(
            400,
            "Invalid user ID"
        )
    }

    const playlists = await Playlist.find({
        owner: userId
    })

    if (!playlists || playlists.length === 0) {

        return res
            .json(
                new ApiResponse(
                    200,
                    [],
                    "No playlist found for this user."
                )
            )
    }

    return res
        .json(
            new ApiResponse(
                200,
                playlists,
                "Playlist fetched successfully"
            )
        )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(
            400,
            "Invalid playlist ID"
        )
    }

    const playlist = await Playlist.findById(playlistId).populate("videos");

    if (!playlist) {
        throw new ApiError(
            404,
            "Playlist not found"
        )
    }

    return res
        .json(
            new ApiResponse(
                200,
                playlist,
                "Playlist fetched successfully."
            )
        )
})

const addVideosToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { videoIds } = req.body; // Extract array of video IDs

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID.");
    }
    if (!Array.isArray(videoIds) || videoIds.length === 0) {
        throw new ApiError(400, "Invalid or empty videoIds array.");
    }

    const existPlaylist = await Playlist.findById(playlistId).select("videos");
    if (!existPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    const validVideoIds = videoIds.filter(isValidObjectId);
    if (validVideoIds.length === 0) {
        throw new ApiError(400, "No valid video IDs provided.");
    }

    // Find existing videos in DB
    const existingVideos = await Video.find({ _id: { $in: validVideoIds } });
    const existingVideoIds = existingVideos.map(v => v._id.toString());

    if (existingVideos.length === 0) {
        throw new ApiError(404, "No valid videos found.");
    }

    // Filter out already added videos
    const newVideosToAdd = existingVideoIds.filter(id => !existPlaylist.videos.includes(id));

    if (newVideosToAdd.length > 0) {
        existPlaylist.videos.push(...newVideosToAdd);
        await existPlaylist.save();
        return res.json(new ApiResponse(200, existPlaylist, "Videos added to playlist"));
    }

    return res.json(new ApiResponse(200, existPlaylist, "All videos already exist in the playlist."));
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    // TODO: remove video from playlist
    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid video ID"
        )
    }
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(
            400,
            "Invalid playlist ID"
        )
    }

    const existPlaylist = await Playlist.findById(playlistId);

if (!existPlaylist) {
    throw new ApiError(404, "No such Playlist found.");
}

if (!existPlaylist.videos.includes(videoId)) {
    throw new ApiError(400, "Video not found in Playlist");
}

// Remove video
const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } },
    { new: true }
);

return res.json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"));

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(
            400,
            "Invalid playlist ID"
        )
    }

    const removePlaylist = await Playlist.findByIdAndDelete(playlistId);

    if (!removePlaylist) {
        throw new ApiError(
            404,
            "Playlist not found"
        )
    }

    return res
        .json(
            new ApiResponse(
                200,
                removePlaylist,
                "Playlist deleted successfully"
            )
        )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(
            400,
            "Invalid playlist ID"
        )
    }

    if (!name?.trim() || !description?.trim()) {
        throw new ApiError(
            400,
            "All fields are required"
        )
    }

    const existPlaylist = await Playlist.findById(playlistId);

    if (!existPlaylist) {
        throw new ApiError(
            404,
            "Playlist not found"
        )
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name: name,
            description: description
        },
        {
            new: true
        }
    )

    if (!updatedPlaylist) {
        throw new ApiError(
            404,
            "Playlist not found"
        )
    }

    return res
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Playlist updated successfully"
            )
        )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideosToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}