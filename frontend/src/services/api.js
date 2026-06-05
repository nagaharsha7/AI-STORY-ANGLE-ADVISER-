import axios from 'axios';

// Create central API client
// Note: Since we configured a proxy in vite.config.js for '/api', we use relative URLs in development.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Configure client API calls
export const generateStoryInsights = async (storyText, editorEmail) => {
  const response = await api.post('/api/generate', {
    story: storyText,
    editor: editorEmail
  });
  return response.data;
};

export const getHistoryLogs = async (search = '', category = '') => {
  const params = {};
  if (search) params.search = search;
  if (category) params.category = category;
  
  const response = await api.get('/api/history', { params });
  return response.data;
};

export const getHistoryRecordById = async (id) => {
  const response = await api.get(`/api/history/${id}`);
  return response.data;
};

export const submitStoryFeedback = async (historyId, rating, comment) => {
  const response = await api.post('/api/feedback', {
    historyId,
    rating,
    comment
  });
  return response.data;
};

export const getAnalyticsStats = async () => {
  const response = await api.get('/api/analytics');
  return response.data;
};

export default api;
