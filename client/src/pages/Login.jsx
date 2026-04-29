import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { LogIn, Loader2 } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data.user, response.data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center relative p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-0"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full glass-panel rounded-2xl p-8 z-10 border border-white/20"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-indigo-500/30"
          >
            <LogIn className="text-white w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">UniConnect</h1>
          <p className="text-slate-500 font-medium">Welcome back, please sign in.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl glass-input text-slate-800 placeholder-slate-400"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl glass-input text-slate-800 placeholder-slate-400"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 btn-primary flex justify-center items-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-700 hover:underline transition-all">
            Create one here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
