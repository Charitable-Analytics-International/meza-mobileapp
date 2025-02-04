'use strict';

import { BACKGROUND_UPLOAD_DELAY_MS } from '../config.js';
import { existsByFileName } from './filesystem.js';
import { isLoggedIn } from './router.js';
import { database } from '../app.js';
import { logout } from '../pages/login.js';
import { updateCounter } from '../pages/upload.js';
import { isNetworkStatusConnected, uploadFile } from './http.js';
import { isObject, isArray, isStringNonEmpty } from './datatype.js';


async function returnOneUnsentImage(){

    // check requirements
    if (!await isLoggedIn()) return null;
    if (!await isNetworkStatusConnected()) return null;

    // retrieve the pictures from the database
    const db_pictures_unsent = await database.readUnsent();
    if (!isArray(db_pictures_unsent)) return null;

    // check that database contains unsent images
    const count = db_pictures_unsent.length;
    if (count.length === 0) return null;

    // select a file at random
    const index = Math.floor(Math.random() * count);
    const db_picture = db_pictures_unsent[index];
    if (!isObject(db_picture)) return null;
    if (!isStringNonEmpty(db_picture['name'])) return null;

    // destructure
    const { name } = db_picture;

    // TODO: The Capacitor FileSystem Plugin often crashes.
    //       So before we make a call to the file we remove
    //       it from the db. If it crashes, it won't next time

    // TODO: remove file from db
    await database.updateIgnore(name, 1);

    // check if file exists
    if (!await existsByFileName(name)) return null;

    // TODO: re-add to db
    await database.updateIgnore(name, 0);

    return db_picture;
}


export async function uploadInBackground(){

    // get the path of an unsent image
    const db_picture = await returnOneUnsentImage();

    // upload
    if (isObject(db_picture) && isStringNonEmpty(db_picture['name'])){

        // grab data
        const { name } = db_picture;

        // send request
        const response = await uploadFile(name);     

        // check that response has data attached
        if (isObject(response)){

            // grab data from response
            const { status } = response;

            if (+status === 401){
                console.log('INFO - sid expired')
                await logout();

            }else if(+status === 200){

                // remove
                const db_success = await database.updateSent(name);
                // const fs_success = await deleteFileByFileName(filename);

                if (db_success){
                    console.log(`Successfully uploaded ${name}`);
                } else{
                    console.error(`Error - Could not update the database ${name}`);
                }

                // update the counter
                await updateCounter();

            }else{
                console.error(`Error - Could not upload ${name}`);
            }
        }
    }

    // loop
    setTimeout(() => {
        uploadInBackground();
    }, BACKGROUND_UPLOAD_DELAY_MS);
}
