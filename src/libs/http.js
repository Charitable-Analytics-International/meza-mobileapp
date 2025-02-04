'use strict';

import { ENDPOINT_UPLOAD_FILE } from '../config.js';
import { Network } from '@capacitor/network';
import { existsByFileName, readFileByFileName } from './filesystem.js';
import { getItem } from './sharedpreferences.js';
import { isStringNonEmpty } from './datatype.js';


export async function isNetworkStatusConnected(){
    const status = await Network.getStatus();
    return status['connected'];
}

export async function reqPOST(url, data) {
    try {
        
        // Send the POST request.
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        // Check the response.
        if (!response.ok) {
            console.error('Error sending POST request:', response.statusText);
            return null;
        }

        // Extract the status code.
        const status = response.status;

        // Parse the response as JSON.
        const results = await response.json();

        // Attach the status code to the response.
        results['status'] = status;

        return results

    } catch (err) {
        console.error('Error sending POST request:', err);
        return null;
    }
}


function base64toBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: contentType });
}


/**
* Uploads a file from the given path to the server.
*/
export async function uploadFile(filename) {

    // Retrieve server, email, and session ID from storage.
    const server = await getItem('server');
    const email = await getItem('email');
    const sid = await getItem('sid');
    if (!isStringNonEmpty(server)) {
        console.error('Invalid server URL:', server);
        return null;
    }
    if (!isStringNonEmpty(email)) {
        console.error('Invalid email:', email);
        return null;
    }
    if (!isStringNonEmpty(sid)) {
        console.error('Invalid session ID:', sid);
        return null;
    }

    // Verify that the file exists.
    if (!await existsByFileName(filename)) {
        console.error('File does not exist:', filename);
        return null;
    }
    
    // Read file data as a Base64 string.
    const fileData = await readFileByFileName(filename);
    if (!isStringNonEmpty(fileData)) {
        console.error('Could not read file data for:', filename);
        return null;
    }

    try {

        // Convert the Base64 string to a Blob.
        const blob = base64toBlob(fileData, 'image/jpeg');

        // Form the FormData object.
        const formData = new FormData();
        formData.append('picture', blob, filename);

        // Send the FormData to the server
        const response = await fetch(server + ENDPOINT_UPLOAD_FILE, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sid}`
            },
            body: formData,
        });
        
        // Check the response
        if (!response.ok) {
            console.error('Error uploading file:', response.statusText);
            return null;
        }

        // Extract the status code.
        const status = response.status;

        // Parse the response as JSON.
        const results = await response.json();

        // Attach the status code to the response.
        results['status'] = status;

        return results;

    } catch (err) {
        console.error('Error uploading file:', err);
        throw err;
    }
}
