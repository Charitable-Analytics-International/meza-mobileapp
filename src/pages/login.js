'use strict';

import { PAGE_IDS, ENDPOINT_LOGIN_USING_CRED } from '../config.js';
import { getItem, setItem } from '../libs/sharedpreferences.js';
import { reqPOST } from '../libs/http.js';
import { isStringNonEmpty, isHttpsUrl, isEmail } from '../libs/datatype.js';

// Internal flag to prevent multiple initializations.
let pageInitialized = false;

// --------------------
// Helper Functions
// --------------------

function showError(message) {
    document.getElementById('error-message').textContent = message;
}


// --------------------
// Login Logic
// --------------------
export async function login() {
    const server = document.getElementById('server-input').value.trim();
    const email = document.getElementById('email-input').value.trim();
    const password = document.getElementById('password-input').value;
    
    // Basic input validation
    if (!isStringNonEmpty(server) || !isStringNonEmpty(email) || !isStringNonEmpty(password)) {
        showError('All fields are required.');
        return;
    }
    if (!isHttpsUrl(server)) {
        showError('Server URL must start with "https://".');
        return;
    }
    if (!isEmail(email)) {
        showError('Invalid email.');
        return;
    }
    if (!isStringNonEmpty(password)) {
        showError('Password cannot be empty.');
        return;
    }
    
    // Clear previous errors
    showError('');

    // Clear the password field.
    document.getElementById('password-input').value = '';

    // Disable the login button to prevent multiple clicks.
    document.getElementById('login-btn').disabled = true;
    
    // Send the login request.
    const response = await reqPOST(server + ENDPOINT_LOGIN_USING_CRED, { email, password });

    // Re-enable the login button.
    document.getElementById('login-btn').disabled = false;

    // Check if the login was successful.
    if (!response || !response.sid) {
        showError('Login failed.');
        return;
    }

    // Extract the SID from the response.
    const { sid } = response;

    // On successful login, mark the user as logged in Storage.
    await setItem('loggedIn', 'true');

    // Store the login info in Storage.
    await setItem('server', server);
    await setItem('email', email);

    // Store the SID in Storage.
    await setItem('sid', sid);
    
    // Navigate to the upload page.
    location.hash = PAGE_IDS.upload;
}


// --------------------
// Logout Logic
// --------------------
export async function logout() {

    // Reset the login status in Storage.
    await setItem('loggedIn', 'false');
    await setItem('sid', '');
    
    // Navigate to the login page.
    location.hash = PAGE_IDS.login;
}


// --------------------
// Initialization
// --------------------
export async function initLoginPage() {
    if (pageInitialized) return;
    pageInitialized = true;

    // Add event listeners to the login form.
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', login);
    }

    // Add event listeners to the logout button.
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', logout);
    }

    // Set the server and email values if they were stored in Storage.
    const server = await getItem('server');
    const email = await getItem('email');
    if (server) {
        document.getElementById('server-input').value = server;
    }
    if (email) {
        document.getElementById('email-input').value = email;
    }
}
