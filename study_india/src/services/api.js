const API_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const config = {
        headers: {
            ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...options,
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
}

// ==================== Auth APIs ====================
export const authAPI = {
    login: (email, password) =>
        apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (name, email, password) =>
        apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        }),

    getMe: () => apiCall('/auth/me'),

    changePassword: (currentPassword, newPassword) =>
        apiCall('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword }),
        }),
};

// ==================== Universities APIs ====================
export const universitiesAPI = {
    getAll: () => apiCall('/universities'),

    getById: (id) => apiCall(`/universities/${id}`),

    create: (data) =>
        apiCall('/universities', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id, data) =>
        apiCall(`/universities/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id) =>
        apiCall(`/universities/${id}`, { method: 'DELETE' }),
};

// ==================== Applications APIs ====================
export const applicationsAPI = {
    submit: (formData) =>
        apiCall('/applications', {
            method: 'POST',
            body: formData,
        }),

    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/applications?${query}`);
    },

    getById: (id) => apiCall(`/applications/${id}`),

    update: (id, data) =>
        apiCall(`/applications/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    updateStatus: (id, status, notes) =>
        apiCall(`/applications/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, notes }),
        }),

    uploadDocuments: (id, formData) =>
        apiCall(`/applications/${id}/documents`, {
            method: 'POST',
            body: formData,
        }),

    verifyDocument: (id, documentId, status, rejectionReason) =>
        apiCall(`/applications/${id}/documents`, {
            method: 'PUT',
            body: JSON.stringify({ documentId, status, rejectionReason }),
        }),
};

// ==================== Payments APIs ====================
export const paymentsAPI = {
    create: (paymentData) =>
        apiCall('/payments', {
            method: 'POST',
            body: JSON.stringify(paymentData),
        }),

    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/payments?${query}`);
    },

    getById: (id) => apiCall(`/payments/${id}`),

    updateStatus: (id, status, notes) =>
        apiCall(`/payments/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status, notes }),
        }),
};

// ==================== Dashboard APIs ====================
export const dashboardAPI = {
    getStats: () => apiCall('/dashboard/stats'),

    getReports: (period = '6months') =>
        apiCall(`/dashboard/reports?period=${period}`),
};

// ==================== Users APIs (Admin) ====================
export const usersAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/users?${query}`);
    },

    getById: (id) => apiCall(`/users/${id}`),

    create: (userData) =>
        apiCall('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),

    update: (id, userData) =>
        apiCall(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        }),

    delete: (id) =>
        apiCall(`/users/${id}`, { method: 'DELETE' }),
};

// ==================== Notifications APIs ====================
export const notificationsAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/notifications?${query}`);
    },

    markAsRead: (notificationIds) =>
        apiCall('/notifications', {
            method: 'PUT',
            body: JSON.stringify({ notificationIds }),
        }),

    markAllAsRead: () =>
        apiCall('/notifications', {
            method: 'PUT',
            body: JSON.stringify({ markAll: true }),
        }),

    delete: (notificationIds) =>
        apiCall('/notifications', {
            method: 'DELETE',
            body: JSON.stringify({ notificationIds }),
        }),

    clearAll: () =>
        apiCall('/notifications', {
            method: 'DELETE',
            body: JSON.stringify({ clearAll: true }),
        }),
};


// ==================== Visa APIs ====================
export const visaAPI = {
    // ===== USER ENDPOINTS =====

    // Get current user's visa application with all steps
    getMyVisa: () => apiCall('/visa'),

    // Start new visa application (creates steps from templates)
    startApplication: () =>
        apiCall('/visa', { method: 'POST' }),

    // Get visa step templates (public - shows required docs per step)
    getTemplates: () => apiCall('/visa/templates'),

    // User submits a step for admin review (with file uploads)
    submitStep: (stepId, formData) =>
        apiCall(`/visa/steps/${stepId}`, {
            method: 'PUT',
            body: formData, // FormData with documents
        }),

    // Get specific step details
    getStepDetail: (stepId) =>
        apiCall(`/visa/steps/${stepId}`),

    // ===== ADMIN ENDPOINTS =====

    // Admin: Get all visa applications (with user info and steps)
    getAllApplications: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/visa/admin/applications?${query}`);
    },

    // Admin: Get single application detail
    getApplicationDetail: (appId) =>
        apiCall(`/visa/admin/applications/${appId}`),

    // Admin: Delete entire visa application
    deleteApplication: (appId) =>
        apiCall(`/visa/admin/applications/${appId}`, { method: 'DELETE' }),

    // Admin: Approve or reject a step
    reviewStep: (stepId, action, notes, reason, rejectDocuments = true) =>
        apiCall(`/visa/steps/${stepId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                action,           // 'approve' or 'reject'
                notes,            // optional admin notes
                reason,           // required if action is 'reject'
                rejectDocuments,  // also reject documents in this step
            }),
        }),

    // Admin: CRUD for step templates

    // Get all templates (including inactive)
    getAllTemplates: () =>
        apiCall('/visa/templates/all'),

    // Create new step template
    createTemplate: (data) =>
        apiCall('/visa/templates', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // Update step template
    updateTemplate: (id, data) =>
        apiCall(`/visa/templates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    // Delete/deactivate step template
    deleteTemplate: (id) =>
        apiCall(`/visa/templates/${id}`, { method: 'DELETE' }),

    // Reactivate a deleted template
    reactivateTemplate: (id) =>
        apiCall(`/visa/templates/${id}/reactivate`, { method: 'PATCH' }),

    // ===== STATS ENDPOINTS =====

    // Admin: Get visa application statistics
    getStats: () =>
        apiCall('/visa/admin/stats'),
};


// ==================== File Upload API ====================
export const uploadAPI = {
    uploadFile: (formData) =>
        apiCall('/documents/upload', {
            method: 'POST',
            body: formData,
        }),

    uploadMultiple: (formData) =>
        apiCall('/documents/upload-multiple', {
            method: 'POST',
            body: formData,
        }),
};

// ==================== Paystack Payment APIs ====================
export const paystackAPI = {
    // Initialize payment
    initialize: (data) =>
        apiCall('/payments/paystack/initialize', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // Verify payment by reference
    verify: (reference) =>
        apiCall(`/payments/paystack/verify/${reference}`),

    // Get payment history for user
    getHistory: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/payments/paystack/history?${query}`);
    },
};

// ==================== Settings API ====================
export const settingsAPI = {
    get: () => apiCall('/settings'),

    update: (data) =>
        apiCall('/settings', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};

export default {
    auth: authAPI,
    universities: universitiesAPI,
    applications: applicationsAPI,
    payments: paymentsAPI,
    paystack: paystackAPI, 
    dashboard: dashboardAPI,
    users: usersAPI,
    notifications: notificationsAPI,
    visa: visaAPI,
    upload: uploadAPI,
    settings: settingsAPI,
};