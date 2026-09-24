document.addEventListener("DOMContentLoaded", async () => {
    const userName = document.getElementById("userName");
    const welcomeName = document.getElementById("welcomeName");
    const botsCount = document.getElementById("botsCount");
    const onlineCount = document.getElementById("onlineCount");
    const planName = document.getElementById("planName");
    const resourcePlanName = document.getElementById("resourcePlanName");
    const dashboardBots = document.getElementById("dashboardBots");
    const logoutButton = document.getElementById("logoutButton");

    // =========================
    // CARREGAR CONTA
    // =========================

    try {
        const user = await API.me();

        const name =
            user?.name ||
            user?.user?.name ||
            user?.email ||
            "Usuário";

        if (userName) {
            userName.textContent = name;
        }

        if (welcomeName) {
            welcomeName.textContent = name;
        }

        const plan =
            user?.plan?.name ||
            user?.subscription?.plan?.name ||
            "Free";

        if (planName) {
            planName.textContent = plan;
        }

        if (resourcePlanName) {
            resourcePlanName.textContent = plan;
        }

    } catch (error) {
        console.error("Erro ao carregar usuário:", error);

        // Se a sessão não existir, volta para o login.
        window.location.href = "login.html";
        return;
    }


    // =========================
    // CARREGAR BOTS
    // =========================

    try {
        const response = await API.getBots();

        const bots =
            Array.isArray(response)
                ? response
                : response?.bots || [];

        if (botsCount) {
            botsCount.textContent = bots.length;
        }

        const onlineBots = bots.filter((bot) => {
            const status = String(
                bot.status || ""
            ).toLowerCase();

            return (
                status === "online" ||
                status === "running" ||
                status === "active"
            );
        });

        if (onlineCount) {
            onlineCount.textContent = onlineBots.length;
        }

        renderBots(bots);

    } catch (error) {
        console.error("Erro ao carregar bots:", error);

        if (dashboardBots) {
            dashboardBots.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">!</div>

                    <h3>
                        Não foi possível carregar os bots
                    </h3>

                    <p>
                        Tente atualizar a página novamente.
                    </p>
                </div>
            `;
        }
    }


    // =========================
    // LOGOUT
    // =========================

    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {

            logoutButton.disabled = true;
            logoutButton.textContent = "Saindo...";

            try {
                await API.logout();

                window.location.href = "login.html";

            } catch (error) {
                console.error("Erro ao sair:", error);

                logoutButton.disabled = false;
                logoutButton.textContent = "Sair";
            }
        });
    }


    // =========================
    // RENDERIZAR BOTS
    // =========================

    function renderBots(bots) {

        if (!dashboardBots) return;

        if (!bots.length) {
            dashboardBots.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">+</div>

                    <h3>
                        Nenhum bot ainda
                    </h3>

                    <p>
                        Crie seu primeiro bot para começar.
                    </p>

                    <a
                        href="criar-bot.html"
                        class="btn btn-primary"
                    >
                        Criar primeiro bot
                    </a>
                </div>
            `;

            return;
        }

        const visibleBots = bots.slice(0, 4);

        dashboardBots.innerHTML = visibleBots
            .map((bot) => {

                const status =
                    String(
                        bot.status || "offline"
                    ).toLowerCase();

                const isOnline =
                    status === "online" ||
                    status === "running" ||
                    status === "active";

                return `
                    <a
                        href="bot.html?id=${encodeURIComponent(bot.id)}"
                        class="card dashboard-bot-card"
                    >

                        <div class="bot-card-top">

                            <div>
                                <span class="bot-card-label">
                                    BOT
                                </span>

                                <h3>
                                    ${escapeHtml(
                                        bot.name ||
                                        bot.label ||
                                        "Bot sem nome"
                                    )}
                                </h3>
                            </div>

                            <span class="status-badge ${
                                isOnline
                                    ? "status-online"
                                    : "status-offline"
                            }">
                                ${isOnline ? "Online" : "Offline"}
                            </span>

                        </div>

                        <div class="bot-card-info">

                            <span>
                                ${
                                    escapeHtml(
                                        bot.runtime ||
                                        bot.language ||
                                        "Projeto"
                                    )
                                }
                            </span>

                            <span>
                                ${escapeHtml(
                                    bot.id || ""
                                )}
                            </span>

                        </div>

                    </a>
                `;
            })
            .join("");
    }


    // =========================
    // SEGURANÇA HTML
    // =========================

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
