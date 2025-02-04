'use strict';

import { v4 as uuidv4 } from 'uuid';
import { picturesFromGallery, pictureFromCamera } from '../libs/camera.js';
import { writeFile, readFileStatisticsByFileName } from '../libs/filesystem.js';
import { database } from '../app.js';
import { isObject, isArray } from '../libs/datatype.js';

// Internal flag to prevent multiple initializations.
let pageInitialized = false;


// ---------------------------------------------------------------------
// Display Pictures
// ---------------------------------------------------------------------
export async function updateCounter(){

    // Get the unsent images
    const images = await database.readUnsent();
    if (!isArray(images)) {
        console.error('Error reading unsent images');
        return null;
    }

    // Update the counter
    const counter = document.getElementById('unsent-image-count');
    if (!counter) return null;

    // Update the counter
    counter.textContent = `${images.length} unsent image(s)`;
    counter.style.display = images.length > 0 ? 'block' : 'none';
}


// ---------------------------------------------------------------------
// Process Picture
// ---------------------------------------------------------------------
async function processPicture(picture) {
    if (!picture || typeof picture !== 'object') {
        alert('Invalid picture');
        return;
    }

    // Extract the data URL and format from the picture object.
    const { dataUrl, format } = picture;

    // Create a unique filename (using a simple timestamp + random number for this example)
    const filename = `${uuidv4()}.${format}`;
    
    // Write the file to the filesystem.
    const success = writeFile(filename, dataUrl);

    // Check for success
    if (!success) {
        alert('Error writing file');
        return;
    }

    // Read the file statistics.
    const imageInfo = await readFileStatisticsByFileName(filename);

    // check
    if (!isObject(imageInfo)) {
        alert('Error reading file');
        return;
    }

    // destructure
    const { ctime, size } = imageInfo;

    // add picture to database
    await database.create( filename, size, ctime );
}


// ---------------------------------------------------------------------
// Upload Functions
// ---------------------------------------------------------------------
async function takePicture() {
    try {
        // Use the actual camera function.
        const picture = await pictureFromCamera();
        if (picture) {
            await processPicture(picture);
        } else {
            alert('No picture taken');
        }
    } catch (error) {
        console.error('Error taking picture:', error);
        alert('Error taking picture');
    }

    // Update the counter
    updateCounter();
}

async function uploadPictures() {
    try {
        // Use the actual gallery function.
        const pictures = await picturesFromGallery();
        if (Array.isArray(pictures) && pictures.length > 0) {
            for (const pic of pictures) {
                await processPicture(pic);
            }
        } else {
            alert('No pictures selected');
        }
    } catch (error) {
        console.error('Error uploading pictures:', error);
        alert('Error uploading pictures');
    }

    // Update the counter
    updateCounter();
}

// ---------------------------------------------------------------------
// Exported Initialization Function
// ---------------------------------------------------------------------
export function initUploadPage() {
    if (pageInitialized) return;
    pageInitialized = true;
  
    const takePictureBtn = document.getElementById('take-picture-btn');
    const uploadPicturesBtn = document.getElementById('upload-pictures-btn');
  
    if (takePictureBtn) {
        takePictureBtn.addEventListener('click', takePicture);
    }
    if (uploadPicturesBtn) {
        uploadPicturesBtn.addEventListener('click', uploadPictures);
    }
    
    // Update the counter
    updateCounter();
}
