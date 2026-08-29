import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import NotFound from './pages/public/NotFound';
import Unauthorized from './pages/public/Unauthorized';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentComplaintsList from './pages/student/ComplaintsList';
import StudentNewComplaint from './pages/student/NewComplaint';
import StudentComplaintDetails from './pages/student/ComplaintDetails';
import StudentProfile from './pages/student/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminComplaintsList from './pages/admin/ComplaintsList';
import AdminComplaintDetails from './pages/admin/ComplaintDetails';
import AdminDepartments from './pages/admin/Departments';
import AdminStaff from './pages/admin/Staff';

import LoadingSpinner from './components/common/LoadingSpinner';


// Protected Route Guard
const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner minHeight="100vh" message="Verifying authentication session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Public Only Route Guard (e.g. login/register pages)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner minHeight="100vh" message="Loading..." />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  return children;
};

// Root index redirector
const RootRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner minHeight="100vh" message="Loading CampusResolve..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
};

function App() {

  return (
    <NotificationProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            {/* Root Landing Redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/404" element={<NotFound />} />
            </Route>

            {/* Student Protected Portal */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRole="student">
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="complaints" element={<StudentComplaintsList />} />
              <Route path="complaints/new" element={<StudentNewComplaint />} />
              <Route path="complaints/:id" element={<StudentComplaintDetails />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>

            {/* Admin Protected Portal */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="complaints" element={<AdminComplaintsList />} />
              <Route path="complaints/:id" element={<AdminComplaintDetails />} />
              <Route path="departments" element={<AdminDepartments />} />
              <Route path="staff" element={<AdminStaff />} />
            </Route>

            {/* 404 Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
      </HashRouter>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
