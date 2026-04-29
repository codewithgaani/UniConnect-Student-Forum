import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { UserPlus, Loader2 } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role_id: 1, // Default to Student
    year: '',
    course: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', formData);
      login(response.data.user, response.data.token);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
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
        className="max-w-md w-full glass-panel rounded-2xl p-8 z-10 border border-white/20 my-8"
      >
        <div className="text-center mb-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-indigo-500/30"
          >
            <UserPlus className="text-white w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Join UniConnect</h1>
          <p className="text-slate-500 font-medium">Create your account to get started.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl glass-input text-slate-800 placeholder-slate-400"
              placeholder="Choose a username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
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
              placeholder="Choose a strong password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="role">
              I am a...
            </label>
            <select
              id="role"
              className="w-full px-4 py-3 rounded-xl glass-input text-slate-800"
              value={formData.role_id}
              onChange={(e) => setFormData({...formData, role_id: Number(e.target.value)})}
              disabled={isLoading}
            >
              <option value={1}>Student</option>
              <option value={2}>Faculty</option>
            </select>
          </div>

          {/* Conditional fields based on Role */}
          {formData.role_id === 1 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="year">
                  Year
                </label>
                <input
                  id="year"
                  type="text"
                  className="w-full px-4 py-3 rounded-xl glass-input text-slate-800 placeholder-slate-400"
                  placeholder="e.g. Freshman"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="course">
                  Course
                </label>
                <input
                  id="course"
                  type="text"
                  className="w-full px-4 py-3 rounded-xl glass-input text-slate-800 placeholder-slate-400"
                  placeholder="e.g. Computer Science"
                  value={formData.course}
                  onChange={(e) => setFormData({...formData, course: e.target.value})}
                  disabled={isLoading}
                />
              </div>
            </motion.div>
          )}

          {formData.role_id === 2 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="department">
                Department
              </label>
              <input
                id="department"
                type="text"
                className="w-full px-4 py-3 rounded-xl glass-input text-slate-800 placeholder-slate-400"
                placeholder="e.g. Computer Science"
                value={formData.course} // Reusing course field for department for simplicity
                onChange={(e) => setFormData({...formData, course: e.target.value})}
                disabled={isLoading}
              />
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 btn-primary flex justify-center items-center gap-2 mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 hover:underline transition-all">
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
