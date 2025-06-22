import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Update if deployed

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('Cannot connect to server. Make sure the backend is running on http://localhost:8000');
    }
    
    if (error.response) {
      // Server responded with error status
      throw new Error(`Server error: ${error.response.status} - ${error.response.data?.detail || error.response.statusText}`);
    } else if (error.request) {
      // Request made but no response received
      throw new Error('No response from server. Check if the backend is running.');
    } else {
      // Something else happened
      throw new Error(`Request failed: ${error.message}`);
    }
  }
);

export async function getEvents() {
  try {
    const res = await api.get('/events/');
    return res.data;
  } catch (error) {
    console.error('Failed to fetch events:', error.message);
    throw error;
  }
}

export async function createEvent(event) {
  try {
    console.log('Creating event with data:', event);
    const res = await api.post('/events/', event);
    return res.data;
  } catch (error) {
    console.error('Failed to create event:', error.message);
    throw error;
  }
}

export async function updateEvent(id, event) {
  try {
    console.log('Updating event with data:', event);
    const res = await api.put(`/events/${id}`, event);
    return res.data;
  } catch (error) {
    console.error('Failed to update event:', error.message);
    throw error;
  }
}

export async function deleteEvent(id) {
  try {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  } catch (error) {
    console.error('Failed to delete event:', error.message);
    throw error;
  }
}

// Test connection function
export async function testConnection() {
  try {
    const res = await api.get('/');
    console.log('Backend connection successful:', res.data);
    return true;
  } catch (error) {
    console.error('Backend connection failed:', error.message);
    return false;
  }
}