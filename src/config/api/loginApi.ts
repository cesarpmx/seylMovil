import axios from "axios";
import { API_WMS_URL as api_wms_url, API_USERNAME as api_username, API_PASSWORD as api_password } from '@env';

export const API_URL = api_wms_url;
export const API_USERNAME = api_username;
export const API_PASSWORD = api_password;

const loginApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    auth: {
        username: api_username,
    password: API_PASSWORD,
      },
})

// TODO Interceptors

export {
    loginApi
}