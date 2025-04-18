import React from 'react';
import MyLogo from "../assets/MyLogo_White.png"

function Logo({ width = '100px' }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className="text-2xl font-bold text-white text-2xl font-bold text-white hover:text-blue-400"
        style={{ width: width, height: "20px", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <img
          src={MyLogo}
          alt="Logo"
        />
      </div>
    </div>
  );
}

export default Logo;
