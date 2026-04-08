import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      data.append('year', formData.year);
      data.append('section', formData.section);
      data.append('course', formData.course);
      
      if (profilePic) {
        data.append('profilePic', profilePic);
      }

      const response = await api.put('/users/profile', data);

      // Update global context
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
          UniConnect
        </h1>
        <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
          &larr; Back to Dashboard
        </Link>
      </nav>

      <main className="flex-1 max-w-2xl w-full mx-auto p-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Edit Profile</h2>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-6">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-6 border-b border-slate-100">
              <div 
                className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center cursor-pointer group relative"
                onClick={() => fileInputRef.current.click()}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-slate-300 font-bold">{user?.username?.charAt(0).toUpperCase()}</span>
                )}
                
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-medium text-sm">Change</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <h3 className="font-semibold text-slate-800">Profile Photo</h3>
                <p className="text-sm text-slate-500">Upload a professional looking photo of yourself. JPG or PNG, max 10MB.</p>
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
                  className="mt-2 inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none"
                >
                  Select New Image
                </button>
              </div>
            </div>

            {/* User Meta Data Section */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Username (Immutable)</label>
                <input type="text" disabled value={user?.username || ''} className="w-full bg-slate-50 border-slate-200 rounded-lg p-3 text-slate-500 cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course / Major</label>
                <input 
                  type="text" 
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  className="w-full border-slate-300 rounded-lg p-3 border focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                <select 
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full border-slate-300 rounded-lg p-3 border focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Section / Group</label>
                <input 
                  type="text" 
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  placeholder="e.g. Section A"
                  className="w-full border-slate-300 rounded-lg p-3 border focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
