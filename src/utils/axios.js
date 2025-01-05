import axios from "axios";

const instance = axios.create({
  baseURL: 'http://localhost:8080/api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    // 'Content-Type': 'multipart/form-data',

  },
});

instance.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token');

  if (config.authRequired && token) {

    config.headers.Authorization = 'Bearer ' + token;
  }

  if (config.multipart) {
    config.headers["Content-Type"] = "multipart/form-data";
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