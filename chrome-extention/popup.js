// Global variables
let currentUser = null;
let currentScreen = 'loading';

// Language mapping
const languages = {
    'en': { name: 'English', flag: 'us' },
    'es': { name: 'Spanish', flag: 'es' },
    'fr': { name: 'French', flag: 'fr' },
    'de': { name: 'German', flag: 'de' },
    'it': { name: 'Italian', flag: 'it' },
    'pt': { name: 'Portuguese', flag: 'pt' },
    'ja': { name: 'Japanese', flag: 'jp' }
};

// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
    initializePopup();
});

async function initializePopup() {
    // Show loading screen for 2 seconds
    setTimeout(() => {
        checkLoginStatus();
    }, 2000);
}

async function checkLoginStatus() {
    try {
        // Check if user is logged in from storage
        const result = await chrome.storage.local.get(['currentUser']);
        if (result.currentUser) {
            currentUser = result.currentUser;
            showDashboard();
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        showLogin();
    }
}

function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });
    
    // Hide loading screen
    document.getElementById('loading-screen').style.display = 'none';
    
    // Show target screen
    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        setTimeout(() => {
            targetScreen.classList.add('active');
        }, 10);
    }
    
    currentScreen = screenName;
}

function showLogin() {
    showScreen('login');
    setupLoginListeners();
}

function showRegister() {
    showScreen('register');
    setupRegisterListeners();
}

function showDashboard() {
    showScreen('dashboard');
    loadUserData();
    setupDashboardListeners();
}

