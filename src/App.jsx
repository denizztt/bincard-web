import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/EnhancedAuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/common-components.css';
import Login from './pages/Login';
import Register from './pages/Register';
import SMSVerification from './pages/SMSVerification';
import Dashboard from './pages/Dashboard';
import NewsManagement from './pages/NewsList';
import NewsAdd from './pages/NewsAdd';
import NewsEdit from './pages/NewsEdit';
import FeedbackList from './pages/FeedbackList';
import FeedbackDetail from './pages/FeedbackDetail';
import PaymentPointList from './pages/PaymentPointList';
import PaymentPointAdd from './pages/PaymentPointAdd';
import PaymentPointEdit from './pages/PaymentPointEdit';
import PaymentPointDetail from './pages/PaymentPointDetail';
import StationList from './pages/StationList';
import StationAdd from './pages/StationAdd';
import StationEdit from './pages/StationEdit';
import StationDetail from './pages/StationDetail';
import StationMap from './pages/StationMap';
import Analytics from './pages/Analytics';
import AdminApprovals from './pages/AdminApprovals';
import IdentityRequests from './pages/IdentityRequests';
import AuditLogs from './pages/AuditLogs';
import Statistics from './pages/Statistics';
import WalletStatusUpdate from './pages/WalletStatusUpdate';
import AllWallets from './pages/AllWallets';
import WalletTransfers from './pages/WalletTransfers';
import BusList from './pages/BusList';
import BusMap from './pages/BusMap';
import DriverList from './pages/DriverList';
import RouteList from './pages/RouteList';
import RouteAdd from './pages/RouteAdd';
import DriverAdd from './pages/DriverAdd';
import DriverEdit from './pages/DriverEdit';
import ContractManagement from './pages/ContractManagement';
import UserContractTracking from './pages/UserContractTracking';
import ComplianceCheck from './pages/ComplianceCheck';
import SystemHealth from './pages/SystemHealth';
import './App.css';

function App() {
  console.log('App component rendered');
  return (
    <ThemeProvider>
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
                  <NewsManagement />
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

            {/* Feedback Routes */}
            <Route
              path="/feedback"
              element={
                <ProtectedRoute>
                  <FeedbackList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback/:id"
              element={
                <ProtectedRoute>
                  <FeedbackDetail />
                </ProtectedRoute>
              }
            />

            {/* Payment Point Routes */}
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
            <Route
              path="/payment-point/:id"
              element={
                <ProtectedRoute>
                  <PaymentPointDetail />
                </ProtectedRoute>
              }
            />

            {/* Station Routes */}
            <Route
              path="/station"
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
              path="/station/edit/:id"
              element={
                <ProtectedRoute>
                  <StationEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/station/:id"
              element={
                <ProtectedRoute>
                  <StationDetail />
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

            {/* Bus Routes */}
            <Route
              path="/bus"
              element={
                <ProtectedRoute>
                  <BusList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bus/create"
              element={
                <ProtectedRoute>
                  <BusList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bus/:id"
              element={
                <ProtectedRoute>
                  <BusList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bus/:id/edit"
              element={
                <ProtectedRoute>
                  <BusList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bus/map"
              element={
                <ProtectedRoute>
                  <BusMap />
                </ProtectedRoute>
              }
            />

            {/* Driver Routes */}
            <Route
              path="/driver"
              element={
                <ProtectedRoute>
                  <DriverList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/create"
              element={
                <ProtectedRoute>
                  <DriverList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/:id"
              element={
                <ProtectedRoute>
                  <DriverList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/:id/edit"
              element={
                <ProtectedRoute>
                  <DriverList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/:id/documents"
              element={
                <ProtectedRoute>
                  <DriverList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/:id/penalties"
              element={
                <ProtectedRoute>
                  <DriverList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/statistics"
              element={
                <ProtectedRoute>
                  <DriverList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/reports"
              element={
                <ProtectedRoute>
                  <DriverList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/add"
              element={
                <ProtectedRoute>
                  <DriverAdd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/edit/:id"
              element={
                <ProtectedRoute>
                  <DriverEdit />
                </ProtectedRoute>
              }
            />

            {/* Route Management Routes */}
            <Route
              path="/route"
              element={
                <ProtectedRoute>
                  <RouteList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/route/add"
              element={
                <ProtectedRoute>
                  <RouteAdd />
                </ProtectedRoute>
              }
            />

            {/* Wallet Routes */}
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
            <Route
              path="/wallet-status-update"
              element={
                <ProtectedRoute>
                  <WalletStatusUpdate />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
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
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />

            {/* Contract Routes */}
            <Route
              path="/contract-management"
              element={
                <ProtectedRoute>
                  <ContractManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-contract-tracking"
              element={
                <ProtectedRoute>
                  <UserContractTracking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compliance-check"
              element={
                <ProtectedRoute>
                  <ComplianceCheck />
                </ProtectedRoute>
              }
            />

            {/* System Health Route */}
            <Route
              path="/system-health"
              element={
                <ProtectedRoute>
                  <SystemHealth />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;