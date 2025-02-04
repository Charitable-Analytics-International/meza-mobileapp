'use strict';

import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { isArray, isObject } from './datatype.js';

// Database name
const DB_NAME = 'meza_db';


// SQL command to create the images table
const CREATE_TABLE_IMAGE = `
CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    size_kb INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    ignore INTEGER NOT NULL DEFAULT 0,
    sent INTEGER NOT NULL DEFAULT 0,
    sent_at TEXT,
    status INTEGER NOT NULL DEFAULT -1
);
`;

export class Database {
    constructor() {
        // Create a new SQLite connection instance using the CapacitorSQLite plugin.
        this.sqlite = new SQLiteConnection(CapacitorSQLite);
        this.db = null;
        this.DB_NAME = DB_NAME;
    }
    
    /**
    * Initializes the database connection and creates necessary tables.
    * @returns {Promise<boolean>} True on success, false on error.
    */
    async init() {
        try {
            // Check connection consistency and whether a connection already exists.
            const consistency = (await this.sqlite.checkConnectionsConsistency()).result;
            const isConn = (await this.sqlite.isConnection(this.DB_NAME)).result;
            
            // Either retrieve an existing connection or create a new one.
            if (consistency && isConn) {
                this.db = await this.sqlite.retrieveConnection(this.DB_NAME);
            } else {
                this.db = await this.sqlite.createConnection(this.DB_NAME, false, 'no-encryption', 1);
            }
            
            // Open the database connection.
            await this.db.open();
        } catch (err) {
            console.error('Error initializing database:', err);
            return false;
        }
        
        // Initialize the images table.
        await this.safeQuery(CREATE_TABLE_IMAGE);
        return true;
    }
    
    /**
    * Executes a SQL query safely by first verifying the connection is open.
    * @param {string} query - The SQL query to execute.
    * @returns {Promise<Object|undefined>} The query result, or undefined if an error occurs.
    */
    async safeQuery(query) {
        // Ensure the database is open.
        if (!await this.db.isDBOpen(this.DB_NAME)) {
            console.error('DB is not open');
            return;
        }
        try {
            const result = await this.db.query(query);
            return result;
        } catch (err) {
            console.error('Query error:', err);
            return;
        }
    }
    
    /**
    * Inserts a new image record into the images table.
    * @param {string} name - The unique file name.
    * @param {number} size_kb - The size of the image file (in kilobytes).
    * @param {string} created_at - The creation date as a string.
    * @returns {Promise<Object|undefined>} The result of the insertion.
    */
    async create(name, size_kb, created_at) {
        console.log(`INFO: Creating image record for ${name}`);
        const query = `INSERT INTO images (name, size_kb, created_at) VALUES ('${name}', ${size_kb}, '${created_at}')`;
        const result = await this.safeQuery(query);
        return result;
    }
    
    /**
    * Reads all image records that are not marked as ignored.
    * @returns {Promise<Array|undefined>} An array of image records.
    */
    async read() {
        console.log('INFO: Reading image records');
        const query = 'SELECT * FROM images WHERE ignore = 0 ORDER BY id DESC';
        const result = await this.safeQuery(query);
        if (!isObject(result)) return;
        if (!isArray(result.values)) return;
        return result.values;
    }
    
    /**
    * Reads all image records that are unsent.
    * @returns {Promise<Array|undefined>} An array of unsent image records.
    */
    async readUnsent() {
        console.log('INFO: Reading unsent image records');
        const query = 'SELECT * FROM images WHERE ignore = 0 AND sent = 0';
        const result = await this.safeQuery(query);
        if (!isObject(result)) return;
        if (!isArray(result.values)) return;
        return result.values;
    }
    
    /**
    * Marks an image record as sent.
    * @param {string} name - The unique file name.
    * @returns {Promise<Object|undefined>} The result of the update.
    */
    async updateSent(name) {
        console.log(`INFO: Marking image ${name} as sent`);
        const query = `UPDATE images SET sent = 1 WHERE name = '${name}'`;
        const result = await this.safeQuery(query);
        return result;
    }
    
    /**
    * Updates the status of an image record.
    * @param {string} name - The unique file name.
    * @param {number} status - The new status value.
    * @returns {Promise<Object|undefined>} The result of the update.
    */
    async updateStatus(name, status) {
        console.log(`INFO: Updating image status for ${name} to ${status}`);
        const query = `UPDATE images SET status = ${status} WHERE name = '${name}'`;
        const result = await this.safeQuery(query);
        return result;
    }
    
    /**
    * Updates the ignore flag of an image record.
    * @param {string} name - The unique file name.
    * @param {number} ignore - The new ignore flag (0 or 1).
    * @returns {Promise<Object|undefined>} The result of the update.
    */
    async updateIgnore(name, ignore) {
        console.log(`INFO: Updating ignore flag for ${name} to ${ignore}`);
        const query = `UPDATE images SET ignore = ${ignore} WHERE name = '${name}'`;
        const result = await this.safeQuery(query);
        return result;
    }
    
    /**
    * Deletes an image record.
    * @param {string} name - The unique file name.
    * @returns {Promise<Object|undefined>} The result of the deletion.
    */
    async delete(name) {
        console.log(`INFO: Deleting image record for ${name}`);
        const query = `DELETE FROM images WHERE name = '${name}'`;
        const result = await this.safeQuery(query);
        return result;
    }
    
    /**
    * Destroys (deletes) the entire database.
    * @returns {Promise<boolean>} True if successful, false otherwise.
    */
    async destroy() {
        try {
            // Check if the database exists.
            const exists = (await this.db.isExists()).result;
            if (!exists) return false;
            await this.db.delete();
        } catch (err) {
            console.error('Error destroying database:', err);
            return false;
        }
        return true;
    }
}
