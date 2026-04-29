import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, User as UserIcon, Camera, Loader2, Save } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    year: user?.year || '',
    section: user?.section || '',
    course: user?.course || ''
  });
  
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    user?.profile_pic_url ? `http://localhost:5000${user.profile_pic_url}` : null
  );
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('year', formData.year);
      data.append('section', formData.section);
      data.append('course', formData.course);
      
      if (profilePic) {
        data.append('profilePic', profilePic);
      }

      const response = await api.put('/users/profile', data);

      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800">
      <nav className="glass-panel sticky top-0 z-10 px-6 py-4 flex justify-between items-center border-b border-slate-200/50">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
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

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 mt-4 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl premium-shadow border border-slate-200 overflow-hidden"
        >
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 w-full relative"></div>
          
          <div className="px-6 sm:px-10 pb-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Profile Picture & Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-8 border-b border-slate-100">
                {/* Avatar (Overlaps Banner) */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-32 h-32 rounded-full bg-white p-1.5 shadow-xl relative group cursor-pointer z-10 shrink-0 -mt-20 sm:-mt-24"
                  onClick={() => fileInputRef.current.click()}
                >
                  <div className="w-full h-full rounded-full bg-slate-100 overflow-hidden flex items-center justify-center relative">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl text-slate-400 font-bold">{user?.username?.charAt(0).toUpperCase()}</span>
                    )}
                    
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>
                
                {/* Header Text & Button */}
                <div className="flex-1 mt-2 sm:mt-0">
                  <h2 className="text-2xl font-bold text-slate-800">Profile Settings</h2>
                  <p className="text-sm text-slate-500 mt-1">Upload a professional looking photo of yourself. JPG or PNG, max 10MB.</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                  >
                    Select New Photo
                  </button>
                </div>
              </div>

              {/* User Meta Data Section */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-slate-400" /> Username
                  </label>
                  <input type="text" disabled value={user?.username || ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-500 cursor-not-allowed font-medium" />
                  <p className="text-xs text-slate-400 mt-1.5">Your username is immutable and cannot be changed.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Course / Major</label>
                  <input 
                    type="text" 
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="e.g. Computer Science"
                    className="w-full glass-input rounded-xl p-3.5 text-slate-800 placeholder-slate-400" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year</label>
                  <select 
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full glass-input rounded-xl p-3.5 text-slate-800"
                  >
                    <option value="">Select Year</option>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Section / Group</label>
                  <input 
                    type="text" 
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    placeholder="e.g. Section A"
                    className="w-full glass-input rounded-xl p-3.5 text-slate-800 placeholder-slate-400" 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-100">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3.5 btn-primary flex items-center justify-center gap-2 min-w-[200px]"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-5 h-5" /> Save Changes</>
                  )}
                </motion.button>
              </div>

            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
