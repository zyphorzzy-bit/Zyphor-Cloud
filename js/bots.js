document.addEventListener("DOMContentLoaded", async () => {
    const userName = document.getElementById("userName");
    const logoutButton = document.getElementById("logoutButton");
    const botsList = document.getElementById("botsList");
    const botSearch = document.getElementById("botSearch");
    const statusFilter = document.getElementById("statusFilter");

    let bots = [];

    // =========================
    // USUÁRIO
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

    } catch (error) {
        console.error(error);
        window.location.href = "login.html";
        return;
    }


    // =========================
    // BOTS
    // =========================

    try {
        const response = await API.getBots();

        bots = Array.isArray(response)
            ? response
            : response?.bots || [];

        renderBots();

    } catch (error) {
        console.error("Erro ao carregar bots:", error);

        botsList.innerHTML = `
            <div class="bots-empty">
                <div class="empty-state">
                    <div class="empty-icon">!</div>

                    <h3>
                        Erro ao carregar os bots
                    </h3>

                    <p>
                        Não foi possível obter seus bots.
                    </p>

                    <button
                        id="retryBots"
                        class="btn btn-primary"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        `;

        document
            .getElementById("retryBots")
            ?.addEventListener("click", () => {
                window.location.reload();
            });
    }


    // =========================
    // PESQUISA
    // =========================

    botSearch?.addEventListener("input", renderBots);

    statusFilter?.addEventListener("change", renderBots);


    // =========================
    // LOGOUT
    // =========================

    logoutButton?.addEventListener("click", async () => {

        logoutButton.disabled = true;
        logoutButton.textContent = "Saindo...";

        try {
            await API.logout();
            window.location.href = "login.html";

        } catch (error) {
            console.error(error);

            logoutButton.disabled = false;
            logoutButton.textContent = "Sair";
        }
    });


    // =========================
    // RENDER
    // =========================

    function renderBots() {

        const search =
            botSearch?.value
                .trim()
                .toLowerCase() || "";

        const filter =
            statusFilter?.value || "all";


        const filteredBots = bots.filter((bot) => {

            const name = String(
                bot.name ||
                bot.label ||
                ""
            ).toLowerCase();

            const id = String(
                bot.id || ""
            ).toLowerCase();

            const status = getStatus(bot);

            const matchesSearch =
                !search ||
                name.includes(search) ||
                id.includes(search);

            const matchesFilter =
                filter === "all" ||
                status === filter;

            return matchesSearch && matchesFilter;
        });


        if (!filteredBots.length) {

            botsList.innerHTML = `
                <div class="bots-empty">
                    <div class="empty-state">

                        <div class="empty-icon">
                            +
                        </div>

                        <h3>
                            ${
                                bots.length
                                    ? "Nenhum bot encontrado"
                                    : "Nenhum bot ainda"
                            }
                        </h3>

                        <p>
                            ${
                                bots.length
                                    ? "Tente alterar sua pesquisa ou filtro."
                                    : "Crie seu primeiro bot para começar."
                            }
                        </p>

                        ${
                            bots.length
                                ? ""
                                : `
                                    <a
                                        href="criar-bot.html"
                                        class="btn btn-primary"
                                    >
                                        Criar bot
                                    </a>
                                `
                        }

                    </div>
                </div>
            `;

            return;
        }


        botsList.innerHTML = filteredBots
            .map((bot) => createBotCard(bot))
            .join("");
    }


    // =========================
    // CARD
    // =========================

    function createBotCard(bot) {

        const status = getStatus(bot);

        const isOnline =
            status === "online";

        const name = escapeHtml(
            bot.name ||
            bot.label ||
            "Bot sem nome"
        );

        const description =
            bot.description
                ? escapeHtml(bot.description)
                : "Projeto hospedado no Zyphor Cloud.";

        const runtime = escapeHtml(
            bot.runtime ||
            bot.language ||
            "Projeto"
        );

        const id = escapeHtml(
            bot.id || ""
        );

        return `
            <a
                href="bot.html?id=${encodeURIComponent(bot.id || "")}"
                class="bot-card card"
            >

                <div class="bot-card-top">

                    <div>

                        <span class="bot-card-label">
                            BOT
                        </span>

                        <h3>
                            ${name}
                        </h3>

                    </div>

                    <span class="status-badge ${
                        isOnline
                            ? "status-online"
                            : "status-offline"
                    }">
                        ${
                            isOnline
                                ? "Online"
                                : "Offline"
                        }
                    </span>

                </div>


                <p class="bot-card-description">
                    ${description}
                </p>


                <div class="bot-card-info">

                    <span>
                        ${runtime}
                    </span>

                    <span>
                        ${id}
                    </span>

                </div>

            </a>
        `;
    }


    // =========================
    // STATUS
    // =========================

    function getStatus(bot) {

        const status = String(
            bot.status || "offline"
        ).toLowerCase();

        if (
            status === "online" ||
            status === "running" ||
            status === "active"
        ) {
            return "online";
        }

        return "offline";
    }


    // =========================
    // SEGURANÇA
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
