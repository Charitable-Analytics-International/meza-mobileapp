'use strict';

// Helper function
export function isObject(value) {
    return value !== null && typeof value === 'object';
}
export function isArray(value) {
    return Array.isArray(value);
}
export function isStringNonEmpty(value) {
    return typeof value === 'string' && value.trim() !== '';
}
export function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}
export function isHttpsUrl(url) {
    return isStringNonEmpty(url) && (url.startsWith('https://') || url.startsWith('http://localhost'));
}
export function isEmail(email) {
    return isStringNonEmpty(email)  && /\S+@\S+\.\S+/.test(email);
}
export function isDate(value) {
    return value instanceof Date && !isNaN(value);
}
