// Importing necessary dependencies
import mongoose, { Schema } from "mongoose"; // Mongoose for MongoDB interaction
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // Plugin for pagination in aggregation queries

// Define the Video schema
const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // Data type is String
            required: true, // Video file is mandatory
        },
        thumbnail: {
            type: String, // Thumbnail image URL as a string
            required: true, // Thumbnail is mandatory
        },
        title: {
            type: String, // Video title as a string
            required: true, // Title is mandatory
        },
        description: {
            type: String, // Video description as a string
            required: true, // Description is mandatory
        },
        duration: {
            type: Number, // Video duration as a number
            required: true, // Duration is mandatory
        },
        views: {
            type: Number, // Number of views as a number
            default: 0, // Default value is 0
        },
        isPublished: {
            type: Boolean, // Boolean to indicate if the video is published
            default: true, // Default value is true
        },
        owner: {
            type: Schema.Types.ObjectId, // Reference to a User document
            ref: "User" // Refers to the "User" collection
        }
    },
    {
        timestamps: true // Automatically adds createdAt and updatedAt fields
    }
);

// Adding the pagination plugin to the schema
videoSchema.plugin(mongooseAggregatePaginate); // Enables pagination for aggregation queries

// Exporting the Video model based on the videoSchema
export const Video = mongoose.model("Video", videoSchema);
