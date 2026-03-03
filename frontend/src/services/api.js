const BASE_URL = 'http://localhost:8000/api';

// ─── Token helpers ───────────────────────────────
const getToken = () => localStorage.getItem('access_token');
const getRefresh = () => localStorage.getItem('refresh_token');

const setTokens = (access, refresh) => {
  localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
};

const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// ─── Core fetch wrapper ──────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && getRefresh()) {
    const refreshRes = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: getRefresh() }),
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setTokens(data.access, data.refresh);
      headers['Authorization'] = `Bearer ${data.access}`;
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    } else {
      clearTokens();
      window.location.href = '/login';
      return;
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

// ─── Auth ────────────────────────────────────────
export const authApi = {
  login: async (username, password) => {
    const data = await request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setTokens(data.access, data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  logout: async () => {
    try {
      await request('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: getRefresh() }),
      });
    } finally {
      clearTokens();
    }
  },

  getUser: () => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  },

  isAuthenticated: () => !!getToken(),
};

// ─── Dashboard ───────────────────────────────────
export const dashboardApi = {
  getStats: () => request('/dashboard/'),
};

// ─── Departments ─────────────────────────────────
export const departmentsApi = {
  list: (params = '') => request(`/departments/${params}`),
  get: (id) => request(`/departments/${id}/`),
  create: (data) => request('/departments/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/departments/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (id, data) => request(`/departments/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/departments/${id}/`, { method: 'DELETE' }),
};

// ─── Employees ───────────────────────────────────
export const employeesApi = {
  list: (params = '') => request(`/employees/${params}`),
  get: (id) => request(`/employees/${id}/`),
  create: (data) => request('/employees/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/employees/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (id, data) => request(`/employees/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/employees/${id}/`, { method: 'DELETE' }),
};

// ─── Payments ────────────────────────────────────
export const paymentsApi = {
  list: (params = '') => request(`/payments/${params}`),
  get: (id) => request(`/payments/${id}/`),
  create: (data) => request('/payments/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/payments/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (id, data) => request(`/payments/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/payments/${id}/`, { method: 'DELETE' }),
};

export { clearTokens };