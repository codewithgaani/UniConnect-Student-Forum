import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, FileText, Download, Trash2, Library, FileIcon, ShieldAlert } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Upload State
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Notes');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Filter State
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/resources');
      setResources(response.data);
    } catch (err) {
      toast.error('Failed to fetch resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        setFile(null);
        e.target.value = '';
      } else {
        setFile(selected);
        if (!title) setTitle(selected.name.split('.')[0]); 
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', title);
    formData.append('category', category);

    try {
      await api.post('/resources', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      toast.success('Resource shared successfully!');
      setFile(null);
      setTitle('');
      setCategory('Notes');
      document.getElementById('file-upload').value = '';
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload resource');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Delete this resource permanently?')) return;
    try {
      await api.delete(`/resources/${resourceId}`);
      toast.success('Resource deleted');
      setResources(resources.filter(r => r.id !== resourceId));
    } catch (err) {
      toast.error('Failed to delete resource');
    }
  };

  const filteredResources = filterCategory === 'All' 
    ? resources 
    : resources.filter(r => r.category === filterCategory);

  const categories = ['Notes', 'Exams', 'Assignments', 'General'];

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

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 mt-4 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        
        {/* Upload Form Section */}
        <div className="col-span-1 lg:pr-4">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 sticky top-24"
           >
             <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
               <Upload className="w-5 h-5 text-indigo-500" />
               Share Resource
             </h2>

             <form onSubmit={handleUpload} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Midterm Study Guide"
                    className="w-full glass-input rounded-xl p-3 text-slate-800 placeholder-slate-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full glass-input rounded-xl p-3 text-slate-800"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">File</label>
                  <div className="relative group">
                    <input 
                      id="file-upload"
                      type="file" 
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      required
                    />
                    <div className="w-full border-2 border-dashed border-slate-300 rounded-xl p-4 text-center group-hover:border-indigo-400 group-hover:bg-indigo-50/50 transition-colors">
                      <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:text-indigo-500" />
                      <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">
                        {file ? file.name : 'Click or drag file to upload'}
                      </span>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isUploading && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                        <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <p className="text-xs text-center mt-1 font-medium text-slate-500">{uploadProgress}% uploaded</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isUploading || !file}
                  className="w-full py-3 btn-primary mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? <><Loader2 className="w-4 h-4 animate-spin"/> Uploading...</> : 'Publish Resource'}
                </motion.button>
             </form>
             
             <div className="mt-8 p-4 bg-amber-50/80 border border-amber-200/60 rounded-2xl flex items-start gap-3">
               <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
               <p className="text-xs text-amber-800 font-medium leading-relaxed">Ensure materials follow university guidelines. Maximum file size is 10MB.</p>
             </div>
           </motion.div>
        </div>

        {/* Resource Feed */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Library className="w-6 h-6 text-indigo-500" />
                Resource Library
             </h2>
             
             <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm overflow-x-auto w-full sm:w-auto">
                <button 
                  onClick={() => setFilterCategory('All')}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${filterCategory === 'All' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${filterCategory === cat ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
           </div>
           
           <div>
              {isLoading ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 animate-pulse flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-200"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredResources.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center p-16 bg-white rounded-3xl border border-slate-200 border-dashed"
                >
                  <FileIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-1">No resources found</h3>
                  <p className="text-slate-500">Upload the first document for this category!</p>
                </motion.div>
              ) : (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 gap-4"
                >
                  {filteredResources.map(resource => (
                    <motion.div 
                      variants={itemVariants}
                      key={resource.id} 
                      className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-indigo-300 premium-shadow group transition-all"
                    >
                      <div className="flex items-start gap-4 mb-4 sm:mb-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100 shrink-0">
                          {resource.file_name?.split('.').pop().toUpperCase() || 'FILE'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-800 line-clamp-1">{resource.title}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 uppercase tracking-wider shrink-0">{resource.category || 'General'}</span>
                          </div>
                          <p className="text-xs text-slate-500 mb-0.5">Shared by <span className="font-medium text-slate-700">{resource.username}</span></p>
                          <p className="text-[11px] text-slate-400 capitalize">{new Date(resource.created_at).toLocaleDateString()} • {resource.file_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {(user.id === resource.uploaded_by || user.role_id === 3) && (
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(resource.id)}
                            className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Delete resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        )}
                        <a 
                          href={`http://localhost:5000${resource.file_path}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          download
                        >
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-slate-100 hover:bg-indigo-50 text-indigo-600 text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </motion.div>
                        </a>
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
