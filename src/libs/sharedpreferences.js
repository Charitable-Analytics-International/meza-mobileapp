'use strict';

import { Storage } from '@capacitor/storage';

/**
 * Retrieves a stored value for the given key.
 * @param {string} key 
 * @returns {Promise<string|null>} The stored value or null.
 */
export async function getItem(key) {
    const { value } = await Storage.get({ key });
    return value;
}

/**
 * Stores a value for the given key.
 * @param {string} key 
 * @param {string} value 
 */
export async function setItem(key, value) {
    await Storage.set({ key, value });
}

/**
 * Removes the value for the given key.
 * @param {string} key 
 */
export async function removeItem(key) {
    await Storage.remove({ key });
}
