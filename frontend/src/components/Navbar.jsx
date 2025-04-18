import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Search, Upload, User, Video, MessageCircle, Home, Bird, Settings, LogOut, LayoutDashboard } from "lucide-react"; // Import icons
import { useEffect, useRef, useState } from "react";
import API from "../api.js";
import { Logo } from "./Index";
import UpdateAccount from "./UpdateAccountPopUp.jsx";
import UploadImagePopup from "./UpdateImages.jsx";
import ChangePasswordPopup from "./ChangePasswordPopup.jsx";

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [username, setUsername] = useState("");
  const [userdetails, setUserDetails] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isImageUploadPopupOpen, setImageUploadPopupOpen] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChnagePasswordPopupOpen, setIsChangePasswordPopupOpen] = useState(false);



  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const uploadRef = useRef(null);

  // Check if the current page is Twitter
  const isTwitterPage = location.pathname.includes("/twitter");

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/users/current-user");
        setUsername(res.data?.data?.username || "");
        setUserDetails(res.data?.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [userdetails]);

  // Fetch videos when not on Twitter page
  useEffect(() => {
    if (!isTwitterPage) {
      const fetchVideos = async () => {
        try {
          const res = await API.get("/videos");
          setVideos(res.data?.data || []);
        } catch (error) {
          console.error("Error fetching videos:", error);
        }
      };
      fetchVideos();
    }
  }, [isTwitterPage]); // Removed username


  // Fetch tweets when on Twitter page
  useEffect(() => {
    if (isTwitterPage && tweets.length === 0) { // Prevent redundant fetches
      const fetchTweets = async () => {
        try {
          const res = await API.get("/tweets/allTweets");
          setTweets(res.data?.data || []);
        } catch (error) {
          console.error("Error fetching tweets:", error);
        }
      };
      fetchTweets();
    }
  }, [isTwitterPage]);


  // Filter search results based on current page
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (!query.trim()) {
        setFilteredResults([]);
        setShowDropdown(false);
        return;
      }

      if (isTwitterPage) {
        setFilteredResults(
          tweets.filter(
            (tweet) =>
              tweet.content?.toLowerCase().includes(query.toLowerCase()) ||
              tweet.user?.username?.toLowerCase().includes(query.toLowerCase())
          )
        );
      } else {
        setFilteredResults(
          videos.filter(
            (video) =>
              video.title?.toLowerCase().includes(query.toLowerCase()) ||
              video.owner?.username?.toLowerCase().includes(query.toLowerCase())
          )
        );
      }
      setShowDropdown(true);
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(delaySearch);
  }, [query, videos, tweets, isTwitterPage]);


  // Logout function
  const handleLogout = async () => {
    try {
      const res = await API.post("/users/logout");
      if (res.data.success) {
        localStorage.removeItem("authToken");
        console.log("Logout successful");
        setUsername("");
        navigate("/login");
        
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (uploadRef.current && !uploadRef.current.contains(event.target)) {
        setUploadOpen(false);
      }
      const handleKeyDown = (event) => {
        if (event.key === "Escape") {
          setShowDropdown(false);
          setProfileOpen(false);
          setUploadOpen(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const openPopup = (type) => {
    setUploadType(type);
    setImageUploadPopupOpen(true);
    setSettingsOpen(false)
  };

  const handleImageUpload = async (file, type) => {
    if (!file || !type) {
      console.error("File or type is missing");
      return;
    }



    try {
      setLoading(true)
      const formData = new FormData();
      formData.append(type === "avatar" ? "avatar" : "coverImage", file);
      const endpoint =
        type === "avatar"
          ? `/users/avatar`
          : `/users/coverImage`;

      const response = await API.patch(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

    } catch (error) {
      console.error("Error uploading image:", error);
    }
    finally {
      setLoading(false);
    }
  };

  const  handleChangePassword = async (oldPassword, newPassword) => {
    try {
      const res = await API.post(`/users/change-password`,{oldPassword,newPassword})      
      

      if(res.data?.success){
        alert("Password changed successfully");
        setIsChangePasswordPopupOpen(false);
        
      }
    } catch (error) {
      console.error(error);
      
      
    }
  }


  return (
    <nav className="bg-gray-900 text-text shadow-md">
      <div className="container mx-auto px-4 py-3 flex w-full justify-between items-center">
        {/* Left: Logo */}
        <Link to="/" className="text-2xl font-bold text-accent flex-shrink-0">
          <Logo width={"5rem"} />
        </Link>

        {/* Middle: Search Bar */}
        <div ref={searchRef} className="flex sm:flex items-center mr-2 bg-secondary w-[35rem] py-1 sm:px-4 rounded-full relative">
          <div className="absolute left-2 flex items-center">
            <Search className="text-text" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent focus:outline-none px-10 w-full"
            onFocus={() => setShowDropdown(true)}
          />

          {/* Dropdown Search Results */}
          {showDropdown && (
            <div className="absolute top-full left-0 w-full bg-gray-800 text-white rounded-lg shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
              {filteredResults.length > 0 ? (
                filteredResults.map((result) =>
                  isTwitterPage ? (
                    <div key={result._id} className="px-4 py-2 border-b border-gray-700">
                      <p className="font-semibold">{result.user?.username}</p>
                      <p className="text-sm text-gray-400">{result.content}</p>
                    </div>
                  ) : (
                    <Link
                      key={result._id}
                      to={`/video/${result._id}`}
                      className="flex items-center px-4 py-2 hover:bg-gray-700 transition"
                    >
                      <img
                        src={result.thumbnail}
                        alt={result.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-semibold">{result.title}</p>
                        <p className="text-xs text-gray-400">{result.owner?.username}</p>
                      </div>
                    </Link>
                  )
                )
              ) : (
                <p className="px-4 py-2 text-gray-400">No results found</p>
              )}
            </div>
          )}
        </div>

        {/* Right: Profile & Links */}
        <div className="hidden md:flex items-center text-secondary space-x-6 z-10">
          <Link
            to="/"
            className={`hover:text-accent ${location.pathname === "/" ? "text-accent font-semibold" : ""}`}
          >
            Home
          </Link>
          <Link
            to="/twitter"
            className={`hover:text-accent ${location.pathname.startsWith("/twitter") ? "text-accent font-semibold" : ""}`}
          >
            Twitter
          </Link>
          <Link
            to="/dashboard"
            className={`hover:text-accent ${location.pathname.startsWith("/explore") ? "text-accent font-semibold" : ""}`}
          >
            Dashboard
          </Link>
          {/* Upload Dropdown */}
          <div className="relative" ref={uploadRef}>
            <button
              onClick={() => setUploadOpen(!uploadOpen)}
              className={`flex items-center hover:text-accent ${location.pathname.startsWith("/upload") ? "text-accent font-semibold" : ""}`}
            >
              <Upload size={18} className="mr-1" /> Upload
            </button>

            {uploadOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-secondary text-primary rounded-lg shadow-lg z-10">
                <Link
                  to="/upload/video"
                  className="flex items-center px-4 py-2 hover:bg-gray-700 transition"
                >
                  <Video size={18} className="mr-2" /> Video
                </Link>
                <Link
                  to="/upload/tweet"
                  className="flex items-center px-4 py-2 hover:bg-gray-700 transition"
                >
                  <MessageCircle size={18} className="mr-2" /> Tweet
                </Link>
              </div>
            )}
          </div>


          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative z-10">
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center hover:text-accent cursor-pointer">
              <User size={22} />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-secondary text-primary rounded-lg shadow-lg">
                <Link to={`/profile/${username}`} className="block px-4 py-2 hover:text-accent">Profile</Link>
                <button
                  className="block w-full text-left px-4 py-2 hover:text-accent"
                  onClick={() => setSettingsOpen(true)}
                >
                  Settings
                </button>
                <button className="w-full text-left px-4 py-2 hover:text-accent" onClick={handleLogout} >Logout</button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-secondary focus:outline-none"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={28} />
        </button>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-transparent bg-opacity-50 z-50 transition-opacity duration-300 ${mobileOpen ? "opacity-95 visible" : "opacity-0 invisible"
            }`}
          onClick={() => setMobileOpen(false)} // Close on outside click  
        >
          {/* Slide-in Sidebar */}
          <div
            className={`fixed top-0 left-0 h-full w-64 bg-gray-900 shadow-lg transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white text-md focus:outline-none"
              onClick={() => setMobileOpen(false)}
            >
              ✖
            </button>

            {/* Menu Container */}
            <div className="flex flex-col space-y-4 mt-10 text-white text-sm font-semibold">

              {/* Navigation Section */}
              <div className="space-y-2">
                <Link to="/" className="flex items-center px-6 py-3 hover:bg-gray-700 transition">
                  <Home size={20} className="mr-3" /> Home
                </Link>
                <Link to="/twitter" className="flex items-center px-6 py-2 hover:bg-gray-700 transition">
                  <Bird size={20} className="mr-3" /> Twitter
                </Link>
                <Link to="/dashboard" className="flex items-center px-6 py-2 hover:bg-gray-700 transition">
                  <LayoutDashboard size={20} className="mr-3" /> Dashboard
                </Link>
              </div>

              {/* User Section */}
              <div className="border-t border-gray-600 pt-2 space-y-2">
                <Link to={`/profile/${username}`} className="flex items-center px-6 py-2 hover:bg-gray-700 transition">
                  <User size={20} className="mr-3" /> Profile
                </Link>
                <Link to="/upload/video" className="flex items-center px-6 py-2 hover:bg-gray-700 transition">
                  <Video size={20} className="mr-3" /> Upload Video
                </Link>
                <Link to="/upload/tweet" className="flex items-center px-6 py-2 hover:bg-gray-700 transition">
                  <MessageCircle size={20} className="mr-3" /> Upload Tweet
                </Link>
              </div>

              {/* Settings Section */}
              <div className="border-t border-gray-600 pt-2 space-y-2">
                <Link className="flex items-center px-6 py-2 hover:bg-gray-700 transition" onClick={() => setSettingsOpen(true)}>
                  <Settings size={20} className="mr-3" /> Settings
                </Link>
              </div>

              {/* Logout Button */}
              <div className="border-t border-gray-600 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center px-6 py-2 text-red-400 hover:bg-gray-700 transition text-left w-full"
                >
                  <LogOut size={20} className="mr-3" /> Logout
                </button>
              </div>

            </div>


          </div>
        </div>



      </div>
      {settingsOpen && (
        <div
          className={`fixed inset-0 bg-transparent bg-opacity-50 z-50 transition-opacity duration-300 ${settingsOpen ? "opacity-95 visible" : "opacity-0 invisible"
            }`}
          onClick={() => setSettingsOpen(false)}
        >
          {/* Slide-in Settings Panel */}
          <div
            className={`fixed top-0 right-0 h-full w-64 bg-gray-900 text-white shadow-lg transform transition-transform duration-300 ${settingsOpen ? "translate-x-0" : "translate-x-full"
              } z-50`}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white text-lg focus:outline-none"
              onClick={() => setSettingsOpen(false)}
            >
              ✖
            </button>

            {/* Settings Content */}
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Settings</h2>

              {/* Update Account */}
              <div>
                <button
                  onClick={() => { setShowPopup(true); setSettingsOpen(false) }} // Open popup on click
                  className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded cursor-pointer">
                  Update Account
                </button>
              </div>

              {/* Update Avatar */}
              <div>
                <button
                  onClick={() => openPopup("avatar")}
                  className="w-full bg-green-600 hover:bg-green-700 py-2 rounded cursor-pointer">
                  Change Avatar
                </button>
              </div>

              {/* Update Cover Image */}
              <div>
                <button
                  onClick={() => openPopup("coverImage")}
                  className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded cursor-pointer">
                  Change Cover
                </button>
              </div>

              {/* Change Password */}
              <div>
                <button
                  onClick={() => {setIsChangePasswordPopupOpen(true); setSettingsOpen(false)}}
                  className="w-full bg-red-600 hover:bg-red-700 py-2 rounded cursor-pointer">
                  Change Password
                </button>
                </div>
            </div>
          </div>

        </div>

      )}
      {showPopup && (
        <UpdateAccount
          user={{ fullName: userdetails.fullName, email: userdetails.email }}
          openClose={true}
          onClose={() => setShowPopup(false)}
        />
      )}
      {/* Upload Image Popup */}
      <UploadImagePopup
        isOpen={isImageUploadPopupOpen}
        onClose={() => setImageUploadPopupOpen(false)}
        type={uploadType}
        currentImage={userdetails?.[uploadType]}
        onUpload={handleImageUpload}
      />
      {/* Change Password Popup */}
      {isChnagePasswordPopupOpen && (
              <ChangePasswordPopup
                user={{ fullName: userdetails.fullName, email: userdetails.email }}
                isOpen={isChnagePasswordPopupOpen}
                onClose={() => setIsChangePasswordPopupOpen(false)}
                onChangePassword={handleChangePassword}

              />
            )}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-10 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Uploading...</h2>
            <p className="text-white">Please wait...</p>
          </div>
        </div>
      )}


    </nav>

  );
}