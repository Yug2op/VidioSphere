import { useState } from "react";
import API from "../api.js"; // Your API instance
import { UploadCloud, Image, Video } from "lucide-react";
import { useNavigate } from "react-router";

export default function UploadVideo() {
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);

    const navigate = useNavigate()

    // Handle file selection
    const handleFileChange = (event, type) => {
        const file = event.target.files[0];
        if (!file) return;

        if (type === "video") {
            setVideoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        } else if (type === "thumbnail") {
            setThumbnail(file);
        }
    };

    // Handle video upload
    const handleUpload = async (event) => {
        event.preventDefault();

        // Validation
        if (!videoFile || !thumbnail || !title.trim() || !description.trim()) {
            alert("All fields are required!");
            return;
        }

        const formData = new FormData();
        formData.append("videoFile", videoFile);
        formData.append("thumbnail", thumbnail);
        formData.append("title", title);
        formData.append("description", description);

        try {
            setUploading(true);
            const res = await API.post("/videos/upload/video", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data.success) {
                alert("Video uploaded successfully!");
                setVideoFile(null);
                setThumbnail(null);
                setPreviewUrl("");
                setTitle("");
                setDescription("");
                navigate("/")

            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload video.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full min-h-screen mx-auto p-6 bg-gray-900 text-white ">
            <div className="max-w-2xl mx-auto p-6 mt-10 bg-gray-800 rounded-lg shadow-lg shadow-white/3">
                <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    {/* Video Upload */}
                    <label className="flex flex-col items-center border-2 border-dashed border-gray-500 rounded-lg p-4 cursor-pointer">
                        <Video size={24} className="mb-2 text-gray-400" />
                        {videoFile ? videoFile.name : "Choose Video"}
                        <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e, "video")} />
                    </label>

                    {/* Video Preview */}
                    {previewUrl && (
                        <video src={previewUrl} controls className="w-full rounded-lg mt-2"></video>
                    )}

                    {/* Thumbnail Upload */}
                    <label className="flex flex-col items-center border-2 border-dashed border-gray-500 rounded-lg p-4 cursor-pointer">
                        <Image size={24} className="mb-2 text-gray-400" />
                        {thumbnail ? thumbnail.name : "Choose Thumbnail"}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "thumbnail")} />
                    </label>

                    {/* Title */}
                    <input
                        type="text"
                        placeholder="Video Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
                    />

                    {/* Description */}
                    <textarea
                        placeholder="Video Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
                        rows="3"
                    ></textarea>
                    <p className="text-center translate-middle-x">{uploading ? "Hold tight your video is Uploading..." : ""}</p>

                    {/* Upload Button */}
                    <button
                        type="submit"
                        className="w-full bg-red-400 py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:text-gray-300 hover:bg-red-500 transition ease-in-out duration-300 disabled:opacity-50 "
                        disabled={uploading}
                    >
                        <UploadCloud size={20} className="inline-block" />

                        {uploading ? "Uploading..." : "Upload Video"}
                    </button>
                </form>
            </div>
        </div>
    );
}
