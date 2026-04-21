import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for logging (dev)
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API] Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============ User API ============

export interface UserData {
  name: string;
  email: string;
  role: 'need-help' | 'can-help' | 'both';
  skills: string[];
  location?: string;
}

export const userAPI = {
  onboard: async (data: UserData) => {
    const response = await api.post('/users/onboard', data);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getByEmail: async (email: string) => {
    const response = await api.get(`/users/email/${email}`);
    return response.data;
  },

  updateTrustScore: async (userId: string, scoreChange: number) => {
    const response = await api.patch('/users/trust-score', { userId, scoreChange });
    return response.data;
  },
};

// ============ Help Request API ============

export interface HelpRequestData {
  title: string;
  description: string;
  tags?: string[];
  category?: string;
  urgency?: 'low' | 'medium' | 'high';
  status?: 'open' | 'solved';
  createdBy: string;
}

export const helpRequestAPI = {
  create: async (data: HelpRequestData) => {
    const response = await api.post('/help-requests', data);
    return response.data;
  },

  getAll: async (filters?: {
    status?: string;
    category?: string;
    urgency?: string;
    createdBy?: string;
  }) => {
    const response = await api.get('/help-requests', { params: filters });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/help-requests/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: 'open' | 'solved') => {
    const response = await api.patch(`/help-requests/${id}/status`, { status });
    return response.data;
  },

  assignHelper: async (id: string, helperId: string) => {
    const response = await api.patch(`/help-requests/${id}/assign`, { helperId });
    return response.data;
  },

  // AI Analysis endpoint (calls backend AI detection)
  analyzeRequest: async (description: string) => {
    const response = await api.post('/help-requests/analyze', { description });
    return response.data;
  },
};

// ============ Leaderboard API ============

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    skills: string[];
  };
  stats: {
    trustScore: number;
    solvedRequests: number;
    activeRequests: number;
  };
}

export const leaderboardAPI = {
  get: async (limit: number = 10, role?: string) => {
    const response = await api.get('/leaderboard', { params: { limit, role } });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/leaderboard/stats');
    return response.data;
  },
};

// ============ Message API ============

export interface MessageData {
  senderId: string;
  recipientId: string;
  content: string;
  requestId?: string;
}

export interface Conversation {
  contact: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    isFromMe: boolean;
    isRead: boolean;
  };
  unreadCount: number;
}

export const messageAPI = {
  getConversations: async (userId: string) => {
    const response = await api.get(`/messages/conversations/${userId}`);
    return response.data;
  },

  getMessages: async (userId: string, contactId: string) => {
    const response = await api.get(`/messages/${userId}/${contactId}`);
    return response.data;
  },

  send: async (data: MessageData) => {
    const response = await api.post('/messages', data);
    return response.data;
  },

  markAsRead: async (userId: string, contactId: string) => {
    const response = await api.patch(`/messages/read/${userId}/${contactId}`);
    return response.data;
  },

  delete: async (messageId: string, userId: string) => {
    const response = await api.delete(`/messages/${messageId}`, {
      data: { userId },
    });
    return response.data;
  },

  getAllUsers: async (userId: string) => {
    const response = await api.get(`/messages/users/${userId}`);
    return response.data;
  },
};

export default api;
