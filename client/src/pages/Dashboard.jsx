import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      setPosts(response.data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await api.post('/posts', { content });
      setContent('');
      fetchPosts();
    } catch (err) {
      console.error('Failed to create post', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
          UniConnect
        </h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             {user.profile_pic_url ? (
               <img src={`http://localhost:5000${user.profile_pic_url}`} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
             ) : (
               <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                 {user.username.charAt(0).toUpperCase()}
               </div>
             )}
             <span className="font-medium text-slate-600">Hello, {user.username}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-semibold rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto mt-8 px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="col-span-1 space-y-2">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Menu</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="block px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
                  Home Feed
                </Link>
              </li>
              <li>
                <Link to="/profile" className="block px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  Edit Profile
                </Link>
              </li>
              <li>
                <Link to="/advanced-dashboard" className="block px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  Advanced Dashboard
                </Link>
              </li>
              <li>
                <Link to="/resources/manage" className="block px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Feed Content */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          
          {/* Create Post Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <form onSubmit={handleCreatePost}>
               <textarea
                 className="w-full border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                 rows="3"
                 placeholder={`What's on your mind, ${user.username}?`}
                 value={content}
                 onChange={(e) => setContent(e.target.value)}
               ></textarea>
               <div className="mt-3 flex justify-end">
                 <button 
                   type="submit" 
                   className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md transition-all transform hover:-translate-y-0.5"
                 >
                   Post
                 </button>
               </div>
             </form>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-xl border border-slate-100 shadow-sm">
                <p className="text-slate-500">No posts yet. Be the first to start a discussion!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {post.profile_pic_url ? (
                        <img src={`http://localhost:5000${post.profile_pic_url}`} alt={post.username} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {post.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          {post.username}
                          {(post.year || post.course) && (
                            <span className="text-xs font-normal text-gray-500">
                              ({[post.year, post.course].filter(Boolean).join(', ')})
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                    <Link to={`/post/${post.id}`} className="text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:underline">
                      View details &rarr;
                    </Link>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                </div>
              ))
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
