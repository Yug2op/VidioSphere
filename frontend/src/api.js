import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Important for sending cookies (refresh token)
});


// Flags and subscribers to handle token refresh
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Automatically refresh token ONLY if error is due to expiration
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent refresh loop for refresh-token request
    if (originalRequest.url.includes("/users/refresh-token")) {
      return Promise.reject(error);
    }

    // Handle login failures separately (don't refresh token on login errors)
    if (originalRequest.url.includes("/users/login") && error.response?.status === 403) {
      // Check for unverified email error first
      if (error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        return Promise.reject(error);
      }
      return Promise.reject(error);
    }

    // Handle missing refresh token (403 Forbidden) - force logout
    if (error.response?.status === 403) {
      console.error("No refresh token available. Redirecting to login...");
      localStorage.removeItem("authToken"); // Clear old token
      showSessionExpiredMessage();
      return Promise.reject(error);
    }

    // **Ensure token refresh happens ONLY for expired access tokens**
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      error.response?.data?.message === "Access token expired"
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const res = await API.post("/users/refresh-token");

          // Save new token
          localStorage.setItem("authToken", res.data.data.accessToken);

          // Update queued requests
          onRefreshed(res.data.data.accessToken);

          isRefreshing = false;
        } catch (refreshError) {
          console.error("Refresh attempt failed. Redirecting to login...");
          localStorage.removeItem("authToken");
          showSessionExpiredMessage();
        }
      }

      // Queue pending requests
      return new Promise((resolve) => {
        refreshSubscribers.push((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          resolve(API(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

// Attach token to every request (if available)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Function to show session expiry message with a countdown
const showSessionExpiredMessage = () => {
  let countdown = 5;

  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; font-family: Arial, sans-serif; text-align: center; background-color: #111827; color: tomato;">
      <h2>Session expired</h2>
      <p>
        Please <a href="/login" style="color: blue; text-decoration: none;">Log In</a> again to watch videos.
      </p>
      <p>Redirecting to login in <span id="countdown">${countdown}</span> seconds...</p>
    </div>
  `;

  const interval = setInterval(() => {
    countdown--;
    document.getElementById("countdown").textContent = countdown;
    if (countdown <= 0) {
      clearInterval(interval);
      window.location.href = "/login";
    }
  }, 1000);
};

export default API;
