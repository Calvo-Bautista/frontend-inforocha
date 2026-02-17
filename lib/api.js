/**
 * API Service Layer
 * Centralized API client for all backend communication
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

/**
 * Get authentication token from localStorage
 */
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

/**
 * Set authentication token in localStorage
 */
const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

/**
 * Remove authentication token from localStorage
 */
const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

/**
 * Base fetch wrapper with authentication and error handling
 */
const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add authorization header if token exists
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      throw new Error('Session expired. Please login again.');
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle Pydantic validation errors
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errors = errorData.detail.map(err => {
          const field = err.loc ? err.loc.join('.') : 'unknown';
          return `${field}: ${err.msg}`;
        }).join(', ');
        throw new Error(`Validation error: ${errors}`);
      }

      // Handle detail as object
      if (errorData.detail && typeof errorData.detail === 'object' && !Array.isArray(errorData.detail)) {
        throw new Error(JSON.stringify(errorData.detail));
      }

      // Handle detail as string
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    // Attach total count if header exists (for pagination)
    const totalCount = response.headers.get('X-Total-Count');
    if (totalCount && Array.isArray(data)) {
      data.total = parseInt(totalCount, 10);
    }

    return data;
  } catch (error) {
    // console.error('API Error:', error); // Commented out to prevent Next.js overlay on validation errors
    throw error;
  }
};

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{access_token: string, token_type: string}>}
   */
  login: async (email, password) => {
    // OAuth2 password flow requires form data
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 uses 'username' field
    formData.append('password', password);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();
    setToken(data.access_token);
    return data;
  },

  /**
   * Get current user information
   * @returns {Promise<Object>} User data
   */
  getMe: async () => {
    return apiFetch('/auth/me');
  },

  /**
   * Logout - clear token
   */
  logout: () => {
    removeToken();
  },
};

/**
 * Products API
 */
