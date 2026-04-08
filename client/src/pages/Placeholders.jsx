import { Link } from 'react-router-dom';

export default function Placeholders({ title }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
          UniConnect
        </h1>
        <Link 
          to="/dashboard"
          className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          &larr; Back to Dashboard
        </Link>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl max-w-lg p-10 shadow-lg">
          <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-amber-800 mb-2">Under Construction</h2>
          <h3 className="text-xl font-medium text-amber-700 mb-6">{title}</h3>
          
          <p className="text-amber-900/80 leading-relaxed mb-8">
            This module is part of the advanced functional requirements. 
            <strong> Status: Pending.</strong><br/>
            Assigned for <em>Krishna Bhatt</em> to complete in future sprints.
          </p>

          <Link 
            to="/dashboard"
            className="inline-block px-8 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 shadow-md transition-all"
          >
            Return to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
