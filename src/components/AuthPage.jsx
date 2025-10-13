import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Loader, Eye, EyeOff, ArrowRight } from 'lucide-react';

function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState('signin'); // signin, signup, reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, username);
    
    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your email for the confirmation link!');
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await resetPassword(email);
    
    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset email sent! Check your inbox.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black flex items-center justify-center p-4">
      
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-bounce-subtle">♠</div>
        <div className="absolute top-40 right-20 text-6xl opacity-10 text-red-500 animate-bounce-subtle" style={{ animationDelay: '0.5s' }}>♥</div>
        <div className="absolute bottom-40 left-20 text-6xl opacity-10 text-red-500 animate-bounce-subtle" style={{ animationDelay: '1s' }}>♦</div>
        <div className="absolute bottom-20 right-10 text-6xl opacity-10 animate-bounce-subtle" style={{ animationDelay: '1.5s' }}>♣</div>
      </div>

      <div className="max-w-md w-full relative z-10">
        
       {/* Logo/Title */}
<div className="text-center mb-2 fade-in-up">
  <div className="flex items-center justify-center gap-4 mb-2">
    <img 
      src="/images/ace-edge-logo.png" 
      alt="Ace Edge Logo" 
      className="h-96 w-auto mx-auto -mt-16"
    />
  </div>
  <p className="text-gray-400 text-lg">Master the art of casino strategy</p>
</div>

        {/* Auth Card */}
        <div className="glass-strong rounded-2xl p-8 shadow-2xl fade-in-up" style={{ animationDelay: '0.2s' }}>
          
          {/* Mode Tabs */}
          {mode !== 'reset' && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setMode('signin')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  mode === 'signin'
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-300 text-sm fade-in-up">
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-500 rounded-lg text-green-300 text-sm fade-in-up">
              {message}
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMode('reset')}
                className="text-sm text-yellow-400 hover:text-yellow-300 transition"
              >
                Forgot password?
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-3 rounded-xl font-bold text-lg hover:from-yellow-700 hover:to-yellow-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <Loader size={20} className="animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Username</label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-3 rounded-xl font-bold text-lg hover:from-yellow-700 hover:to-yellow-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <Loader size={20} className="animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Reset Password Form */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
                <p className="text-sm text-gray-400">Enter your email to receive a reset link</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-3 rounded-xl font-bold text-lg hover:from-yellow-700 hover:to-yellow-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <Loader size={20} className="animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <button
                type="button"
                onClick={() => setMode('signin')}
                className="w-full text-sm text-yellow-400 hover:text-yellow-300 transition"
              >
                ← Back to Sign In
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>🎰 Professional Casino Training Platform</p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
