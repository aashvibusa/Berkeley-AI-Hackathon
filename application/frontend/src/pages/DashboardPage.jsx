import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (user) {
                try {
                    const data = await api.getUserStats(user.username);
                    setStats(data);
                } catch (error) {
                    console.error("Failed to fetch stats:", error);
                }
            }
        };
        fetchStats();
    }, [user]);
    
    return (
        <div style={styles.dashboardContainer}>
            <header style={styles.header}>
                <h1 style={styles.headerTitle}>Dashboard</h1>
                <div>
                    <Link to="/settings" style={styles.settingsLink}>Settings</Link>
                    <button onClick={logout} style={styles.logoutButton}>Logout</button>
                </div>
            </header>
            <main style={styles.mainContent}>
                <div style={styles.welcomeCard}>
                    <h2 style={styles.welcomeTitle}>¡Hola, {user?.first_name || 'learner'}!</h2>
                    <p style={styles.welcomeText}>Ready for your next lesson?</p>
                    <Link to="/chat" style={styles.lessonButton}>Start Mini-Lesson</Link>
                </div>

                <div style={styles.statsContainer}>
                    {/* Stats will be displayed here */}
                </div>
            </main>
        </div>
    );
};

const styles = {
    dashboardContainer: {
        backgroundColor: '#f0f2f5',
        minHeight: '100vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    headerTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333',
    },
    settingsLink: {
        marginRight: '20px',
        textDecoration: 'none',
        color: '#007bff',
    },
    logoutButton: {
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    mainContent: {
        padding: '40px',
    },
    welcomeCard: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center',
        marginBottom: '30px',
    },
    welcomeTitle: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333',
    },
    welcomeText: {
        fontSize: '18px',
        color: '#666',
        marginTop: '10px',
    },
    lessonButton: {
        display: 'inline-block',
        marginTop: '20px',
        padding: '12px 24px',
        backgroundColor: '#28a745',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        fontWeight: 'bold',
    },
    statsContainer: {
        // Styles for stats container
    }
};

export default DashboardPage; 