import axios from 'axios';
import StorageService from './StorageService';
import {KEYS} from './StringUtils';
import {ApiEndPoints} from './ApiEndPoints';

// Function to handle GET requests
async function getRequest(
  endpoint,
  params = {},
  headers = {},
  onSuccess,
  onFailure,
) {
  const token = await StorageService.getData(KEYS.TOKEN);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  console.log('POST STAT ====================================');
  console.log('postRequest => ', `${ApiEndPoints.BASE_URL}${endpoint}`);
  console.log('postRequest => params', params);
  console.log('postRequest => token', token);
  console.log('postRequest => headers', headers);
  console.log('getRequest POST END ====================================');
  axios
    .get(`${ApiEndPoints.BASE_URL}${endpoint}`, {params, headers})
    .then(response => {
      console.log('getRequest  response___', response);
      return onSuccess(response.data, response.status);
    })
    .catch(error => onFailure(error, error.response?.status));
}

// Function to handle POST requests
async function postRequest(
  endpoint,
  data = {},
  headers = {},
  onSuccess,
  onFailure,
) {
  const token = await StorageService.getData(KEYS.TOKEN);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  console.log('POST STAT ====================================');
  console.log('postRequest => ', `${ApiEndPoints.BASE_URL}${endpoint}`);
  console.log('postRequest => data', data);
  console.log('postRequest => token', token);
  console.log('postRequest => headers', headers);
  console.log('postRequest POST END ====================================');

  axios
    .post(`${ApiEndPoints.BASE_URL}${endpoint}`, data, {headers})
    .then(response => {
      console.log('postRequest response___', response);
      return onSuccess(response.data, response.status);
    })
    .catch(error => {
      console.log('error___', error);
      return onFailure(error);
    });
}

// Function to handle PUT requests
async function putRequest(
  endpoint,
  data = {},
  headers = {},
  onSuccess,
  onFailure,
) {
  const token = await StorageService.getData(KEYS.TOKEN);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  axios
    .put(`${ApiEndPoints.BASE_URL}${endpoint}`, data, {headers})
    .then(response => {
      console.log('response___', response);
      return onSuccess(response.data, response.status);
    })
    .catch(error => {
      console.log('error___', error);
      return onFailure(error, error.response?.status);
    });
}

// Function to handle DELETE requests
async function deleteRequest(
  endpoint,
  params = {},
  headers = {},
  onSuccess,
  onFailure,
) {
  const token = await StorageService.getData(KEYS.TOKEN);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  axios
    .delete(`${ApiEndPoints.BASE_URL}${endpoint}`, {params, headers})
    .then(response => onSuccess(response.data, response.status))
    .catch(error => onFailure(error, error.response?.status));
}

// Exporting functions for external usage
export default {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
};
