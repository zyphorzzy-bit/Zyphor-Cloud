/* =========================================================
   ZYPHOR CLOUD — API
   ========================================================= */

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


/* =========================================================
   AUTH
   ========================================================= */

const API = {

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


    /* =====================================================
       PLANOS
       ===================================================== */

    getPlans() {
        return apiRequest("/plans", {
            method: "GET"
        });
    },


    /* =====================================================
       BOTS
       ===================================================== */

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


    /* =====================================================
       DEPLOY
       ===================================================== */

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


    /* =====================================================
       PAGAMENTOS
       ===================================================== */

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
    }

};


/* =========================================================
   EXPORTAÇÃO
   ========================================================= */

window.API = API;
