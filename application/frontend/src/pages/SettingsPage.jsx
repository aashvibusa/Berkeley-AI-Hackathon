import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

const SettingsPage = () => {
    const { user } = useAuth();
    // Assuming the user object has preferences, otherwise fetch them or use defaults
    const [experienceLevel, setExperienceLevel] = useState(user?.preferences?.experience_level || 'beginner');
    const [learningGoal, setLearningGoal] = useState(user?.preferences?.learning_goal || 'conversational');
    const [practiceFrequency, setPracticeFrequency] = useState(user?.preferences?.practice_frequency || '2-3 times a week');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!user) {
            setError("You must be logged in to update preferences.");
            return;
        }
        try {
            await api.setPreferences(user.username, {
                experience_level: experienceLevel,
                learning_goal: learningGoal,
                practice_frequency: practiceFrequency,
            });
            setSuccess('Preferences saved successfully!');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={styles.settingsContainer}>
             <header style={styles.header}>
                <h1 style={styles.headerTitle}>Settings</h1>
                <Link to="/" style={styles.backLink}>Back to Dashboard</Link>
            </header>
            <main style={styles.mainContent}>
                <div style={styles.formBox}>
                    <h2 style={styles.title}>Update Your Preferences</h2>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <label style={styles.label}>
                            What is your current experience level?
                            <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} style={styles.input}>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </label>
                        <label style={styles.label}>
                            What is your primary learning goal?
                            <select value={learningGoal} onChange={(e) => setLearningGoal(e.target.value)} style={styles.input}>
                                <option value="conversational">Becoming conversational</option>
                                <option value="fluent">Achieving fluency</option>
                                <option value="business">Business & Professional</option>
                            </select>
                        </label>
                        <label style={styles.label}>
                            How often would you like to practice?
                            <select value={practiceFrequency} onChange={(e) => setPracticeFrequency(e.target.value)} style={styles.input}>
                                <option value="daily">Daily</option>
                                <option value="2-3 times a week">2-3 times a week</option>
                                <option value="weekly">Once a week</option>
                            </select>
                        </label>
                        <button type="submit" style={styles.button}>Save Changes</button>
                    </form>
                    {error && <p style={{...styles.message, color: 'red'}}>{error}</p>}
                    {success && <p style={{...styles.message, color: 'green'}}>{success}</p>}
                </div>
            </main>
        </div>
    );
};

const styles = {
    settingsContainer: {
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
    backLink: {
        textDecoration: 'none',
        color: '#007bff',
        fontSize: '16px',
    },
    mainContent: {
        padding: '40px',
        display: 'flex',
        justifyContent: 'center',
    },
    formBox: {
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '600px',
    },
    title: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '20px',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        fontSize: '16px',
        marginBottom: '15px',
    },
    input: {
        width: '100%',
        padding: '10px',
        marginTop: '5px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '16px',
    },
    button: {
        padding: '12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '10px',
    },
    message: {
        marginTop: '15px',
        textAlign: 'center',
        fontWeight: 'bold',
    }
};

export default SettingsPage; 