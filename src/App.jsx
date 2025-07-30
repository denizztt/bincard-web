import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/common-components.css';
import Login from './pages/Login';
import Register from './pages/Register';
import SMSVerification from './pages/SMSVerification';
import Dashboard from './pages/Dashboard';
import NewsList from './pages/NewsList';
import NewsAdd from './pages/NewsAdd';
import NewsEdit from './pages/NewsEdit';
import FeedbackList from './pages/FeedbackList';
import FeedbackDetail from './pages/FeedbackDetail';
import PaymentPointList from './pages/PaymentPointList';
import PaymentPointAdd from './pages/PaymentPointAdd';
import PaymentPointEdit from './pages/PaymentPointEdit';
import StationList from './pages/StationList';
import StationAdd from './pages/StationAdd';
import StationMap from './pages/StationMap';
import Analytics from './pages/Analytics';
import AdminApprovals from './pages/AdminApprovals';
import IdentityRequests from './pages/IdentityRequests';
import AuditLogs from './pages/AuditLogs';
import Statistics from './pages/Statistics';
import WalletStatusUpdate from './pages/WalletStatusUpdate';
import AllWallets from './pages/AllWallets';
import WalletTransfers from './pages/WalletTransfers';
import './App.css';

function App() {
  console.log('App component rendered');
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-sms" element={<SMSVerification />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* News Management Routes */}
            <Route
              path="/news"
              element={
                <ProtectedRoute>
                  <NewsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/news/add"
              element={
                <ProtectedRoute>
                  <NewsAdd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/news/edit/:id"
              element={
                <ProtectedRoute>
                  <NewsEdit />
                </ProtectedRoute>
              }
            />
            
            {/* Feedback Management Routes */}
            <Route
              path="/feedback"
              element={
                <ProtectedRoute>
                  <FeedbackList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback/detail/:id"
              element={
                <ProtectedRoute>
                  <FeedbackDetail />
                </ProtectedRoute>
              }
            />
            
            {/* Payment Point Management Routes */}
            <Route
              path="/payment-point"
              element={
                <ProtectedRoute>
                  <PaymentPointList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-point/add"
              element={
                <ProtectedRoute>
                  <PaymentPointAdd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-point/edit/:id"
              element={
                <ProtectedRoute>
                  <PaymentPointEdit />
                </ProtectedRoute>
              }
            />
            
            {/* Station Management Routes */}
            <Route
              path="/station"
              element={
                <ProtectedRoute>
                  <StationList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/station/search"
              element={
                <ProtectedRoute>
                  <StationList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/station/add"
              element={
                <ProtectedRoute>
                  <StationAdd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/station/map"
              element={
                <ProtectedRoute>
                  <StationMap />
                </ProtectedRoute>
              }
            />
            
            {/* Analytics & Reports Routes */}
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/statistics"
              element={
                <ProtectedRoute>
                  <Statistics />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Management Routes */}
            <Route
              path="/admin-approvals"
              element={
                <ProtectedRoute>
                  <AdminApprovals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/identity-requests"
              element={
                <ProtectedRoute>
                  <IdentityRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            
            {/* Wallet Management Routes */}
            <Route
              path="/wallet-status-update"
              element={
                <ProtectedRoute>
                  <WalletStatusUpdate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/all-wallets"
              element={
                <ProtectedRoute>
                  <AllWallets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet-transfers"
              element={
                <ProtectedRoute>
                  <WalletTransfers />
                </ProtectedRoute>
              }
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
