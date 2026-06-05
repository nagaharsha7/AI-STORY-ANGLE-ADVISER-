import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Protected Route Wrapper Component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-darkbg-deep">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Main Layout for authenticated pages
const AppLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-darkbg-deep overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* Top Navbar */}
        <Navbar />
        
        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Main Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          } />
          
          <Route path="/history" element={
            <PrivateRoute>
              <AppLayout>
                <History />
              </AppLayout>
            </PrivateRoute>
          } />
          
          <Route path="/analytics" element={
            <PrivateRoute>
              <AppLayout>
                <Analytics />
              </AppLayout>
            </PrivateRoute>
          } />
          
          {/* Fallback Redirection */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
