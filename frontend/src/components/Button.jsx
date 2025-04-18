import React from "react";

export default function Button({
    children,
    type = "button",
    bgColor = "bg-blue-700",
    hoverBgColor = "hover:bg-red-400 hover:text-gray-900",
    textColor = "text-white",
    className = "",
    ...props
}) {
    return (
        <button
            type={type}
            className={`px-4 py-2 rounded-lg ${bgColor} ${hoverBgColor} ${textColor} ${className} transition-colors duration-200`}
            {...props}
        >
            {children}
        </button>
    );
}
