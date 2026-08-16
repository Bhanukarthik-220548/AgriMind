import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Sprout } from 'lucide-react';

export default function Login() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegistering) {
                // Call POST /api/auth/register
                const response = await client.post('/auth/register', { name, email, password });
                localStorage.setItem('token', response.data.token);
                navigate('/dashboard');
            } else {
                // Call POST /api/auth/login
                const response = await client.post('/auth/login', { email, password });
                localStorage.setItem('token', response.data.token);
                navigate('/dashboard');
            }
        } catch (err) {
            // On failure: show error message
            setError(err.response?.data?.message || `${isRegistering ? 'Registration' : 'Login'} failed. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-emerald-100 p-3 rounded-full mb-4 text-emerald-600">
                        <Sprout size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">AgriMind AI</h2>
                    <p className="text-slate-500 mt-2 text-center">
                        {isRegistering ? 'Create a new account' : 'Sign in to access advanced crop analysis'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {isRegistering && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                            <input 
                                type="text" 
                                required={isRegistering} 
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors outline-none"
                                placeholder="Alice Farmer"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                        <input 
                            type="email" 
                            required 
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors outline-none"
                            placeholder="farmer@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
                    >
                        {loading ? (isRegistering ? 'Creating Account...' : 'Signing In...') : (isRegistering ? 'Create Account' : 'Sign In')}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    {isRegistering ? (
                        <>
                            Already have an account?{' '}
                            <button 
                                onClick={() => setIsRegistering(false)} 
                                className="text-emerald-600 font-semibold hover:underline"
                            >
                                Sign In
                            </button>
                        </>
                    ) : (
                        <>
                            Don't have an account yet?{' '}
                            <button 
                                onClick={() => setIsRegistering(true)} 
                                className="text-emerald-600 font-semibold hover:underline"
                            >
                                Register
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
