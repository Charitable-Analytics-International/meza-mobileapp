'use strict';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { isObject, isNumber, isStringNonEmpty } from './datatype.js';


/**
* Captures a picture using the device camera.
*/
export async function pictureFromCamera(quality = 90) {
    if (!isNumber(quality)) quality = 90;
    try {
        const photo = await Camera.getPhoto({
            quality: quality,
            allowEditing: false,
            resultType: CameraResultType.DataUrl, // Return a data URL so the image can be immediately displayed.
            saveToGallery: false,
            source: CameraSource.Camera
        });
        if (isObject(photo) &&
            isStringNonEmpty(photo.dataUrl) &&
            isStringNonEmpty(photo.format)) {
            return photo;
        }
    } catch (error) {
        console.error('Error capturing photo from camera:', error);
    }
    return null;
}


/**
* Selects a single picture from the photo gallery.
*/
export async function pictureFromGallery(quality = 90) {
    if (!isNumber(quality)) quality = 90;
    try {
        const photo = await Camera.getPhoto({
            quality: quality,
            allowEditing: false,
            resultType: CameraResultType.DataUrl, // Return the image as a Data URL.
            saveToGallery: false,
            source: CameraSource.Photos
        });
        if (isObject(photo) &&
            isStringNonEmpty(photo.dataUrl) &&
            isStringNonEmpty(photo.format)) {
            return photo;
        }
    } catch (error) {
        console.error('Error picking photo from gallery:', error);
    }
    return null;
}


/**
* Allows the user to pick multiple pictures from the photo gallery.
* For each selected photo, its native URL (webPath) is fetched and converted to a Data URL.
*/
export async function picturesFromGallery(quality = 90) {
    if (!isNumber(quality)) quality = 90;
    try {
        const result = await Camera.pickImages({ quality });
        if (!isObject(result) || !result.photos) return null;
        const photos = result.photos;
        
        // Process each photo: convert the native webPath to a Data URL.
        const processedPhotos = await Promise.all(
            photos.map(async (photo) => {
                const { format, webPath } = photo;
                if (!isStringNonEmpty(webPath) || !isStringNonEmpty(format)) {
                    return null;
                }
                try {
                    const response = await fetch(webPath);
                    const blob = await response.blob();
                    const dataUrl = await blobToDataURL(blob);
                    return { ...photo, dataUrl };
                } catch (error) {
                    console.error('Error processing gallery photo:', error);
                    return null;
                }
            })
        );
        return processedPhotos.filter(p => p !== null);
    } catch (error) {
        console.error('Error picking multiple images from gallery:', error);
    }
    return null;
}


/**
* Converts a Blob to a Data URL.
* @param {Blob} blob - The Blob to convert.
* @returns {Promise<string>} - A promise that resolves with the Data URL.
*/
function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
