import axios from 'axios';
import { apiBasePath } from '../config/env';

const api = axios.create({
  baseURL: apiBasePath,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
