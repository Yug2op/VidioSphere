import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useParams } from "react-router-dom";
import API from "../api.js"; 
import { Input, Button } from "./Index.js";

export default function PlaylistPopup({ isOpen, onClose, loggedInUserId }) {
    const { playlistId } = useParams();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [ownerId, setOwnerId] = useState(null);
    const isEditing = !!playlistId; // Check if we are editing

    // Fetch playlist details if editing
    useEffect(() => {
        if (isEditing) {
            const fetchPlaylist = async () => {
                try {
                    const { data } = await API.get(`/playlist/${playlistId}`);
                    setName(data.name);
                    setDescription(data.description);
                    setOwnerId(data.owner); // Store owner ID for permission check
                } catch (error) {
                    console.error("Error fetching playlist:", error);
                    alert("Failed to fetch playlist details.");
                }
            };
            fetchPlaylist();
        }
    }, [playlistId, isEditing]);

    const handleSubmit = async () => {
        if (!name.trim() || !description.trim()) return alert("All fields are required!");

        try {
            if (isEditing) {
                await API.patch(`/playlist/${playlistId}`, { name, description });
                alert("Playlist updated successfully!");
            } else {
                await API.post("/playlist/", { name, description });
                alert("Playlist created successfully!");
            }
            setName("");
            setDescription("");
            onClose(); // Close modal after success
        } catch (error) {
            console.error("Error:", error);
            alert(`Failed to ${isEditing ? "update" : "create"} playlist.`);
        }
    };

    if (!isOpen) return null; // Hide modal if not open
    if (isEditing && loggedInUserId !== ownerId) return null; // Hide if user is not the owner

    return (
        <div className="fixed inset-0 flex items-center justify-center z-10 bg-black/50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl text-white">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
                        {isEditing ? "Edit Playlist" : "Create Playlist"}
                    </h2>
                    <button onClick={onClose}>
                        <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </button>
                </div>
                <div className="mt-4 space-y-4">
                    <Input
                        className="text-sm sm:text-base"
                        placeholder="Playlist Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                        className="text-sm sm:text-base"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
                    <Button className="w-full sm:w-auto" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button className="w-full sm:w-auto" onClick={handleSubmit}>
                        {isEditing ? "Update" : "Create"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
