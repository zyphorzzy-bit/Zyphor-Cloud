const API_BASE_URL = "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const message =
            data?.message ||
            data?.error ||
            `Erro HTTP ${response.status}`;

        throw new Error(message);
    }

    return data;
}

const API = {

    /* =========================
       AUTH
    ========================= */

    register(data) {
        return apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    login(data) {
        return apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    me() {
        return apiRequest("/auth/me", {
            method: "GET"
        });
    },

    logout() {
        return apiRequest("/auth/logout", {
            method: "POST"
        });
    },


    /* =========================
       PLANS
    ========================= */

    getPlans() {
        return apiRequest("/plans", {
            method: "GET"
        });
    },


    /* =========================
       BOTS
    ========================= */

    getBots() {
        return apiRequest("/bots", {
            method: "GET"
        });
    },

    getBot(id) {
        return apiRequest(`/bots/${id}`, {
            method: "GET"
        });
    },

    createBot(data) {
        return apiRequest("/bots", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    deleteBot(id) {
        return apiRequest(`/bots/${id}`, {
            method: "DELETE"
        });
    },

    deployBot(id) {
        return apiRequest(`/bots/${id}/deploy`, {
            method: "POST"
        });
    },

    startBot(id) {
        return apiRequest(`/bots/${id}/start`, {
            method: "POST"
        });
    },

    stopBot(id) {
        return apiRequest(`/bots/${id}/stop`, {
            method: "POST"
        });
    },

    restartBot(id) {
        return apiRequest(`/bots/${id}/restart`, {
            method: "POST"
        });
    },


    /* =========================
       PAYMENTS
    ========================= */

    getPayments() {
        return apiRequest("/payments", {
            method: "GET"
        });
    },

    createPayment(data) {
        return apiRequest("/payments", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    sendPaymentProof(id, data) {
        return apiRequest(`/payments/${id}/proof`, {
            method: "POST",
            body: JSON.stringify(data)
        });
    },


    /* =========================
       ACCOUNT
    ========================= */

    updateAccount(data) {
        return apiRequest("/account", {
            method: "PATCH",
            body: JSON.stringify(data)
        });
    },

    deleteAccount() {
        return apiRequest("/account", {
            method: "DELETE"
        });
    },


    /* =========================
       PASSWORD
    ========================= */

    requestPasswordReset(email) {
        return apiRequest("/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({
                email
            })
        });
    },

    resetPassword(data) {
        return apiRequest("/auth/reset-password", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    changePassword(data) {
        return apiRequest("/account/password", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },


    /* =========================
       SUPPORT / TICKETS
    ========================= */

    getTickets() {
        return apiRequest("/tickets", {
            method: "GET"
        });
    },

    getTicket(id) {
        return apiRequest(`/tickets/${id}`, {
            method: "GET"
        });
    },

    createTicket(data) {
        return apiRequest("/tickets", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    replyTicket(id, data) {
        return apiRequest(`/tickets/${id}/messages`, {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    closeTicket(id) {
        return apiRequest(`/tickets/${id}/close`, {
            method: "POST"
        });
    },


    /* =========================
       ADMIN
    ========================= */

    getAdminStats() {
        return apiRequest("/admin/stats", {
            method: "GET"
        });
    },

    getAdminPayments() {
        return apiRequest("/admin/payments", {
            method: "GET"
        });
    },

    approvePayment(id) {
        return apiRequest(`/admin/payments/${id}/approve`, {
            method: "POST"
        });
    },

    rejectPayment(id, reason = "") {
        return apiRequest(`/admin/payments/${id}/reject`, {
            method: "POST",
            body: JSON.stringify({
                reason
            })
        });
    },

    getAdminUsers() {
        return apiRequest("/admin/users", {
            method: "GET"
        });
    },

    getAdminUser(id) {
        return apiRequest(`/admin/users/${id}`, {
            method: "GET"
        });
    },

    updateAdminUser(id, data) {
        return apiRequest(`/admin/users/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data)
        });
    },

    deleteAdminUser(id) {
        return apiRequest(`/admin/users/${id}`, {
            method: "DELETE"
        });
    },


    /* =========================
       ANNOUNCEMENTS
    ========================= */

    getAnnouncements() {
        return apiRequest("/announcements", {
            method: "GET"
        });
    },

    createAnnouncement(data) {
        return apiRequest("/admin/announcements", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    updateAnnouncement(id, data) {
        return apiRequest(`/admin/announcements/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data)
        });
    },

    deleteAnnouncement(id) {
        return apiRequest(`/admin/announcements/${id}`, {
            method: "DELETE"
        });
    },


    /* =========================
       PIX
    ========================= */

    getPixSettings() {
        return apiRequest("/payments/pix", {
            method: "GET"
        });
    },

    getAdminPixSettings() {
        return apiRequest("/admin/settings/pix", {
            method: "GET"
        });
    },

    updatePixSettings(data) {
        return apiRequest("/admin/settings/pix", {
            method: "PATCH",
            body: JSON.stringify(data)
        });
    },


    /* =========================
       ADMIN SETTINGS
    ========================= */

    getAdminSettings() {
        return apiRequest("/admin/settings", {
            method: "GET"
        });
    },

    updateAdminSetting(setting, value) {
        return apiRequest("/admin/settings", {
            method: "PATCH",
            body: JSON.stringify({
                setting,
                value
            })
        });
    },


    /* =========================
       HEALTH
    ========================= */

    health() {
        return apiRequest("/health", {
            method: "GET"
        });
    }
};

window.API = API;   
