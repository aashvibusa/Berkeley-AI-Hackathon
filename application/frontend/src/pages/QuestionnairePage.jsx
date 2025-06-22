import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const QuestionnairePage = () => {
    const [experienceLevel, setExperienceLevel] = useState('beginner');
    const [learningGoal, setLearningGoal] = useState('conversational');
    const [practiceFrequency, setPracticeFrequency] = useState('2-3 times a week');
    const { user } = useAuth();
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!user) {
            setError("You must be logged in to set preferences.");
            return;
        }
        try {
            await api.setPreferences(user.username, {
                experience_level: experienceLevel,
                learning_goal: learningGoal,
                practice_frequency: practiceFrequency,
            });
            navigate('/'); 
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={styles.questionnaireContainer}>
            <div style={styles.authBox}>
                <h2 style={styles.title}>Tell us about yourself!</h2>
                <p style={styles.subtitle}>This will help us personalize your learning experience.</p>
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
                    <button type="submit" style={styles.button}>Save Preferences</button>
                </form>
                {error && <p style={styles.error}>{error}</p>}
            </div>
        </div>
    );
};

const styles = {
    questionnaireContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5',
    },
    authBox: {
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center',
        width: '500px',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px',
    },
    subtitle: {
        fontSize: '16px',
        color: '#666',
        marginBottom: '30px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        fontSize: '16px',
        textAlign: 'left',
        marginBottom: '15px',
    },
    input: {
        width: '100%',
        padding: '12px',
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
    error: {
        color: 'red',
        marginTop: '10px',
    }
};

export default QuestionnairePage; 