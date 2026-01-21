import React from 'react';
import { useAuth } from '../context/AuthContext';
import SignIn from './SignIn';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-2 w-24 bg-gray-300 rounded mb-2"></div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest">Initializing...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <SignIn />;
    }

    return <>{children}</>;
}
