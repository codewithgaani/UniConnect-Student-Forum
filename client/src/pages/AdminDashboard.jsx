import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, MessageSquare, Folder, Megaphone, Trash2, ShieldAlert } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ usersCount: 0, postsCount: 0, resourcesCount: 0 });
  const [users, setUsers] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.role_id !== 3) {
      toast.error('Access Denied: Admins Only');
      navigate('/dashboard');
      return;
    }
    fetchAdminData();
  }, [user, navigate]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u.id !== userId));
      setStats(prev => ({ ...prev, usersCount: prev.usersCount - 1 }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcement.trim()) return;
    try {
      await api.post('/admin/announcements', { message: announcement });
      toast.success('Announcement broadcasted successfully');
      setAnnouncement('');
    } catch (err) {
      toast.error('Failed to post announcement');
    }
  };

  if (!user || user.role_id !== 3) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800">
      <nav className="glass-panel sticky top-0 z-10 px-6 py-4 flex justify-between items-center border-b border-slate-200/50">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-indigo-600" />
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
            UniConnect <span className="text-indigo-600">Admin</span>
          </h1>
        </div>
        <Link to="/dashboard">
          <motion.div 
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit Admin
          </motion.div>
        </Link>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 mt-4 space-y-8 pb-12">
        
        {/* Stats Row */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants} className="bg-white rounded-3xl premium-shadow border border-slate-200 p-6 flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Users className="w-32 h-32 text-indigo-600" />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner relative z-10">
              <Users className="w-7 h-7" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Users</p>
              <h2 className="text-3xl font-extrabold text-slate-800">{isLoading ? '-' : stats.usersCount}</h2>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-white rounded-3xl premium-shadow border border-slate-200 p-6 flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <MessageSquare className="w-32 h-32 text-purple-600" />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner relative z-10">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Posts</p>
              <h2 className="text-3xl font-extrabold text-slate-800">{isLoading ? '-' : stats.postsCount}</h2>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-3xl premium-shadow border border-slate-200 p-6 flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Folder className="w-32 h-32 text-pink-600" />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shadow-inner relative z-10">
              <Folder className="w-7 h-7" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Resources</p>
              <h2 className="text-3xl font-extrabold text-slate-800">{isLoading ? '-' : stats.resourcesCount}</h2>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Post Announcement */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1 rounded-3xl premium-shadow">
              <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-[22px] h-full">
                <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-indigo-500" />
                  Broadcast
                </h3>
                <form onSubmit={handlePostAnnouncement}>
                  <textarea
                    className="w-full glass-input rounded-2xl p-4 resize-none mb-4 text-slate-800"
                    rows="5"
                    placeholder="Type an important announcement for all users. This will appear at the top of their feed..."
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    required
                  ></textarea>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="w-full py-3.5 btn-primary font-bold shadow-lg"
                  >
                    Broadcast Message
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* User Management */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl premium-shadow border border-slate-200 overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" />
                  User Management
                </h3>
              </div>
              
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4 font-bold">User</th>
                      <th className="px-6 py-4 font-bold">Role</th>
                      <th className="px-6 py-4 font-bold">Details</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      <tr>
                        <td colSpan="4" className="p-12 text-center text-slate-400">Loading directory...</td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-12 text-center text-slate-400">No users found.</td>
                      </tr>
                    ) : (
                      users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {u.username} 
                            {u.id === user.id && <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md uppercase tracking-widest">You</span>}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${u.role === 'admin' ? 'bg-rose-100 text-rose-700' : u.role === 'faculty' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                            {[u.course, u.year].filter(Boolean).join(' • ') || '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {u.id !== user.id && (
                              <button 
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-slate-400 hover:text-rose-600 bg-transparent hover:bg-rose-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete user"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>

      </main>
    </div>
  );
}
