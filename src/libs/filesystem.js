'use strict';

import { Filesystem, Directory } from '@capacitor/filesystem';
import { isObject, isStringNonEmpty, isArray, isNumber } from './datatype.js';

// Configuration
const DEFAULT_DIRECTORY = Directory.External;
const PICTURES_SUBDIRECTORY = '/Pictures/';

// Helper functions
function unixToDate(unixTimestamp) {
    if (!isNumber(unixTimestamp)) return null;
    return new Date(unixTimestamp).toUTCString();
}


/**
* Helper function to generate a relative path for a picture file.
* Ensures the file is stored under the designated subdirectory.
* @param {string} filename 
* @returns {string}
*/
function getPicturePath(filename) {
    // Ensure that the subdirectory ends with a slash.
    return `${PICTURES_SUBDIRECTORY}${filename}`;
}

/**
* Reads the contents of the pictures directory.
* @returns {Promise<Array|null>} An array of file names or null on error.
*/
export async function readPicturesDir() {
    console.log('INFO: Attempting to read picture directory...');
    let result = null;
    try {
        result = await Filesystem.readdir({
            directory: DEFAULT_DIRECTORY,
            path: PICTURES_SUBDIRECTORY
        });
    } catch (error) {
        console.error('Error reading directory:', error);
    }
    if (!isObject(result)) return null;
    
    const { files } = result;
    if (!isArray(files)) return null;
    
    console.log('INFO: Picture directory read successfully.');
    return files;
}

/**
* Reads the file content for a given filename.
* Only accepts filenames ending with .jpg or .jpeg.
* @param {string} filename 
* @returns {Promise<string|null>} The file data (Base64 string) or null on error.
*/
export async function readFileByFileName(filename) {
    console.log(`INFO: Attempting to read file: ${filename}`);
    
    if (!isStringNonEmpty(filename)) return null;
    // For simplicity, check that the filename ends with '.jpg' or '.jpeg' (case-insensitive).
    if (!filename.toLowerCase().endsWith('.jpg') && !filename.toLowerCase().endsWith('.jpeg')) {
        console.warn(`WARNING: Filename does not have a supported extension: ${filename}`);
        return null;
    }
    
    let fileData = null;
    try {
        fileData = await Filesystem.readFile({
            directory: DEFAULT_DIRECTORY,
            path: getPicturePath(filename)
        });
    } catch (error) {
        console.error('Error reading file:', error);
    }
    if (!isObject(fileData)) return null;
    
    const { data } = fileData;
    if (!isStringNonEmpty(data)) return null;
    
    console.log(`INFO: File read succeeded: ${filename}`);
    return data;
}

/**
* Checks whether a file exists by attempting to read it.
* @param {string} filename 
* @returns {Promise<boolean>} True if the file exists, false otherwise.
*/
export async function existsByFileName(filename) {
    const data = await readFileByFileName(filename);
    return data !== null;
}

/**
* Deletes a file with the given filename.
* @param {string} filename 
* @returns {Promise<boolean>} True if deletion succeeded, false otherwise.
*/
export async function deleteFileByFileName(filename) {
    if (!await existsByFileName(filename)) return false;
    console.log(`INFO: Attempting to delete file: ${filename}`);
    
    try {
        await Filesystem.deleteFile({
            directory: DEFAULT_DIRECTORY,
            path: getPicturePath(filename)
        });
        console.log(`INFO: File deleted successfully: ${filename}`);
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
}

/**
* Writes a file with the specified filename and data (Base64 string).
* @param {string} filename 
* @param {string} dataURL 
* @returns {Promise<boolean>} True if writing succeeded, false otherwise.
*/
export async function writeFile(filename, dataURL) {
    if (!isStringNonEmpty(filename) || !isStringNonEmpty(dataURL)) return false;
    
    let result = null;
    try {
        result = await Filesystem.writeFile({
            directory: DEFAULT_DIRECTORY,
            path: getPicturePath(filename),
            data: dataURL,
            recursive: true
        });
    } catch (error) {
        console.error('Error writing file:', error);
    }
    if (!isObject(result)) return false;
    
    const { uri } = result;
    if (!isStringNonEmpty(uri)) return false;
    
    return true;
}

/**
* Reads file statistics (creation time and size) for the given filename.
* @param {string} filename 
* @returns {Promise<Object|null>} An object with 'ctime' and 'size' properties, or null on error.
*/
export async function readFileStatisticsByFileName(filename) {
    if (!await existsByFileName(filename)) return null;
    console.log(`INFO: Attempting to get statistics for file: ${filename}`);
    
    let stats = null;
    try {
        stats = await Filesystem.stat({
            directory: DEFAULT_DIRECTORY,
            path: getPicturePath(filename)
        });
    } catch (error) {
        console.error('Error reading file statistics:', error);
    }
    if (!isObject(stats)) return null;
    
    const { ctime, size } = stats;
    if (!isNumber(size)) return null;
    
    // Convert ctime (expected as a Unix timestamp) to a date string.
    const createdDate = unixToDate(+ctime);
    if (createdDate === null) return null;
    
    // Convert size to kilobytes.
    const sizeKB = size / 1000.0;
    
    console.log(`INFO: Statistics for file ${filename} read successfully.`);
    return {
        ctime: createdDate,
        size: sizeKB
    };
}

/**
* Returns the absolute URI of a file by its filename.
* @param {string} filename 
* @returns {Promise<string|null>} The absolute URI or null on error.
*/
export async function getAbsolutePath(filename) {
    if (!await existsByFileName(filename)) return null;
    console.log(`INFO: Attempting to get absolute path for file: ${filename}`);
    
    let result = null;
    try {
        result = await Filesystem.getUri({
            directory: DEFAULT_DIRECTORY,
            path: getPicturePath(filename)
        });
    } catch (error) {
        console.error('Error getting absolute path:', error);
    }
    if (!isObject(result)) return null;
    
    const { uri } = result;
    if (!isStringNonEmpty(uri)) return null;
    
    console.log(`INFO: Absolute path for ${filename} is: ${uri}`);
    return uri;
}
