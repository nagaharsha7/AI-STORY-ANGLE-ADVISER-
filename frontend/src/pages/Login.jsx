import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLock, FiMail, FiUser, FiAlertCircle } from 'react-icons/fi';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { user, login, signup, loading, isMockMode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect straight to dashboard
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        setError('Please fill in all registration fields.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      try {
        await signup(email, password, name);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error("Signup failed:", err);
        if (err.code === 'auth/email-already-in-use') {
          setError('Email is already in use by another account.');
        } else {
          setError(err.message || 'Registration failed. Please try again.');
        }
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setError('Please fill in all credentials.');
        return;
      }
      try {
        await login(email, password);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error("Login failed:", err);
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(err.message || 'Login failed. Please check your network connection.');
        }
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-darkbg-deep px-4 overflow-hidden">
      {/* Background Decorative Glow Bubbles */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-brand/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-brand-dark/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Brand/App Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-brand-dark to-brand items-center justify-center font-black text-2xl text-white shadow-xl shadow-brand/20 mb-3">
            TT
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white tracking-tight uppercase">
            TELANGANA TODAY
          </h2>
          <p className="text-xs text-brand tracking-widest font-semibold uppercase mt-1">
            AI Story Angle Advisor
          </p>
        </div>

        {/* Login/Signup Panel */}
        <div className="glass-panel rounded-2xl p-8 glow-orange">
          <h3 className="font-display font-bold text-lg text-white mb-6">
            {isSignUp ? 'Create Admin Account' : 'Admin Sign In'}
          </h3>

          {isMockMode && (
            <div className="mb-5 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs leading-relaxed">
              <span className="font-bold">Demo Mode:</span> Registering or signing in will use a local browser database (localStorage). No Firebase account is needed.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label htmlFor="name" className="text-xs text-gray-400 block mb-1.5 font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <FiUser size={16} />
                  </span>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-darkbg-deep/50 border border-darkbg-border rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="text-xs text-gray-400 block mb-1.5 font-medium">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <FiMail size={16} />
                </span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="editor@telanganatoday.com"
                  className="w-full bg-darkbg-deep/50 border border-darkbg-border rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="text-xs text-gray-400 block mb-1.5 font-medium">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <FiLock size={16} />
                </span>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-darkbg-deep/50 border border-darkbg-border rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40 transition-all"
                  required
                />
              </div>
            </div>

            {/* Confirm Password (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="text-xs text-gray-400 block mb-1.5 font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <FiLock size={16} />
                  </span>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-darkbg-deep/50 border border-darkbg-border rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
                <FiAlertCircle size={14} className="shrink-0" />
                <span className="font-mono">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white transition-all hover:bg-brand-dark hover:shadow-[0_0_20px_rgba(255,87,34,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FiLock size={14} />
                  <span>{isSignUp ? 'Register Account' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign Up / Sign In Links */}
          <div className="text-center mt-5">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-xs text-brand hover:text-brand-light transition-colors font-medium focus:outline-none"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-[11px] text-gray-500 font-mono">
          Strictly for authorized editors &bull; Telangana Today Newsroom
        </div>
      </div>
    </div>
  );
};

export default Login;
