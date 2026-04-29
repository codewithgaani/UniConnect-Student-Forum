import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Heart, MessageSquare, Send, Loader2 } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function PostView() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchPostAndComments();
  }, [id]);

  const fetchPostAndComments = async () => {
    setIsLoading(true);
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.get(`/posts/${id}`),
        api.get(`/comments/post/${id}`)
      ]);
      setPost(postRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      toast.error('Failed to load post details');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLike = async () => {
    try {
      const res = await api.post(`/likes/post/${id}`);
      setPost({
        ...post,
        is_liked: res.data.liked,
        like_count: res.data.liked ? post.like_count + 1 : post.like_count - 1
      });
    } catch (err) {
      toast.error('Failed to like post');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      toast.success('Post deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsPosting(true);
    try {
      const res = await api.post(`/comments/post/${id}`, { content: newComment });
      setComments([...comments, res.data]);
      setPost({ ...post, comment_count: post.comment_count + 1 });
      setNewComment('');
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
      setPost({ ...post, comment_count: post.comment_count - 1 });
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex justify-center pt-24">
        <div className="animate-pulse w-full max-w-3xl px-4 space-y-6">
          <div className="h-48 bg-white rounded-2xl shadow-sm border border-slate-100"></div>
          <div className="h-32 bg-white rounded-2xl shadow-sm border border-slate-100"></div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans">
      <nav className="glass-panel sticky top-0 z-10 px-6 py-4 flex justify-between items-center border-b border-slate-200/50">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
          UniConnect
        </h1>
        <Link to="/dashboard">
          <motion.div 
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </motion.div>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto mt-8 px-4 space-y-8 pb-12">
        {/* Post Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 premium-shadow"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              {post.profile_pic_url ? (
                <img src={`http://localhost:5000${post.profile_pic_url}`} alt={post.username} className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100 shadow-sm" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {post.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  {post.username}
                  {user.id === post.user_id && (
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>
                  )}
                </h3>
                <p className="text-sm text-slate-500">
                  {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
            
            {(user.id === post.user_id || user.role_id === 3) && (
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDeletePost} 
                className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
            )}
          </div>
          
          <p className="text-slate-800 text-[1.1rem] whitespace-pre-wrap leading-relaxed mb-8">{post.content}</p>
          
          <div className="flex items-center gap-6 border-t border-slate-100 pt-5">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleLike}
              className={`flex items-center gap-2 text-sm font-semibold transition-colors ${post.is_liked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'}`}
            >
              <Heart className={`w-6 h-6 ${post.is_liked ? 'fill-current' : ''}`} />
              <span className="text-base">{post.like_count || 0}</span>
            </motion.button>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <MessageSquare className="w-6 h-6" />
              <span className="text-base">{post.comment_count || 0}</span>
            </div>
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200"
        >
          <h3 className="font-bold text-xl mb-6 text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            Discussion
          </h3>
          
          <form onSubmit={handleAddComment} className="mb-8 flex gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add to the discussion..."
              className="flex-1 rounded-2xl glass-input px-5 py-3 text-slate-800 placeholder-slate-400"
            />
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              disabled={isPosting || !newComment.trim()}
              type="submit" 
              className="btn-primary px-6 rounded-2xl flex items-center gap-2 disabled:opacity-50"
            >
              {isPosting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              <span className="hidden sm:inline">Reply</span>
            </motion.button>
          </form>

          <AnimatePresence>
            {comments.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center p-8 border border-dashed border-slate-200 rounded-2xl"
              >
                <p className="text-slate-500">No comments yet. Be the first to share your thoughts!</p>
              </motion.div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-5"
              >
                {comments.map(comment => (
                  <motion.div variants={itemVariants} key={comment.id} className="flex gap-4 group">
                    {comment.profile_pic_url ? (
                      <img src={`http://localhost:5000${comment.profile_pic_url}`} alt={comment.username} className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0 ring-1 ring-slate-100">
                        {comment.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 bg-slate-50 rounded-2xl rounded-tl-sm p-4 border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-slate-800">{comment.username}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{new Date(comment.created_at).toLocaleDateString()}</span>
                          {(user.id === comment.user_id || user.id === post.user_id || user.role_id === 3) && (
                            <button 
                              onClick={() => handleDeleteComment(comment.id)} 
                              className="text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-slate-700 mt-1.5 leading-relaxed">{comment.content}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
