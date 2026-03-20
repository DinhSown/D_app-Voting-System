import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// User pages
import HomePage from "./pages/HomePage";
import VotingsPage from "./pages/VotingsPage";
import VotingDetailPage from "./pages/VotingDetailPage";
import VotePage from "./pages/VotePage";
import ResultsPage from "./pages/ResultsPage";

// Admin pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminVotings from "./pages/admin/AdminVotings";
import AdminVotingForm from "./pages/admin/AdminVotingForm";
import AdminCandidates from "./pages/admin/AdminCandidates";
import AdminTransactions from "./pages/admin/AdminTransactions";

// Layout
import Navbar from "./components/Navbar";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}><div className="spinner" /></div>;
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes with Navbar */}
      <Route path="/" element={<><Navbar /><HomePage /></>} />
      <Route path="/votings" element={<><Navbar /><VotingsPage /></>} />
      <Route path="/votings/:id" element={<><Navbar /><VotingDetailPage /></>} />
      <Route path="/votings/:id/vote" element={<><Navbar /><VotePage /></>} />
      <Route path="/votings/:id/results" element={<><Navbar /><ResultsPage /></>} />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/votings" element={<ProtectedRoute><AdminVotings /></ProtectedRoute>} />
      <Route path="/admin/votings/new" element={<ProtectedRoute><AdminVotingForm /></ProtectedRoute>} />
      <Route path="/admin/votings/:id/edit" element={<ProtectedRoute><AdminVotingForm /></ProtectedRoute>} />
      <Route path="/admin/votings/:id/candidates" element={<ProtectedRoute><AdminCandidates /></ProtectedRoute>} />
      <Route path="/admin/votings/:id/transactions" element={<ProtectedRoute><AdminTransactions /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
