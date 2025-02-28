import { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    // steps: 
    // get tweet data from frontend
    // validation - content should not be empty
    // xreate tweet object store in database
    // check for tweet creation
    // return response

    const { content } = req.body
    const owner = req.user?._id;

    if (!content || content.trim() === "") {
        throw new ApiError(
            400,
            "Content field should not be empty!"
        )
    }

    const tweet = await Tweet.create(
        {
            content,
            owner
        }
    )
    const createdTweet = await Tweet.findById(tweet._id)

    if (!createdTweet) {
        throw new ApiError(
            500,
            "Tweet creation Failed. check Connection and try Again."
        )
    }

    return res.status(201).json(
        new ApiResponse(201, "Tweet created successfully", createdTweet)
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    // steps 
    // user Authentication
    // fetch tweet
    // check if tweet exist
    //return 

    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(
            400,
            "Invalid User Id"
        )
    }

    const userTweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });

    if (!userTweets || userTweets.length === 0) {
        throw new ApiError(
            400,
            "Tweets not found for this User."
        )
    }

    return res
        .json(
            new ApiResponse(
                200,
                userTweets,
                "User Tweets fetched successfully"
            )
        )


})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    // steps 
    // authentication
    // find tweet
    // ownershipcheck
    // content validation
    // update
    // response

    const { content } = req.body;
    const userId = req.user?._id;
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(
            400,
            "Invalid tweet ID"
        )
    }

    if (!userId) {
        throw new ApiError(
            401,
            "Unauthorized User"
        )
    }

    const requiredtweet = await Tweet.findById(tweetId);

    if (!requiredtweet) {
        throw new ApiError(
            403,
            "Requested tweet not found"
        )
    }

    if (requiredtweet.owner.toString() !== userId.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this tweet."
        );
    }


    if (!content || content.trim() === "") {
        throw new ApiError(
            400,
            "Content field cannot be empty."
        )
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set: {
                content
            }
        },
        { new: true }
    )
    if (!updatedTweet) {
        throw new ApiError(500, "Tweet update failed.");
    }


    return res
        .json(
            new ApiResponse(
                200,
                updatedTweet,
                "Tweet updated successfully."
            )
        )





})

const deleteTweet = asyncHandler(async (req, res) => {

    //steps
    // 1️⃣ Authentication → Ensure the user is logged in.
    // 2️⃣ Validate tweetId → Check if it's a valid MongoDB ObjectId.
    // 3️⃣ Fetch the Tweet → Retrieve the tweet from the database.
    // 4️⃣ Ownership Check → Ensure the logged-in user owns the tweet.
    // 5️⃣ Delete the Tweet → Remove it from the database.
    // 6️⃣ Send Response → Return a success message confirming deletion.





    const userId = req.user?._id;
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(
            400,
            "Invalid tweet ID."
        )
    }

    if (!userId) {
        throw new ApiError(
            401,
            "Unauthorized user"
        )
    }

    const requiredtweet = await Tweet.findById(tweetId);

    if (!requiredtweet) {
        throw new ApiError(
            404,
            "Tweet not found"
        )
    }

    if (requiredtweet.owner.toString() !== userId.toString()) {
        throw new ApiError(
            403,
            "Forbidden: You can only delete your own tweets"
        )
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
        throw new ApiError(
            500,
            "Somthing went wrong, tweet not deleted yet."
        )
    }

    return res
        .json(
            new ApiResponse(
                200,
                null,
                "Tweet deleted successfully"
            )
        )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}