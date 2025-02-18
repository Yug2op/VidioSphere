// Importing necessary dependencies
import mongoose, { Schema } from "mongoose"; // Mongoose for MongoDB interaction
import jwt from "jsonwebtoken"; // For creating JSON Web Tokens
import bcrypt from "bcrypt"; // For hashing and comparing passwords

// Define the User schema
const userSchema = new Schema(
    {
        username: {
            type: String, // Data type is String
            required: true, // This field is mandatory
            unique: true, // Ensures no two users can have the same username
            trim: true, // Removes whitespace from the beginning and end of the value
            index: true // Adds an index for faster query performance
        },
        email: {
            type: String,
            required: true, // Email is mandatory
            unique: true, // Ensures uniqueness of email
            lowercase: true, // Converts value to lowercase
            trim: true
        },
        fullName: {
            type: String,
            required: true, // Full name is required
            trim: true, // Trims whitespace
            index: true // Adds an index for faster searches
        },
        avatar: {
            type: String,
            required: true, // Avatar URL is mandatory
        },
        coverImage: {
            type: String, // Optional cover image URL
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId, // Reference to a Video document
                ref: "video" // Refers to the "video" collection
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"] // Password is mandatory with a custom error message
        },
        refreshToken: {
            type: String // Field to store the refresh token
        }
    },
    { timestamps: true } // Automatically manages createdAt and updatedAt fields
);

// Middleware to hash the password before saving the document
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) { // Checks if the password field has been modified
        this.password = await bcrypt.hash(this.password, 12); // Hashes the password with a salt factor of 12
    }
    next(); // Proceeds to the next middleware or operation
});

// Instance method to verify if a given password matches the stored hash
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password); // Compares the plain text password with the hashed password
};

// Instance method to generate an access token for the user
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id, // Embeds user ID in the token
            email: this.email, // Embeds user email in the token
            username: this.username, // Embeds username in the token
            fullName: this.fullName // Embeds full name in the token
        },
        process.env.ACCESS_TOKEN_SECRET, // Secret key for signing the token
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY // Sets token expiration time
        }
    );
};

// Instance method to generate a refresh token for the user
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id, // Embeds user ID in the refresh token
        },
        process.env.REFRESH_TOKEN_SECRET, // Secret key for signing the refresh token
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY // Sets refresh token expiration time
        }
    );
};

// Exporting the User model based on the userSchema
export const User = mongoose.model("User", userSchema);
