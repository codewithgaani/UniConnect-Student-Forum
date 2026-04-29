import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User as UserIcon, Settings, Folder, Heart, MessageSquare, Send, Bell, Loader2 } from 'lucide-react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [announcement, setAnnouncement] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchPosts();
    fetchAnnouncement();
  }, []);

  const fetchAnnouncement = async () => {
    try {
      const res = await api.get('/admin/announcements/latest');
      setAnnouncement(res.data);
    } catch (err) {
      console.error('Failed to fetch announcement', err);
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/posts');
      setPosts(response.data);
    } catch (err) {
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsPosting(true);
    try {
      await api.post('/posts', { content });
      setContent('');
      setIsFocused(false);
      fetchPosts();
      toast.success('Post published!');
    } catch (err) {
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      const res = await api.post(`/likes/post/${postId}`);
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            is_liked: res.data.liked,
            like_count: res.data.liked ? post.like_count + 1 : post.like_count - 1
          };
        }
        return post;
      }));
    } catch (err) {
      toast.error('Failed to like post');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'popular') {
      const scoreA = a.like_count + a.comment_count;
      const scoreB = b.like_count + b.comment_count;
      if (scoreB !== scoreA) return scoreB - scoreA;
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const navItems = [
    { name: 'Home Feed', path: '/dashboard', icon: Home },
    { name: 'Edit Profile', path: '/profile', icon: UserIcon },
    { name: 'Resources', path: '/resources/manage', icon: Folder },
    ...(user?.role_id === 3 ? [{ name: 'Admin Dashboard', path: '/advanced-dashboard', icon: Settings }] : []),
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans selection:bg-indigo-200">
      {/* Navbar */}
      <nav className="glass-panel sticky top-0 z-50 px-6 py-3 flex justify-between items-center border-b border-slate-200/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-lg leading-none">U</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight hidden sm:block">
            UniConnect
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
             {user.profile_pic_url ? (
               <img src={`http://localhost:5000${user.profile_pic_url}`} alt="Profile" className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100" />
             ) : (
               <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold ring-2 ring-slate-100">
                 {user.username.charAt(0).toUpperCase()}
               </div>
             )}
             <span className="font-medium text-slate-700 hidden sm:block">{user.username}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-1.5 text-sm font-semibold rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto mt-8 px-4 grid grid-cols-1 lg:grid-cols-4 gap-8 pb-12">
        
        {/* Sidebar */}
        <div className="hidden lg:block col-span-1">
          <div className="sticky top-24 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path} className="block">
                  <motion.div 
                    whileHover={{ x: 4, backgroundColor: 'rgba(248, 250, 252, 0.8)' }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive ? 'bg-white shadow-sm border border-slate-200 text-indigo-600' : 'text-slate-600 hover:text-slate-900 border border-transparent'}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {item.name}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Feed */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          
          <AnimatePresence>
            {announcement && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 p-1 rounded-2xl shadow-lg shadow-indigo-500/20"
              >
                <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl">
                  <div className="flex gap-4 items-start">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shrink-0">
                      <Bell className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Official Announcement</h3>
                      <p className="text-slate-700 font-medium leading-relaxed">{announcement.message}</p>
                      <p className="text-xs text-slate-400 mt-2">{new Date(announcement.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Composer */}
          <motion.div 
            className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 ${isFocused ? 'border-indigo-300 shadow-indigo-500/10' : 'border-slate-200'}`}
          >
             <form onSubmit={handleCreatePost} className="p-4 sm:p-5">
               <div className="flex gap-4">
                  {user.profile_pic_url ? (
                    <img src={`http://localhost:5000${user.profile_pic_url}`} alt="Profile" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                 <div className="flex-1">
                   <textarea
                     className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none resize-none pt-2"
                     rows={isFocused || content ? "3" : "1"}
                     placeholder="Share your thoughts, ask a question..."
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     onFocus={() => setIsFocused(true)}
                     onBlur={() => !content && setIsFocused(false)}
                   ></textarea>
                 </div>
               </div>
               
               <AnimatePresence>
                 {(isFocused || content) && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="mt-3 flex justify-between items-center border-t border-slate-100 pt-3"
                   >
                     <span className="text-xs text-slate-400 font-medium">Markdown supported</span>
                     <motion.button 
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       type="submit" 
                       disabled={isPosting || !content.trim()}
                       className="px-5 py-2 btn-primary rounded-full text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                       Post
                     </motion.button>
                   </motion.div>
                 )}
               </AnimatePresence>
             </form>
          </motion.div>

          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-lg text-slate-800">Recent Discussions</h2>
            <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
              <button 
                onClick={() => setSortBy('latest')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${sortBy === 'latest' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Latest
              </button>
              <button 
                onClick={() => setSortBy('popular')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${sortBy === 'popular' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Popular
              </button>
            </div>
          </div>

          {/* Posts List */}
          <div>
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-pulse">
                    <div className="flex gap-4 mb-4">
                      <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                      <div className="flex-1 space-y-3 py-1">
                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/5"></div>
                      </div>
                    </div>
                    <div className="space-y-3 mt-4">
                      <div className="h-4 bg-slate-200 rounded"></div>
                      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedPosts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center p-16 bg-white rounded-2xl border border-slate-200 border-dashed"
              >
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-1">No posts yet</h3>
                <p className="text-slate-500">Be the first to start a discussion!</p>
              </motion.div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {sortedPosts.map((post) => (
                  <motion.div 
                    variants={itemVariants}
                    key={post.id} 
                    className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 premium-shadow group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        {post.profile_pic_url ? (
                          <img src={`http://localhost:5000${post.profile_pic_url}`} alt={post.username} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-slate-50" />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-lg ring-2 ring-slate-50">
                            {post.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            {post.username}
                            {user.id === post.user_id && (
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>
                            )}
                          </h3>
                          <div className="flex items-center text-xs text-slate-500 mt-0.5">
                            {(post.year || post.course) && (
                              <>
                                <span className="font-medium text-slate-600">{[post.year, post.course].filter(Boolean).join(' • ')}</span>
                                <span className="mx-1.5">•</span>
                              </>
                            )}
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed mb-5">{post.content}</p>
                    
                    <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${post.is_liked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'}`}
                      >
                        <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                        {post.like_count || 0}
                      </motion.button>
                      
                      <Link to={`/post/${post.id}`}>
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                          <MessageSquare className="w-5 h-5" />
                          {post.comment_count || 0}
                        </motion.div>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
