'use strict';

// ----- General App -----
export const APP_NAME = 'CAI Meza';
export const APP_VERSION = '1.5';

export const PAGE_IDS = {
    logout: 'logout',
    login: 'login',
    upload: 'upload',
    deviceInfo: 'device-info'
};

// ----- CronJobs Timers -----
export const BACKGROUND_UPLOAD_DELAY_MS = 5000;

// ----- Image Status -----
export const REMOTE_IMAGE_STATUSES = {
    0: 'invalid',
    1: 'valid'
}

// ----- Authentication Endpoints -----
export const ENDPOINT_LOGIN_USING_CRED = '/auth/meza/creds';
export const ENDPOINT_LOGIN_USING_SID = '/auth/meza/sid';
export const ENDPOINT_DESTROY_SID = '/auth/meza/sid';
export const ENDPOINT_USERINFO = '/auth/userinfo';

// ----- File Transfer Endpoints -----
export const ENDPOINT_UPLOAD_FILE = '/api/files/upload';
