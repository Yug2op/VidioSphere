import { useEffect, useState } from "react";
import API from "../api";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { LayoutDashboard, Video, Users, ThumbsUp, Eye } from "lucide-react";
import WatchedVideos from "../components/WatchedVideos";
import Navbar from "../components/Navbar";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await API("/dashboard/stats");
        if (result.data.success) {
          setStats(result.data.data);
        } else {
          setError("Failed to fetch stats.");
        }
      } catch (error) {
        setError("Error fetching channel stats.");
        console.error(error);
      }
    };

    fetchStats();
  }, []);

  // Define chart data
  const chartData = stats
    ? {
        labels: ["Videos", "Subscribers", "Video Likes", "Tweet Likes", "Comment Likes", "Views"],
        datasets: [
          {
            label: "Channel Stats",
            data: [
              stats.totalVideos,
              stats.totalSubscribers,
              stats.totalVideoLikes,
              stats.totalTweetLikesCount,
              stats.totalCommentLikes,
              stats.totalViews,
            ],
            backgroundColor: ["#4CAF50", "#FF9800", "#E91E63", "#3F51B5", "#00BCD4", "#FF5722"],
          },
        ],
      }
    : null;

  const statItems = stats
    ? [
        { label: "Videos", value: stats.totalVideos, icon: <Video size={24} /> },
        { label: "Subscribers", value: stats.totalSubscribers, icon: <Users size={24} /> },
        { label: "Video Likes", value: stats.totalVideoLikes, icon: <ThumbsUp size={24} /> },
        { label: "Tweet Likes", value: stats.totalTweetLikesCount, icon: <ThumbsUp size={24} /> },
        { label: "Comment Likes", value: stats.totalCommentLikes, icon: <ThumbsUp size={24} /> },
        { label: "Views", value: stats.totalViews, icon: <Eye size={24} /> },
      ]
    : [];

  return (<>
  <Navbar />
    <div className="p-4 sm:p-6 bg-gray-900 min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center gap-2">
        <LayoutDashboard className="w-7 h-7 text-blue-500" />
        <h1 className="text-xl sm:text-2xl font-bold">Channel Dashboard</h1>
      </div>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      {stats ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-6">
            {statItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="p-3 bg-gray-700 rounded-lg">{item.icon}</div>
                <div>
                  <h2 className="text-sm sm:text-lg font-semibold">{item.label}</h2>
                  <p className="text-xl sm:text-2xl font-bold">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="bg-gray-800 p-4 sm:p-6 mt-6 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Channel Performance</h2>
            <div className="w-full h-[250px] sm:h-[350px]">
              {chartData && <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />}
            </div>
          </div>
        </>
      ) : (
        <p className="mt-6 text-center">Loading...</p>
    )}

    <div className="mt-6">
        <p className="text-gray-400 mb-4 text-center">Here are the videos you have watched recently:</p>
        {/* Watched Videos */}
    <WatchedVideos/>
    </div>

   
    </div>
    </> );
};

export default Dashboard;
