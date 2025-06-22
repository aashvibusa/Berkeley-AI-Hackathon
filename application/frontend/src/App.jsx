import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import QuestionnairePage from './pages/QuestionnairePage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import ChatPage from './pages/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/questionnaire" element={<ProtectedRoute><QuestionnairePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        </Routes>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;