// Login functionality
function setupLoginListeners() {
    const loginBtn = document.getElementById('login-btn');
    const showRegisterBtn = document.getElementById('show-register-btn');
    
    loginBtn.addEventListener('click', handleLogin);
    showRegisterBtn.addEventListener('click', showRegister);
    
    // Enter key support
    document.getElementById('login-password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
}

async function handleLogin() {
    const userId = document.getElementById('login-user-id').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!userId || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    try {
        const hashedPassword = await hashPassword(password);
        
        // Check if user exists and password matches
        const response = await fetch('http://localhost:8000/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                password: hashedPassword
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            currentUser = result.user;
            
            // Save to chrome storage
            await chrome.storage.local.set({ currentUser: currentUser });
            
            showDashboard();
        } else {
            const error = await response.json();
            showError(error.detail || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Login failed. Please try again.');
    }
}

// Register functionality
function setupRegisterListeners() {
    const registerBtn = document.getElementById('register-btn');
    const showLoginBtn = document.getElementById('show-login-btn');
    
    registerBtn.addEventListener('click', handleRegister);
    showLoginBtn.addEventListener('click', showLogin);
    
    // Enter key support
    document.getElementById('register-confirm-password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleRegister();
        }
    });
}

async function handleRegister() {
    const userId = document.getElementById('register-user-id').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (!userId || !password || !confirmPassword) {
        showError('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    try {
        const hashedPassword = await hashPassword(password);
        
        const response = await fetch('http://localhost:8000/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                password: hashedPassword
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            currentUser = result.user;
            
            // Save to chrome storage
            await chrome.storage.local.set({ currentUser: currentUser });
            
            showDashboard();
        } else {
            const error = await response.json();
            showError(error.detail || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('Registration failed. Please try again.');
    }
}

// Dashboard functionality
function setupDashboardListeners() {
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    saveSettingsBtn.addEventListener('click', saveSettings);
    logoutBtn.addEventListener('click', handleLogout);
    
    // Language selector listeners
    setupLanguageSelectors();
}

async function loadUserData() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`http://localhost:8000/users/${currentUser.user_id}`);
        if (response.ok) {
            const result = await response.json();
            const userData = result.data;
            
            // Update display name
            document.getElementById('user-display-name').textContent = currentUser.user_id;
            
            // Update words count
            document.getElementById('words-count').textContent = userData.highlighted_words.length;
            
            // Update language selectors
            updateLanguageSelectors(userData.source_language, userData.target_language);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function setupLanguageSelectors() {
    const sourceSelector = document.getElementById('source-language-selector');
    const targetSelector = document.getElementById('target-language-selector');
    
    sourceSelector.addEventListener('click', () => toggleDropdown('source'));
    targetSelector.addEventListener('click', () => toggleDropdown('target'));
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!sourceSelector.contains(e.target) && !targetSelector.contains(e.target)) {
            closeAllDropdowns();
        }
    });
    
    // Language option clicks
    document.querySelectorAll('#source-dropdown .language-option').forEach(option => {
        option.addEventListener('click', () => selectLanguage('source', option.dataset.lang, option.dataset.flag));
    });
    
    document.querySelectorAll('#target-dropdown .language-option').forEach(option => {
        option.addEventListener('click', () => selectLanguage('target', option.dataset.lang, option.dataset.flag));
    });
}

function toggleDropdown(type) {
    const selector = document.getElementById(`${type}-language-selector`);
    const dropdown = document.getElementById(`${type}-dropdown`);
    
    if (selector.classList.contains('open')) {
        closeDropdown(type);
    } else {
        closeAllDropdowns();
        openDropdown(type);
    }
}

function openDropdown(type) {
    const selector = document.getElementById(`${type}-language-selector`);
    const dropdown = document.getElementById(`${type}-dropdown`);
    
    selector.classList.add('open');
    dropdown.style.display = 'block';
}

function closeDropdown(type) {
    const selector = document.getElementById(`${type}-language-selector`);
    const dropdown = document.getElementById(`${type}-dropdown`);
    
    selector.classList.remove('open');
    dropdown.style.display = 'none';
}

function closeAllDropdowns() {
    closeDropdown('source');
    closeDropdown('target');
}

function selectLanguage(type, lang, flag) {
    const selectedElement = document.getElementById(`selected-${type}`);
    const flagUrl = `https://flagcdn.com/w40/${flag}.png`;
    const languageName = languages[lang].name;
    
    selectedElement.querySelector('img').src = flagUrl;
    selectedElement.querySelector('span').textContent = languageName;
    
    closeDropdown(type);
}

function updateLanguageSelectors(sourceLang, targetLang) {
    if (sourceLang && sourceLang !== 'auto') {
        const sourceLangData = languages[sourceLang];
        if (sourceLangData) {
            const selectedSource = document.getElementById('selected-source');
            selectedSource.querySelector('img').src = `https://flagcdn.com/w40/${sourceLangData.flag}.png`;
            selectedSource.querySelector('span').textContent = sourceLangData.name;
        }
    }
    
    if (targetLang) {
        const targetLangData = languages[targetLang.toLowerCase()];
        if (targetLangData) {
            const selectedTarget = document.getElementById('selected-target');
            selectedTarget.querySelector('img').src = `https://flagcdn.com/w40/${targetLangData.flag}.png`;
            selectedTarget.querySelector('span').textContent = targetLangData.name;
        }
    }
}

async function saveSettings() {
    if (!currentUser) return;
    
    try {
        const sourceLang = getSelectedLanguage('source');
        const targetLang = getSelectedLanguage('target');
        
        const response = await fetch('http://localhost:8000/users/languages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: currentUser.user_id,
                source_language: sourceLang,
                target_language: targetLang
            })
        });
        
        if (response.ok) {
            showSuccess('Settings saved successfully!');
        } else {
            showError('Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        showError('Failed to save settings');
    }
}

function getSelectedLanguage(type) {
    const selectedElement = document.getElementById(`selected-${type}`);
    const languageName = selectedElement.querySelector('span').textContent;
    
    for (const [code, data] of Object.entries(languages)) {
        if (data.name === languageName) {
            return code;
        }
    }
    return null;
}

async function handleLogout() {
    try {
        await chrome.storage.local.remove(['currentUser']);
        currentUser = null;
        showLogin();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Utility functions
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

function showError(message) {
    // Simple error display - you could enhance this with a toast notification
    alert(message);
}

function showSuccess(message) {
    // Simple success display - you could enhance this with a toast notification
    alert(message);
} 