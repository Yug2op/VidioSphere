import { useState } from "react";
import API from "../api";
import Input from "./Input";

const UpdateAccount = ({ user, openClose, onClose }) => {
    const [isOpen, setIsOpen] = useState(openClose);
    const [fullName, setFullName] = useState(user.fullName || "");
    const [email, setEmail] = useState(user.email || "");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.patch("/users/update-account", { fullName, email });
            setIsOpen(false);
            onClose(); // Close modal in parent component
        } catch (error) {
            console.error("Error updating account:", error);
        }
    };

    if (!isOpen) return null; // Prevent rendering when modal is closed

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 z-10 bg-opacity-50">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl text-white font-semibold mb-4">Update Account Details</h2>

                <form onSubmit={handleSubmit}>
                    <label className="block text-gray-400">Full Name:</label>
                    <Input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full text-gray-200 p-2 border rounded"
                        required
                    />

                    <label className="block text-gray-400 mt-4">Email:</label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-gray-200 p-2 border rounded mb-3"
                        required
                    />

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose} // Close modal from parent
                            className="px-4 py-2 bg-red-400 text-white rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateAccount;
