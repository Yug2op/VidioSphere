import './App.css'
import './index.css'
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from './pages/Home';
import ProfilePage from './pages/ProfilePage';
import Playlist from './pages/Playlist';
import VideoPlayer from './pages/VideoPlayer';
import VideoUpload from './pages/VideoUpload';
import TwitterPage from './pages/TwitterPage';
import TweetUpload from './pages/TweetUpload';
import Dashboard from './pages/Dashboard';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from './pages/VerifyEmail';

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="dark"
      />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/twitter' element={<TwitterPage />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/playlist/:playlistId" element={<Playlist />} />
        <Route path="/video/:videoId" element={<VideoPlayer />} />
        <Route path="/upload/video" element={<VideoUpload />} />
        <Route path="/upload/tweet" element={<TweetUpload />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </>
  );
}

export default App;
