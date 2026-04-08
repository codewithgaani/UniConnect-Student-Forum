import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  
  // Upload State
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await api.get('/resources');
      setResources(response.data);
    } catch (err) {
      console.error('Failed to fetch resources', err);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        setFile(null);
        e.target.value = '';
      } else {
        setFile(selected);
        setError('');
        if (!title) setTitle(selected.name.split('.')[0]); // Default title to filename
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', title);

    try {
      await api.post('/resources', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      setSuccess('File uploaded successfully!');
      setFile(null);
      setTitle('');
      // reset file input
      document.getElementById('file-upload').value = '';
      fetchResources();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload resource');
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setSuccess('');
        setUploadProgress(0);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
          UniConnect
        </h1>
        <div className="flex gap-4 items-center">
           <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
            &larr; Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 mt-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Upload Form Section */}
        <div className="col-span-1 border-r border-slate-200 pr-8">
           <h2 className="text-xl font-bold text-slate-800 mb-6">Upload Resource</h2>
           
           {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
           {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">{success}</div>}

           <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resource Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midterm Study Guide"
                  className="w-full border-slate-300 rounded-lg p-2 border focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload File (PDF/DOC/IMG)</label>
                <input 
                  id="file-upload"
                  type="file" 
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-200 rounded-lg p-2 bg-white"
                  required
                />
              </div>

              {isUploading && (
                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2 overflow-hidden">
                  <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading || !file}
                className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 disabled:opacity-50 mt-4"
              >
                {isUploading ? `Uploading ${uploadProgress}%` : 'Upload Resource'}
              </button>
           </form>
           
           <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
             <p className="text-xs text-amber-800 font-medium">Note: Only share educational resources. Maximum file size is 10MB.</p>
           </div>
        </div>

        {/* Resource Feed */}
        <div className="col-span-1 md:col-span-2">
           <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
              Shared Documents Library
           </h2>
           
           <div className="grid grid-cols-1 gap-4">
              {resources.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-slate-500">No resources available. Upload the first one!</p>
                </div>
              ) : (
                resources.map(resource => (
                  <div key={resource.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:border-indigo-300 transition-colors group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        {resource.file_name?.split('.').pop().toUpperCase() || 'FILE'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{resource.title}</h3>
                        <p className="text-xs text-slate-500 mb-1">Uploaded by <span className="font-medium text-slate-700">{resource.username}</span> on {new Date(resource.created_at).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-400 capitalize">{resource.file_name}</p>
                      </div>
                    </div>
                    
                    <a 
                      href={`http://localhost:5000${resource.file_path}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                      download
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download
                    </a>
                  </div>
                ))
              )}
           </div>
        </div>

      </main>
    </div>
  );
}
