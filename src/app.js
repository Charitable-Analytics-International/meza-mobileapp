'use strict';

import { handleRouting } from './libs/router.js';
import { initLoginPage } from './pages/login.js';
import { initUploadPage } from './pages/upload.js';
import { initDeviceInfoPage } from './pages/device-info.js';

// Initialize the database connection.
import { Database } from './libs/database.js';
export const database = new Database();

// Initialize cronjobs.
import { uploadInBackground } from './libs/cronjobs.js';


async function initApp() {
    
    // Route to the proper page based on login status and the current hash.
    await handleRouting();

    // Initialize the database connection.
    await database.init();

    // Start the background upload process.
    uploadInBackground();

    // Initialize the different pages
    initLoginPage();
    initUploadPage();
    initDeviceInfoPage();
    
    // Listen for hash changes.
    window.addEventListener('hashchange', handleRouting);
}

// Initialize the app once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', initApp);
