import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button, Logo } from '../components/Index.js';
import API from '../api';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setVerificationStatus('error');
                setError('No verification token provided');
                toast.error('No verification token provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                await API.get(`/users/verify-email?token=${encodeURIComponent(token)}`);

                setVerificationStatus('success');
                toast.success('Email verified successfully! You can now log in.');

                // Redirect to login after a short delay
                setTimeout(() => {
                    navigate('/login');
                }, 3000);

            } catch (error) {
                console.error('Email verification error:', error);
                const errorMessage = error.response?.data?.message || 'Failed to verify email. The link may have expired or is invalid.';
                setVerificationStatus('error');
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    const resendVerificationEmail = async () => {
        const token = searchParams.get('token');
        if (!token) return;

        try {
            setLoading(true);
            await API.post('/users/resend-verification', { token });
            toast.success('Verification email resent! Please check your inbox.');
        } catch (error) {
            console.error('Resend verification error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to resend verification email. Please try again later.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

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
                    {loading ? (
                        <div className="space-y-6">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                            <h1 className="text-2xl font-bold text-white">Verifying your email...</h1>
                            <p className="text-gray-400">Please wait while we verify your email address.</p>
                        </div>
                    ) : verificationStatus === 'success' ? (
                        <div className="space-y-6">
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
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Email Verified!</h1>
                            <p className="text-gray-400">Your email has been successfully verified. You'll be redirected to login shortly.</p>
                            <Button
                                onClick={() => navigate('/login')}
                                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Go to Login
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-900/20 mb-6">
                                <svg
                                    className="h-8 w-8 text-red-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Verification Failed</h1>
                            <p className="text-gray-400">{error || 'There was a problem verifying your email address.'}</p>
                            <div className="space-y-4 mt-6">
                                <Button
                                    onClick={resendVerificationEmail}
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Sending...' : 'Resend Verification Email'}
                                </Button>
                                <Button
                                    onClick={() => navigate('/login')}
                                    variant="outline"
                                    className="w-full bg-transparent hover:bg-gray-700 text-white border border-gray-600"
                                >
                                    Back to Login
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
