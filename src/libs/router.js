'use strict';

import { PAGE_IDS } from '../config.js';
import { getItem } from './sharedpreferences.js';
import { logout } from '../pages/login.js';

/**
* Checks whether the user is logged in by reading the "loggedIn" flag from Capacitor Storage.
*/
export async function isLoggedIn() {
    const value = await getItem('loggedIn');
    return value === 'true';
}

/**
* Hides all elements with the "page" class and shows only the container with the given ID.
* @param {string} pageId - The ID of the page container to show.
*/
function showPage(pageId) {
    if (!Object.values(PAGE_IDS).includes(pageId)) {
        console.error('Invalid page ID:', pageId);
        return;
    }
    console.log('Showing page:', pageId);
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = (page.id === pageId) ? 'block' : 'none';
    });
}

/**
* Shows or hides the navigation bar based on login status.
* @param {boolean} loggedIn
*/
function updateNavigation(loggedIn) {
    const navBar = document.getElementById('nav-bar');
    if (navBar) {
        navBar.style.display = loggedIn ? 'block' : 'none';
    }
}

/**
* Handles routing based on the current login status and the URL hash.
*/
export async function handleRouting() {
    
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
        showPage(PAGE_IDS.login);
        updateNavigation(false);
        return;
    }
    
    // If logged in, choose page based on URL hash.
    const hash = location.hash.substring(1);
    switch (hash) {
        case PAGE_IDS.login:
            showPage(PAGE_IDS.login);
            updateNavigation(false);
            break;
        case PAGE_IDS.logout:
            await logout();
            showPage(PAGE_IDS.login);
            updateNavigation(false);
            break;
        case PAGE_IDS.upload:
            showPage(PAGE_IDS.upload);
            updateNavigation(true);
            break;
        case PAGE_IDS.deviceInfo:
            showPage(PAGE_IDS.deviceInfo);
            updateNavigation(true);
            break;
        default:
            // Default to the upload page.
            showPage(PAGE_IDS.upload);
            updateNavigation(true);
            break;
    }
}
