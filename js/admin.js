document.addEventListener("DOMContentLoaded", async () => {
    const sections = document.querySelectorAll(".admin-section");
    const menuButtons = document.querySelectorAll(".admin-menu button");

    let currentUser = null;

    function showSection(sectionName) {
        sections.forEach((section) => {
            section.classList.toggle(
                "active",
                section.dataset.section === sectionName
            );
        });

        menuButtons.forEach((button) => {
            button.classList.toggle(
                "active",
                button.dataset.section === sectionName
            );
        });
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setMessage(element, message, type = "success") {
        if (!element) return;

        element.className = `admin-message ${type}`;
        element.textContent = message;
    }

    function formatDate(date) {
        if (!date) return "—";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return "—";
        }

        return parsed.toLocaleString("pt-BR");
    }

    function formatPrice(value) {
        const number = Number(value || 0) / 100;

        return number.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function normalizeList(data, key) {
        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.[key])) {
            return data[key];
        }

        return [];
    }

    function isAdmin(user) {
        return Boolean(
            user?.isAdmin ||
            user?.admin ||
            user?.role === "admin" ||
            user?.role === "owner" ||
            user?.user?.isAdmin ||
            user?.user?.role === "admin" ||
            user?.user?.role === "owner"
        );
    }

    async function loadUser() {
        try {
            currentUser = await API.me();

            const user =
                currentUser?.user ||
                currentUser;

            if (!isAdmin(currentUser) && !isAdmin(user)) {
                alert("Você não tem permissão para acessar esta área.");
                window.location.href = "dashboard.html";
                return false;
            }

            const adminRole =
                document.getElementById("adminRole");

            if (adminRole) {
                adminRole.textContent =
                    user?.role === "owner"
                        ? "Owner"
                        : "Administrador";
            }

            return true;

        } catch (error) {
            window.location.href = "login.html";
            return false;
        }
    }

    async function loadStats() {
        try {
            if (
                typeof API.getAdminStats !== "function"
            ) {
                return;
            }

            const data = await API.getAdminStats();

            const stats = data?.stats || data || {};

            const totalUsers =
                document.getElementById("totalUsers");

            const totalBots =
                document.getElementById("totalBots");

            const onlineBots =
                document.getElementById("onlineBots");

            const pendingPayments =
                document.getElementById("pendingPayments");

            if (totalUsers) {
                totalUsers.textContent =
                    stats.totalUsers ?? 0;
            }

            if (totalBots) {
                totalBots.textContent =
                    stats.totalBots ?? 0;
            }

            if (onlineBots) {
                onlineBots.textContent =
                    stats.onlineBots ?? 0;
            }

            if (pendingPayments) {
                pendingPayments.textContent =
                    stats.pendingPayments ?? 0;
            }

        } catch (error) {
            console.error(
                "Erro ao carregar estatísticas:",
                error
            );
        }
    }

    async function loadPayments() {
        const container =
            document.getElementById("adminPaymentsList");

        if (!container) return;

        if (
            typeof API.getAdminPayments !== "function"
        ) {
            container.innerHTML = `
                <div class="admin-empty">
                    <strong>Sistema de pagamentos</strong>
                    <span>
                        A área administrativa ainda não está conectada ao servidor.
                    </span>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="admin-empty">
                <strong>Carregando pagamentos...</strong>
                <span>Aguarde um momento.</span>
            </div>
        `;

        try {
            const data =
                await API.getAdminPayments();

            const payments =
                normalizeList(data, "payments");

            if (!payments.length) {
                container.innerHTML = `
                    <div class="admin-empty">
                        <strong>Nenhum pagamento</strong>
                        <span>
                            Não existem pagamentos registrados.
                        </span>
                    </div>
                `;
                return;
            }

            container.innerHTML = payments
                .map((payment) => {
                    const status =
                        String(
                            payment.status || "pending"
                        ).toLowerCase();

                    const userName =
                        payment.user?.name ||
                        payment.userName ||
                        payment.email ||
                        "Usuário";

                    const planName =
                        payment.plan?.name ||
                        payment.planName ||
                        "Plano";

                    return `
                        <div class="admin-list-item">
                            <div class="admin-list-info">
                                <strong>
                                    ${escapeHtml(planName)}
                                </strong>

                                <span>
                                    ${escapeHtml(userName)}
                                    • ${formatDate(payment.createdAt)}
                                </span>
                            </div>

                            <div class="admin-list-right">
                                <span class="admin-list-price">
                                    ${formatPrice(payment.amount)}
                                </span>

                                <span class="admin-status ${escapeHtml(status)}">
                                    ${escapeHtml(status)}
                                </span>

                                ${
                                    status === "pending"
                                        ? `
                                            <div class="admin-actions">
                                                <button
                                                    class="btn btn-primary"
                                                    data-payment-approve="${escapeHtml(payment.id)}"
                                                >
                                                    Aprovar
                                                </button>

                                                <button
                                                    class="btn btn-secondary"
                                                    data-payment-reject="${escapeHtml(payment.id)}"
                                                >
                                                    Recusar
                                                </button>
                                            </div>
                                        `
                                        : ""
                                }
                            </div>
                        </div>
                    `;
                })
                .join("");

            bindPaymentActions();

        } catch (error) {
            container.innerHTML = `
                <div class="admin-empty">
                    <strong>Não foi possível carregar</strong>
                    <span>
                        ${escapeHtml(error.message)}
                    </span>
                </div>
            `;
        }
    }

    function bindPaymentActions() {
        document
            .querySelectorAll("[data-payment-approve]")
            .forEach((button) => {
                button.addEventListener("click", async () => {
                    const id =
                        button.dataset.paymentApprove;

                    if (
                        typeof API.approvePayment !==
                        "function"
                    ) {
                        alert(
                            "A aprovação ainda não está conectada ao servidor."
                        );
                        return;
                    }

                    if (
                        !confirm(
                            "Deseja aprovar este pagamento?"
                        )
                    ) {
                        return;
                    }

                    button.disabled = true;

                    try {
                        await API.approvePayment(id);

                        await loadPayments();
                        await loadStats();

                    } catch (error) {
                        alert(
                            error.message ||
                            "Não foi possível aprovar o pagamento."
                        );

                        button.disabled = false;
                    }
                });
            });

        document
            .querySelectorAll("[data-payment-reject]")
            .forEach((button) => {
                button.addEventListener("click", async () => {
                    const id =
                        button.dataset.paymentReject;

                    if (
                        typeof API.rejectPayment !==
                        "function"
                    ) {
                        alert(
                            "A recusa ainda não está conectada ao servidor."
                        );
                        return;
                    }

                    if (
                        !confirm(
                            "Deseja recusar este pagamento?"
                        )
                    ) {
                        return;
                    }

                    button.disabled = true;

                    try {
                        await API.rejectPayment(id);

                        await loadPayments();
                        await loadStats();

                    } catch (error) {
                        alert(
                            error.message ||
                            "Não foi possível recusar o pagamento."
                        );

                        button.disabled = false;
                    }
                });
            });
    }

    async function loadUsers() {
        const container =
            document.getElementById("adminUsersList");

        if (!container) return;

        if (
            typeof API.getAdminUsers !== "function"
        ) {
            container.innerHTML = `
                <div class="admin-empty">
                    <strong>Gerenciamento de usuários</strong>
                    <span>
                        A área ainda não está conectada ao servidor.
                    </span>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="admin-empty">
                <strong>Carregando usuários...</strong>
                <span>Aguarde um momento.</span>
            </div>
        `;

        try {
            const data =
                await API.getAdminUsers();

            const users =
                normalizeList(data, "users");

            if (!users.length) {
                container.innerHTML = `
                    <div class="admin-empty">
                        <strong>Nenhum usuário</strong>
                        <span>
                            Não existem usuários para exibir.
                        </span>
                    </div>
                `;
                return;
            }

            renderUsers(users);

        } catch (error) {
            container.innerHTML = `
                <div class="admin-empty">
                    <strong>Erro ao carregar usuários</strong>
                    <span>
                        ${escapeHtml(error.message)}
                    </span>
                </div>
            `;
        }
    }

    function renderUsers(users) {
        const container =
            document.getElementById("adminUsersList");

        if (!container) return;

        container.innerHTML = users
            .map((user) => {
                return `
                    <div
                        class="admin-list-item"
                        data-user-item
                        data-search="${escapeHtml(
                            `${user.name || ""} ${user.email || ""}`
                        ).toLowerCase()}"
                    >
                        <div class="admin-list-info">
                            <strong>
                                ${escapeHtml(
                                    user.name ||
                                    "Usuário"
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    user.email || "Sem e-mail"
                                )}
                                • ${formatDate(
                                    user.createdAt
                                )}
                            </span>
                        </div>

                        <div class="admin-list-right">
                            <span class="admin-status">
                                ${escapeHtml(
                                    user.role ||
                                    "user"
                                )}
                            </span>
                        </div>
                    </div>
                `;
            })
            .join("");

        setupUserSearch();
    }

    function setupUserSearch() {
        const search =
            document.getElementById("userSearch");

        if (!search) return;

        search.addEventListener("input", () => {
            const query =
                search.value
                    .trim()
                    .toLowerCase();

            document
                .querySelectorAll("[data-user-item]")
                .forEach((item) => {
                    const text =
                        item.dataset.search || "";

                    item.style.display =
                        !query ||
                        text.includes(query)
                            ? ""
                            : "none";
                });
        });
    }

    async function sendAnnouncement(event) {
        event.preventDefault();

        const form =
            document.getElementById(
                "announcementForm"
            );

        const title =
            document.getElementById(
                "announcementTitle"
            )?.value.trim();

        const message =
            document.getElementById(
                "announcementMessage"
            )?.value.trim();

        const type =
            document.getElementById(
                "announcementType"
            )?.value;

        const status =
            document.getElementById(
                "announcementMessageStatus"
            );

        const button =
            document.getElementById(
                "announcementButton"
            );

        if (!title || !message) {
            setMessage(
                status,
                "Preencha o título e a mensagem.",
                "error"
            );
            return;
        }

        if (
            typeof API.createAnnouncement !==
            "function"
        ) {
            setMessage(
                status,
                "O sistema de anúncios ainda não está conectado ao servidor.",
                "error"
            );
            return;
        }

        button.disabled = true;
        button.textContent = "Enviando...";

        try {
            await API.createAnnouncement({
                title,
                message,
                type
            });

            form.reset();

            setMessage(
                status,
                "Anúncio enviado com sucesso.",
                "success"
            );

        } catch (error) {
            setMessage(
                status,
                error.message ||
                "Não foi possível enviar o anúncio.",
                "error"
            );

        } finally {
            button.disabled = false;
            button.textContent = "Publicar anúncio";
        }
    }

    async function savePixSettings(event) {
        event.preventDefault();

        const key =
            document.getElementById(
                "pixKeyInput"
            )?.value.trim();

        const receiver =
            document.getElementById(
                "pixReceiverInput"
            )?.value.trim();

        const bank =
            document.getElementById(
                "pixBankInput"
            )?.value.trim();

        const message =
            document.getElementById(
                "pixSettingsMessage"
            );

        if (
            typeof API.updatePixSettings !==
            "function"
        ) {
            setMessage(
                message,
                "As configurações PIX ainda não estão conectadas ao servidor.",
                "error"
            );
            return;
        }

        try {
            await API.updatePixSettings({
                pixKey: key,
                pixReceiverName: receiver,
                pixBank: bank
            });

            setMessage(
                message,
                "Configurações PIX salvas.",
                "success"
            );

        } catch (error) {
            setMessage(
                message,
                error.message ||
                "Não foi possível salvar as configurações.",
                "error"
            );
        }
    }

    async function loadAdminSettings() {
        if (
            typeof API.getAdminSettings !==
            "function"
        ) {
            return;
        }

        try {
            const data =
                await API.getAdminSettings();

            const settings =
                data?.settings || data || {};

            const pixKey =
                document.getElementById(
                    "pixKeyInput"
                );

            const receiver =
                document.getElementById(
                    "pixReceiverInput"
                );

            const bank =
                document.getElementById(
                    "pixBankInput"
                );

            const maintenance =
                document.getElementById(
                    "maintenanceMode"
                );

            const registration =
                document.getElementById(
                    "registrationEnabled"
                );

            if (pixKey) {
                pixKey.value =
                    settings.pixKey || "";
            }

            if (receiver) {
                receiver.value =
                    settings.pixReceiverName || "";
            }

            if (bank) {
                bank.value =
                    settings.pixBank || "";
            }

            if (maintenance) {
                maintenance.checked =
                    Boolean(
                        settings.maintenanceMode
                    );
            }

            if (registration) {
                registration.checked =
                    settings.registrationEnabled !==
                    false;
            }

        } catch (error) {
            console.error(
                "Erro ao carregar configurações:",
                error
            );
        }
    }

    async function updateSetting(
        setting,
        value
    ) {
        if (
            typeof API.updateAdminSetting !==
            "function"
        ) {
            alert(
                "Essa configuração ainda não está conectada ao servidor."
            );
            return;
        }

        try {
            await API.updateAdminSetting(
                setting,
                value
            );
        } catch (error) {
            alert(
                error.message ||
                "Não foi possível atualizar a configuração."
            );
        }
    }

    /* MENU */

    menuButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const section =
                button.dataset.section;

            showSection(section);

            if (section === "payments") {
                await loadPayments();
            }

            if (section === "users") {
                await loadUsers();
            }

            if (section === "settings") {
                await loadAdminSettings();
            }
        });
    });

    /* REFRESH PAYMENTS */

    const refreshPayments =
        document.getElementById(
            "refreshPayments"
        );

    if (refreshPayments) {
        refreshPayments.addEventListener(
            "click",
            loadPayments
        );
    }

    /* ANNOUNCEMENT */

    const announcementForm =
        document.getElementById(
            "announcementForm"
        );

    if (announcementForm) {
        announcementForm.addEventListener(
            "submit",
            sendAnnouncement
        );
    }

    /* PIX */

    const pixSettingsForm =
        document.getElementById(
            "pixSettingsForm"
        );

    if (pixSettingsForm) {
        pixSettingsForm.addEventListener(
            "submit",
            savePixSettings
        );
    }

    /* MAINTENANCE */

    const maintenanceMode =
        document.getElementById(
            "maintenanceMode"
        );

    if (maintenanceMode) {
        maintenanceMode.addEventListener(
            "change",
            () => {
                updateSetting(
                    "maintenanceMode",
                    maintenanceMode.checked
                );
            }
        );
    }

    /* REGISTRATION */

    const registrationEnabled =
        document.getElementById(
            "registrationEnabled"
        );

    if (registrationEnabled) {
        registrationEnabled.addEventListener(
            "change",
            () => {
                updateSetting(
                    "registrationEnabled",
                    registrationEnabled.checked
                );
            }
        );
    }

    /* LOGOUT */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            async () => {
                try {
                    await API.logout();
                } finally {
                    window.location.href =
                        "login.html";
                }
            }
        );
    }

    /* START */

    const authorized =
        await loadUser();

    if (!authorized) {
        return;
    }

    showSection("overview");

    await loadStats();
});
