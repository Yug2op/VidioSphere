import { useEffect, useState } from "react";

export default function UploadImagePopup({ isOpen, onClose, type, currentImage, onUpload }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(""); // Start with an empty string

    useEffect(() => {
        if (currentImage && !selectedFile) {
            setPreview(currentImage); // Update preview when currentImage changes
        }
    }, [currentImage, selectedFile]);

    // Handle file selection and preview
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file)); // Show preview of new image
        }
    };

    // Handle upload
    const handleUpload = () => {
        if (selectedFile) {
            onUpload(selectedFile,type); // Pass file to parent
            onClose();
        }
    };

    return isOpen ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-semibold text-red mb-4 text-center">
                    Upload {type === "avatar" ? "avatar" : "coverImage"}
                </h2>

                {/* Image Preview */}
                <div className="w-full flex justify-center mb-4">
                    {preview ? (
                        <img 
                            src={preview} 
                            alt="Preview" 
                            className={`rounded-lg object-cover ${type === "avatar" ? "w-32 h-32" : "w-full h-40"}`}
                            onError={() => console.log("Image failed to load:", preview)}
                        />
                    ) : (
                        <p className="text-white">No Image Available</p>
                    )}
                </div>

                {/* File Input */}
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="text-white"
                />

                {/* Action Buttons */}
                <div className="mt-4 flex justify-between">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-500 rounded">Cancel</button>
                    <button 
                        onClick={handleUpload} 
                        className="px-4 py-2 bg-blue-500 rounded text-white" 
                        disabled={!selectedFile}
                    >
                        Upload
                    </button>
                </div>
            </div>
        </div>
    ) : null;
}
