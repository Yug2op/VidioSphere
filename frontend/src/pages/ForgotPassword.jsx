import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button, Input, Logo } from '../components/Index.js';
import API from '../api';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await API.post('/users/forgot-password', { email });
      setEmailSent(true);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send reset email. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full bg-gray-900 text-white px-4 sm:px-6">
        <div className="mx-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-gray-800 rounded-xl p-6 sm:p-8 md:p-10 border border-gray-700">
          <div className="mb-6 flex justify-center">
            <span className="inline-block w-24 sm:w-28">
              <Link to="/">
                <Logo width="100%" />
              </Link>
            </span>
          </div>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-900/20 mb-6">
              <svg
                className="h-8 w-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
            <p className="text-gray-400 text-sm mb-6">
              We've sent a password reset link to <span className="text-white font-medium">{email}</span>.
              Please check your email and follow the instructions to reset your password.
            </p>
            <p className="text-gray-400 text-sm">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setEmailSent(false)}
                className="font-medium text-blue-400 hover:underline"
                type="button"
              >
                try again
              </button>
            </p>
            <div className="mt-8">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-gray-900 text-white px-4 sm:px-6">
      <div className="mx-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-gray-800 rounded-xl p-6 sm:p-8 md:p-10 border border-gray-700">
        <div className="mb-6 flex justify-center">
          <span className="inline-block w-24 sm:w-28">
            <Link to="/">
              <Logo width="100%" />
            </Link>
          </span>
        </div>
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-white mb-2">
          Forgot Password
        </h1>
        <p className="text-center text-sm text-gray-400 mb-8">
          Enter your email and we'll send you a link to reset your password
        </p>

        {error && (
          <div className="p-3 mb-6 text-sm text-red-400 bg-red-900/20 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-gray-200"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <div className="text-center text-sm text-gray-400">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-400 hover:underline"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;