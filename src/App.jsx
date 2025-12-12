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
import AdminApprovals from './pages/AdminApprovals';
import IdentityRequests from './pages/IdentityRequests';
import AuditLogs from './pages/AuditLogs';
import BusIncomeReports from './pages/BusIncomeReports';
import AdminList from './pages/AdminList';
import AdminAdd from './pages/AdminAdd';
import AdminEdit from './pages/AdminEdit';
import AdminProfile from './pages/AdminProfile';
import AdminSettings from './pages/AdminSettings';
import AdminActivity from './pages/AdminActivity';
import RoleManagement from './pages/RoleManagement';
import Statistics from './pages/Statistics';
import WalletStatusUpdate from './pages/WalletStatusUpdate';
import AllWallets from './pages/AllWallets';
import WalletTransfers from './pages/WalletTransfers';
import BusList from './pages/BusList';
import BusAdd from './pages/BusAdd';
<<<<<<< HEAD
import BusDetail from './pages/BusDetail';
import BusEdit from './pages/BusEdit';
=======
>>>>>>> 9d37eb05744291455eca991958fcde8a077f8437
import BusMap from './pages/BusMap';
import DriverList from './pages/DriverList';
import RouteList from './pages/RouteList';
import RouteAdd from './pages/RouteAdd';
import RouteDetail from './pages/RouteDetail';
import RouteStations from './pages/RouteStations';
import DriverAdd from './pages/DriverAdd';
import DriverEdit from './pages/DriverEdit';
import ContractManagement from './pages/ContractManagement';
import UserContractTracking from './pages/UserContractTracking';
import ComplianceCheck from './pages/ComplianceCheck';
import SystemHealth from './pages/SystemHealth';
import BusCardManagement from './pages/BusCardManagement';
import BusCardPricing from './pages/BusCardPricing';
import BusCardPricingList from './pages/BusCardPricingList';
import BusCardSubscription from './pages/BusCardSubscription';
import BusCardEdit from './pages/BusCardEdit';
import BusCardRegister from './pages/BusCardRegister';
import AutoTopUpLogs from './pages/AutoTopUpLogs';
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
                      {/* Support legacy or alternate station detail/form URLs */}
                      <Route
                        path="/station-detail/:id"
                        element={
                          <ProtectedRoute>
                            <StationDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/station-form/:id"
                        element={
                          <ProtectedRoute>
                            <StationEdit />
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
            {/* Support alternate payment point detail URL */}
            <Route
              path="/payment-point/detail/:id"
              element={
                <ProtectedRoute>
                  <PaymentPointDetail />
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
            {/* Support legacy or alternate station detail/form URLs */}
            <Route
              path="/station-detail/:id"
              element={
                <ProtectedRoute>
                  <StationDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/station-form/:id"
              element={
                <ProtectedRoute>
                  <StationEdit />
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
            <Route
              path="/station-map"
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
                  <BusAdd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bus/:id"
              element={
                <ProtectedRoute>
                  <BusDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bus/:id/edit"
              element={
                <ProtectedRoute>
                  <BusEdit />
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
            <Route
              path="/route/:id"
              element={
                <ProtectedRoute>
                  <RouteDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/route/:id/stations"
              element={
                <ProtectedRoute>
                  <RouteStations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/routes/:id/stations/manage"
              element={
                <ProtectedRoute>
                  <RouteStations />
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
            <Route
              path="/wallet-status"
              element={
                <ProtectedRoute>
                  <WalletStatusUpdate />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes (for admin users themselves) */}
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute>
                  <AdminProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/activity"
              element={
                <ProtectedRoute>
                  <AdminActivity />
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

            {/* SuperAdmin Routes */}
            <Route
              path="/admin/list"
              element={
                <ProtectedRoute>
                  <AdminList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add"
              element={
                <ProtectedRoute>
                  <AdminAdd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/edit/:id"
              element={
                <ProtectedRoute>
                  <AdminEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/roles/:id"
              element={
                <ProtectedRoute>
                  <RoleManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bus-income-reports"
              element={
                <ProtectedRoute>
                  <BusIncomeReports />
                </ProtectedRoute>
              }
            />

            {/* Statistics Route */}
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

            {/* Bus Card Management Routes */}
            <Route
              path="/buscard-management"
              element={
                <ProtectedRoute>
                  <BusCardManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buscard-register"
              element={
                <ProtectedRoute>
                  <BusCardRegister />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buscard-edit/:uid"
              element={
                <ProtectedRoute>
                  <BusCardEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buscard-subscription"
              element={
                <ProtectedRoute>
                  <BusCardSubscription />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buscard-pricing"
              element={
                <ProtectedRoute>
                  <BusCardPricing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buscard-pricing-list"
              element={
                <ProtectedRoute>
                  <BusCardPricingList />
                </ProtectedRoute>
              }
            />

            {/* Log Kayıtları Routes */}
            <Route
              path="/auto-top-up-logs"
              element={
                <ProtectedRoute>
                  <AutoTopUpLogs />
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