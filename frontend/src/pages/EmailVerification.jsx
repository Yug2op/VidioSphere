import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmail as verifyEmailApi } from '../api';
import { toast } from 'react-toastify';

const EmailVerification = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying');
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                if (!token) {
                    setStatus('missing-token');
                    return;
                }

                await verifyEmailApi(token);
                setStatus('success');
                toast.success('Email verified successfully! You can now log in.');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (error) {
                console.error('Email verification failed:', error);
                setStatus('error');
                toast.error(error.response?.data?.message || 'Failed to verify email. The link may have expired.');
            }
        };

        verifyEmail();
    }, [token, navigate]);

    const renderContent = () => {
        switch (status) {
            case 'verifying':
                return (
                    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                            <div className="text-center">
                                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verifying Your Email</h2>
                                <p className="mt-2 text-sm text-gray-600">Please wait while we verify your email address...</p>
                            </div>
                            <div className="flex justify-center">
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        </div>
                    </div>
                );

            case 'success':
                return (
                    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                        <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
                            <div className="flex justify-center text-green-500">
                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Email Verified Successfully!</h2>
                            <p className="text-gray-600">Your email has been verified. Redirecting you to login...</p>
                        </div>
                    </div>
                );

            case 'missing-token':
            case 'error':
                return (
                    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                        <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
                            <div className="flex justify-center text-red-500">
                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
                            <p className="text-gray-600">
                                {status === 'missing-token'
                                    ? 'Verification token is missing. Please use the link from your email.'
                                    : 'The verification link is invalid or has expired. Please request a new verification email.'}
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Go to Login
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return renderContent();
};

export default EmailVerification;
