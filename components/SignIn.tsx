import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';
import { auth } from '../services/firebase';

export default function SignIn() {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isSignUp) {
                await signUpWithEmail(email, password);
            } else {
                await signInWithEmail(email, password);
            }
        } catch (err: any) {
            const msg = err.code ? err.code.replace('auth/', '').replace(/-/g, ' ') : 'Authentication failed';
            setError(msg.charAt(0).toUpperCase() + msg.slice(1));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        setLoading(true);
        console.log("Starting Google Sign In...");

        // Debug Config
        try {
            // @ts-ignore
            console.log("Firebase Auth Config:", auth.app.options);
        } catch (e) {
            console.error("Could not log auth config", e);
        }

        try {
            await signInWithGoogle();
        } catch (err: any) {
            console.error("Google Sign In Error:", err);
            let msg = err.code ? err.code.replace('auth/', '').replace(/-/g, ' ') : (err.message || 'Google Sign In Failed');

            // Capitalize
            msg = msg.charAt(0).toUpperCase() + msg.slice(1);

            // Append raw code if available for clarity
            if (err.code) {
                msg += ` (${err.code})`;
            }

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-light text-gray-900 tracking-tight mb-2">AUTH</h1>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">
                        {isSignUp ? 'New Identity Registration' : 'Identify Yourself'}
                    </p>
                </div>

                <div className="space-y-6">
                    <p className="text-gray-600 text-center font-light text-sm">
                        {isSignUp ? 'Initialize a new mentorship protocol.' : 'Access to the White Room is restricted.'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors text-sm"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors text-sm"
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-xs text-center">{error}</div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 hover:bg-black text-white px-6 py-2 rounded transition-all duration-300 disabled:opacity-50 text-sm tracking-wide"
                        >
                            {loading ? 'Processing...' : (isSignUp ? 'Register' : 'Sign In')}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-white text-gray-500">OR</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        type="button"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded transition-all duration-300 group text-sm disabled:opacity-50"
                    >
                        <LogIn size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                        <span>Sign in with Google</span>
                    </button>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                            className="text-xs text-gray-500 hover:text-gray-900 underline underline-offset-2"
                        >
                            {isSignUp ? 'Already have an ID? Sign In' : 'Need an ID? Register'}
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <span className="text-[10px] text-gray-300">System ID: WR-738A7 // Secure Connection</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
