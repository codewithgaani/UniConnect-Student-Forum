import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { username, password, role });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-400 via-emerald-500 to-green-600 p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Join UniConnect</h1>
          <p className="text-white/80">Create your account to get started</p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-white rounded-lg p-3 mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-white/90 mb-1" htmlFor="role">
              I am a...
            </label>
            <select
              id="role"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-slate-800 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-white text-emerald-600 font-bold rounded-lg shadow-lg hover:bg-emerald-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 mt-4"
          >
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-white/80">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-white hover:underline transition-all">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
