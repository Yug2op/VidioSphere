import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function SearchBar({ tweets }) {
  const [query, setQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (!query.trim()) {
      setFilteredUsers([]);
      setShowDropdown(false);
      return;
    }

    if (location.pathname.includes("/twitter")) {
      // Extract unique user IDs from tweets
      const userIds = [...new Set(tweets.map(tweet => tweet.userId))];

      // Fetch user details dynamically
      const fetchUsers = async () => {
        try {
          const response = await fetch(`/api/users?ids=${userIds.join(",")}`);
          const users = await response.json();

          // Filter users based on search query
          const results = users.filter(user =>
            user.username.toLowerCase().includes(query.toLowerCase())
          );

          setFilteredUsers(results);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };

      fetchUsers();
    }

    setShowDropdown(true);
  }, [query, tweets, location.pathname]);

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center bg-secondary py-1 px-2 rounded-full">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent focus:outline-none px-2 w-full"
        />
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 w-full bg-gray-800 text-white rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <Link
                key={user._id}
                to={`/profile/${user.username}`}
                className="flex items-center px-4 py-2 hover:bg-gray-700 transition"
              >
                <img
                  src={user.profilePic}
                  alt={user.username}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="ml-3">
                  <p className="text-sm font-semibold">{user.username}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="px-4 py-2 text-gray-400">No results found</p>
          )}
        </div>
      )}
    </div>
  );
}
