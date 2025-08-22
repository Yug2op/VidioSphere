import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiErrors.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from 'mongoose';
import { Token } from '../models/token.model.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import crypto from 'crypto';

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Somthing went wrong while generating tokens")
    }
}

const generateToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password } = req.body;

    if ([fullName, username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    if (email.includes("@") === false) {
        throw new ApiError(400, "Invalid email address");
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Error uploading avatar");
    }

    let coverImage = null;
    if (coverImageLocalPath) {
        const coverImageUpload = await uploadOnCloudinary(coverImageLocalPath);
        if (coverImageUpload) {
            coverImage = coverImageUpload.url;
        }
    }

    const verificationToken = generateToken();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage,
        email,
        password,
        username: username.toLowerCase(),
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationTokenExpiry
    });

    await Token.create({
        user: user._id,
        tokenHash: verificationToken,
        type: 'emailVerify',
        expiresAt: verificationTokenExpiry,
        used: false
    });

    try {
        await sendVerificationEmail(user, verificationToken);
    } catch (error) {
        console.error('Failed to send verification email:', error);
    }

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully. Please check your email to verify your account.")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
        throw new ApiError(403, "Please verify your email before logging in. Check your email for the verification link.", "EMAIL_NOT_VERIFIED");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpires");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
    }

    res.clearCookie("accessToken", options)
    res.clearCookie("refreshToken", options)
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"
            )
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(403, "No refresh token provided");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(403, "Refresh token expired");
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Refreshed access token"
                )
            );
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Access token expired");
        }
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both old and new passwords are required.");
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password.");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password Changed Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200,
                req.user,
                "Current user Fetched Successfully")
        )
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    try {
        const { fullName, email } = req.body

        if (!fullName || !email) {
            throw new ApiError(400, "All fields are required")
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    fullName,
                    email
                }
            },
            { new: true }
        ).select("-password -refreshToken")

        return res
            .status(200)
            .json(
                new ApiResponse(200,
                    user,
                    "Account details updated Successfully"
                )
            )
    }
    catch (error) {
        if (error.code === 11000) {
            return res
                .status(400)
                .json(
                    400,
                    "Duplicate field error: The value already exists."
                )
        }
    }
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading Avatar")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200,
                {},
                "Avatar updated successfully")
        )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "cover Image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading cover Image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200,
                {},
                "Cover Image updated successfully")
        )

})

const getUserChannelProfile = asyncHandler(async (req, res, next) => {
    try {
        const { username } = req.params;

        if (!username?.trim()) {
            throw new ApiError(400, "Username is missing");
        }

        const channel = await User.aggregate([
            {
                $match: {
                    username: username?.toLowerCase(),
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers",
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo",
                },
            },
            {
                $addFields: {
                    subscribersCount: { $size: "$subscribers" },
                    channelsSubscribedToCount: { $size: "$subscribedTo" },
                    isSubscribed: {
                        $cond: {
                            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
            {
                $project: {
                    fullName: 1,
                    username: 1,
                    subscribersCount: 1,
                    channelsSubscribedToCount: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1,
                },
            },
        ]);

        if (!channel?.length) {
            throw new ApiError(404, "Channel does not exist");
        }

        return res.status(200).json(new ApiResponse(200, channel[0], "User channel fetched successfully"));
    } catch (error) {
        throw new ApiError(401, error?.message || "Internal Error")
    }
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $match: {
                            isPublished: true
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    },
                    {
                        $sort: { createdAt: -1 }
                    }
                ]
            }
        },
        {
            $project: {
                watchHistory: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, user[0]?.watchHistory || [], "Watch history fetched successfully")
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    if (!token) {
        throw new ApiError(400, "Verification token is required");
    }

    const verificationToken = await Token.findOne({
        tokenHash: token,
        type: 'emailVerify',
        used: false,
        expiresAt: { $gt: new Date() }
    });

    if (!verificationToken) {
        throw new ApiError(400, "Invalid or expired verification token");
    }

    const user = await User.findById(verificationToken.user);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.isEmailVerified = true;
    await user.save();

    verificationToken.used = true;
    await verificationToken.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Email verified successfully. You can now log in.")
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(200).json(
            new ApiResponse(200, {}, "If your email is registered, you will receive a password reset link.")
        );
    }

    const resetToken = generateToken();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

    // Delete any existing reset tokens for this user
    await Token.deleteMany({
        user: user._id,
        type: 'resetPassword',
        used: false
    });

    await Token.create({
        user: user._id,
        tokenHash: resetToken,
        type: 'resetPassword',
        expiresAt: resetTokenExpiry,
        used: false
    });

    try {
        // Construct the reset link with the frontend URL
        const resetLink = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        // Send the reset link in the response for testing (remove in production)
        // console.log('Reset Link:', resetLink);

        await sendPasswordResetEmail(user, resetToken);
        return res.status(200).json(
            new ApiResponse(200, {}, "Password reset link has been sent to your email.")
        );
    } catch (error) {
        console.error('Failed to send password reset email:', error);
        throw new ApiError(500, "Failed to send password reset email");
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        throw new ApiError(400, "Token and new password are required");
    }

    // Find the token and ensure it's not expired or used
    const resetToken = await Token.findOne({
        tokenHash: token,
        type: 'resetPassword',
        used: false,
        expiresAt: { $gt: new Date() }
    }).populate('user');

    if (!resetToken) {
        throw new ApiError(400, "Invalid or expired reset token. Please request a new password reset link.");
    }

    // Check if user exists
    const user = resetToken.user;
    if (!user) {
        await Token.findByIdAndDelete(resetToken._id); // Clean up invalid token
        throw new ApiError(404, "User not found");
    }

    // Update user's password
    user.password = newPassword;
    user.refreshToken = undefined; // Invalidate any existing sessions
    await user.save();

    // Mark token as used
    resetToken.used = true;
    await resetToken.save();

    // Clean up any other active reset tokens for this user
    await Token.deleteMany({
        user: user._id,
        type: 'resetPassword',
        used: false
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successful. You can now log in with your new password.")
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    verifyEmail,
    forgotPassword,
    resetPassword
};