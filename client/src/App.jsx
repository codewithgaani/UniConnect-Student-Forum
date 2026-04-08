import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Placeholders from './pages/Placeholders';
import Profile from './pages/Profile';
import Resources from './pages/Resources';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/resources/manage" element={<PrivateRoute><Resources /></PrivateRoute>} />
          <Route path="/advanced-dashboard" element={<PrivateRoute><Placeholders title="Advanced Dashboard" /></PrivateRoute>} />
          <Route path="/post/:id" element={<PrivateRoute><Placeholders title="Specific Post View" /></PrivateRoute>} />
          
          {/* Default route */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
