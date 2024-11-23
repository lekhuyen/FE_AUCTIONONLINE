import axios from "axios";

const instance = axios.create({
  baseURL: 'http://localhost:8080/api/',
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token');

  if (config.authRequired && token) {
    config.headers.Authorization = 'Bearer ' + token;
  }

  return config;
}, function (error) {
  return Promise.reject(error);
});

instance.interceptors.response.use(function (response) {
  // cau hinh 
  return response.data;
}, function (error) {
  return Promise.reject(error);
});

export default instance;