export const productsAPI = {
  /**
   * Get all products with optional filters
   * @param {Object} params - Query parameters
   * @param {number} params.skip - Number of records to skip
   * @param {number} params.limit - Maximum number of records
   * @param {string} params.category - Filter by category
   * @param {string} params.search - Search term
   * @returns {Promise<Array>} List of products
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    return apiFetch(`/products/${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get single product by ID
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Product data
   */
  getById: async (id) => {
    return apiFetch(`/products/${id}`);
  },

  /**
   * Create new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  create: async (productData) => {
    return apiFetch('/products/', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  /**
   * Update product
   * @param {number} id - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} Updated product
   */
  update: async (id, productData) => {
    return apiFetch(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  /**
   * Delete product
   * @param {number} id - Product ID
   * @returns {Promise<null>}
   */
  delete: async (id) => {
    return apiFetch(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Download budget PDF
   * @param {Object} params - Query parameters matches getAll
   * @returns {Promise<Blob>} PDF blob
   */
  downloadBudget: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const token = getToken();

    const response = await fetch(`${API_URL}/products/budget/download?${queryString}`, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error downloading budget');
    }

    return response.blob();
  },

  /**
   * Import products from Excel
   * @param {FormData} formData - Form data with file
   * @returns {Promise<Object>} Import result
   */
  importProducts: async (formData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/products/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Content-Type not set to let browser handle multipart/form-data boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error importing products');
    }

    return await response.json();
  },
};

/**
 * Clients API
 */
export const clientsAPI = {
  /**
   * Get all clients with optional filters
   * @param {Object} params - Query parameters
   * @param {number} params.skip - Number of records to skip
   * @param {number} params.limit - Maximum number of records
   * @param {string} params.status - Filter by status
   * @param {string} params.search - Search term
   * @returns {Promise<Array>} List of clients
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status_filter', params.status);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    return apiFetch(`/clients/${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get single client by ID
   * @param {number} id - Client ID
   * @returns {Promise<Object>} Client data
   */
  getById: async (id) => {
    return apiFetch(`/clients/${id}`);
  },

  /**
   * Create new client
   * @param {Object} clientData - Client data
   * @returns {Promise<Object>} Created client
   */
  create: async (clientData) => {
    return apiFetch('/clients/', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  },

  /**
   * Update client
   * @param {number} id - Client ID
   * @param {Object} clientData - Updated client data
   * @returns {Promise<Object>} Updated client
   */
  update: async (id, clientData) => {
    return apiFetch(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  },

  /**
   * Delete client
   * @param {number} id - Client ID
   * @returns {Promise<null>}
   */
  delete: async (id) => {
    return apiFetch(`/clients/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Orders API
 */
export const ordersAPI = {
  /**
   * Get all orders with optional filters
   * @param {Object} params - Query parameters
   * @param {number} params.skip - Number of records to skip
   * @param {number} params.limit - Maximum number of records
   * @param {number} params.seller_id - Filter by seller ID
   * @param {string} params.status - Filter by status
   * @returns {Promise<Array>} List of orders
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.seller_id) queryParams.append('seller_id', params.seller_id);
    if (params.status) queryParams.append('status_filter', params.status);
    if (params.month) queryParams.append('month', params.month);
    if (params.year) queryParams.append('year', params.year);
    if (params.search) queryParams.append('search', params.search); // Also adding search here just in case it was missing in my read but likely handled

    const queryString = queryParams.toString();
    return apiFetch(`/orders/${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get order statistics
   * @param {Object} params - Query parameters matches getAll
   * @returns {Promise<Object>} Order statistics
   */
  getStats: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.month) queryParams.append('month', params.month);
    if (params.year) queryParams.append('year', params.year);

    const queryString = queryParams.toString();
    return apiFetch(`/orders/stats${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get single order by ID
   * @param {number} id - Order ID
   * @returns {Promise<Object>} Order data
   */
  getById: async (id) => {
    return apiFetch(`/orders/${id}`);
  },

  /**
   * Create new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Created order
   */
  create: async (orderData) => {
    return apiFetch('/orders/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  /**
   * Update order
   * @param {number} id - Order ID
   * @param {Object} orderData - Updated order data
   * @returns {Promise<Object>} Updated order
   */
  update: async (id, orderData) => {
    return apiFetch(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  },

  /**
   * Delete order
   * @param {number} id - Order ID
   * @returns {Promise<null>}
   */
  delete: async (id) => {
    return apiFetch(`/orders/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Download remito PDF
   * @param {number} id - Order ID
   * @returns {Promise<Blob>} PDF blob
   */
  downloadRemito: async (id) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/orders/${id}/remito`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error downloading remito');
    }

    return response.blob();
  },
};



/**
 * Users API
 */
export const usersAPI = {
  /**
   * Get all users with optional filters
   * @param {Object} params - Query parameters
   * @param {number} params.skip - Number of records to skip
   * @param {number} params.limit - Maximum number of records
   * @param {string} params.role - Filter by role
   * @param {string} params.search - Search term
   * @returns {Promise<Array>} List of users
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.role) queryParams.append('role_filter', params.role);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    return apiFetch(`/users/${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get single user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object>} User data
   */
  getById: async (id) => {
    return apiFetch(`/users/${id}`);
  },

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  create: async (userData) => {
    return apiFetch('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  update: async (id, userData) => {
    return apiFetch(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<null>}
   */
  delete: async (id) => {
    return apiFetch(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Set user on leave
   * @param {number} id - User ID
   * @param {number} substituteId - Substitute User ID
   * @returns {Promise<Object>} Updated user
   */
  setLeave: async (id, substituteId) => {
    return apiFetch(`/users/${id}/leave?substitute_id=${substituteId}`, {
      method: 'PATCH',
    });
  },

  /**
   * Return from leave
   * @param {number} id - User ID
   * @returns {Promise<Object>} Updated user
   */
  returnFromLeave: async (id) => {
    return apiFetch(`/users/${id}/return`, {
      method: 'PATCH',
    });
  },

  /**
   * Change user password
   * @param {number} id - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<null>}
   */
  changePassword: async (id, newPassword) => {
    return apiFetch(`/users/${id}/password?new_password=${encodeURIComponent(newPassword)}`, {
      method: 'PUT',
    });
  },
};

/**
 * Configuration API
 */
export const configAPI = {
  /**
   * Get system configuration
   * @returns {Promise<Object>} System config
   */
  get: async () => {
    return apiFetch('/config/');
  },

  /**
   * Update system configuration
   * @param {Object} configData - Updated config
   * @returns {Promise<Object>} Updated config
   */
  update: async (configData) => {
    return apiFetch('/config/', {
      method: 'PUT',
      body: JSON.stringify(configData),
    });
  },
};

// Export all APIs
export default {
  auth: authAPI,
  products: productsAPI,
  clients: clientsAPI,
  orders: ordersAPI,

  users: usersAPI,
  config: configAPI,
};
