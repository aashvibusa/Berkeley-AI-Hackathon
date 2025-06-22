import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const { login, signup } = useAuth();
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                const userData = await login(username, password);
                if (userData.is_new_user) {
                    navigate('/questionnaire');
                } else {
                    navigate('/');
                }
            } else {
                await signup(username, firstName, lastName, password);
                navigate('/questionnaire');
            }
        } catch (err) {
            setError(err.message);
        }
    };
    
    return (
        <div style={styles.authContainer}>
            <div style={styles.authBox}>
                <h2 style={styles.title}>{isLogin ? 'Welcome Back!' : 'Create Your Account'}</h2>
                <p style={styles.subtitle}>{isLogin ? 'Log in to continue your learning journey.' : 'Sign up to begin your personalized Spanish lessons.'}</p>
                <form onSubmit={handleSubmit} style={styles.form}>
                    {!isLogin && (
                        <div style={styles.nameContainer}>
                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" required style={{...styles.input, ...styles.nameInput}} />
                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" required style={{...styles.input, ...styles.nameInput}} />
                        </div>
                    )}
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required style={styles.input} />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required style={styles.input} />
                    <button type="submit" style={styles.button}>{isLogin ? 'Login' : 'Sign Up'}</button>
                </form>
                <button onClick={() => setIsLogin(!isLogin)} style={styles.toggleButton}>
                    {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
                </button>
                {error && <p style={styles.error}>{error}</p>}
            </div>
        </div>
    );
};

const styles = {
    authContainer: {
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
        width: '400px',
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
    input: {
        padding: '12px',
        marginBottom: '15px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '16px',
    },
    nameContainer: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    nameInput: {
        width: '48%',
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
    },
    toggleButton: {
        marginTop: '20px',
        background: 'none',
        border: 'none',
        color: '#007bff',
        cursor: 'pointer',
    },
    error: {
        color: 'red',
        marginTop: '10px',
    }
};

export default LoginPage; 