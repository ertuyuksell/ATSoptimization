import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(err);
  },
);

export const AuthApi = {
  register: (payload) => api.post('/auth/register', payload).then(r => r.data),
  login:    (payload) => api.post('/auth/login', payload).then(r => r.data),
};

export const ResumeApi = {
  upload: (file, jobDescription) => {
    const fd = new FormData();
    fd.append('file', file);
    if (jobDescription) fd.append('jobDescription', new Blob([jobDescription], { type: 'text/plain' }));
    return api.post('/resumes/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
  list:     () => api.get('/resumes').then(r => r.data),
  dashboard:() => api.get('/resumes/dashboard').then(r => r.data),
  analysis: (id) => api.get(`/resumes/${id}/analysis`).then(r => r.data),
  fileUrl:  (id) => `${api.defaults.baseURL}/resumes/${id}/file`,
};

export default api;
