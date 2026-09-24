document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const botId = params.get("id");

    const userName = document.getElementById("userName");
    const logoutButton = document.getElementById("logoutButton");

    const botName = document.getElementById("botName");
    const botDescription = document.getElementById("botDescription");
    const botStatus = document.getElementById("botStatus");

    const infoName = document.getElementById("infoName");
    const infoLanguage = document.getElementById("infoLanguage");
    const infoRuntime = document.getElementById("infoRuntime");
    const infoId = document.getElementById("infoId");

    const startButton = document.getElementById("startBot");
    const stopButton = document.getElementById("stopBot");
    const restartButton = document.getElementById("restartBot");
    const deployButton = document.getElementById("deployBot");
    const deleteButton = document.getElementById("deleteBot");

    const consoleOutput = document.getElementById("consoleOutput");
    const consoleStatus = document.getElementById("consoleStatus");

    if (!botId) {
        window.location.href = "bots.html";
        return;
    }


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
    // CARREGAR BOT
    // =========================

    let bot;

    try {
        const response = await API.getBot(botId);

        bot = response?.bot || response;

        if (!bot) {
            throw new Error("Bot não encontrado.");
        }

        renderBot(bot);

    } catch (error) {
        console.error("Erro ao carregar bot:", error);

        if (botName) {
            botName.textContent = "Bot não encontrado";
        }

        if (botDescription) {
            botDescription.textContent =
                error.message ||
                "Não foi possível carregar este bot.";
        }

        disableControls();
        return;
    }


    // =========================
    // INICIAR
    // =========================

    startButton?.addEventListener("click", async () => {
        await botAction(
            startButton,
            "Iniciando...",
            "Iniciar",
            async () => API.startBot(botId)
        );
    });


    // =========================
    // PARAR
    // =========================

    stopButton?.addEventListener("click", async () => {
        await botAction(
            stopButton,
            "Parando...",
            "Parar",
            async () => API.stopBot(botId)
        );
    });


    // =========================
    // REINICIAR
    // =========================

    restartButton?.addEventListener("click", async () => {
        await botAction(
            restartButton,
            "Reiniciando...",
            "Reiniciar",
            async () => API.restartBot(botId)
        );
    });


    // =========================
    // DEPLOY
    // =========================

    deployButton?.addEventListener("click", async () => {
        await botAction(
            deployButton,
            "Enviando...",
            "Deploy",
            async () => API.deployBot(botId)
        );
    });


    // =========================
    // EXCLUIR
    // =========================

    deleteButton?.addEventListener("click", async () => {

        const confirmed = confirm(
            "Tem certeza que deseja excluir este bot? Essa ação não pode ser desfeita."
        );

        if (!confirmed) {
            return;
        }

        deleteButton.disabled = true;
        deleteButton.textContent = "Excluindo...";

        try {
            await API.deleteBot(botId);

            window.location.href = "bots.html";

        } catch (error) {
            console.error(error);

            alert(
                error.message ||
                "Não foi possível excluir o bot."
            );

            deleteButton.disabled = false;
            deleteButton.textContent = "Excluir bot";
        }
    });


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
    // AÇÕES
    // =========================

    async function botAction(
        button,
        loadingText,
        normalText,
        action
    ) {
        button.disabled = true;
        button.textContent = loadingText;

        setConsoleStatus("Processando...");

        try {
            const response = await action();

            const updatedBot =
                response?.bot ||
                response;

            if (
                updatedBot &&
                typeof updatedBot === "object"
            ) {
                bot = {
                    ...bot,
                    ...updatedBot
                };

                renderBot(bot);
            }

            addConsoleLine(
                `Ação executada: ${normalText}`
            );

            setConsoleStatus("Concluído");

        } catch (error) {
            console.error(error);

            addConsoleLine(
                `Erro: ${error.message || "Falha na operação"}`
            );

            setConsoleStatus("Erro");

            alert(
                error.message ||
                `Não foi possível executar: ${normalText}.`
            );

        } finally {
            button.disabled = false;
            button.textContent = normalText;
        }
    }


    // =========================
    // RENDER BOT
    // =========================

    function renderBot(data) {

        const name =
            data.name ||
            data.label ||
            "Bot sem nome";

        const description =
            data.description ||
            "Projeto hospedado no Zyphor Cloud.";

        const language =
            data.language ||
            data.runtime ||
            "—";

        const runtime =
            data.runtime ||
            data.language ||
            "—";

        const id =
            data.id ||
            botId;

        const status =
            getStatus(data);


        if (botName) {
            botName.textContent = name;
        }

        if (botDescription) {
            botDescription.textContent = description;
        }

        if (infoName) {
            infoName.textContent = name;
        }

        if (infoLanguage) {
            infoLanguage.textContent = language;
        }

        if (infoRuntime) {
            infoRuntime.textContent = runtime;
        }

        if (infoId) {
            infoId.textContent = id;
        }


        if (botStatus) {

            botStatus.className =
                `status-badge ${
                    status === "online"
                        ? "status-online"
                        : "status-offline"
                }`;

            botStatus.textContent =
                status === "online"
                    ? "Online"
                    : "Offline";
        }


        updateResources(data);
    }


    // =========================
    // RECURSOS
    // =========================

    function updateResources(data) {

        const ram =
            Number(
                data.ramUsage ||
                data.memoryUsage ||
                0
            );

        const ramLimit =
            Number(
                data.ramLimit ||
                512
            );

        const cpu =
            Number(
                data.cpuUsage ||
                0
            );

        const cpuLimit =
            Number(
                data.cpuLimit ||
                100
            );

        const storage =
            Number(
                data.storageUsage ||
                0
            );

        const storageLimit =
            Number(
                data.storageLimit ||
                1024
            );


        const ramPercentage =
            Math.min(
                100,
                (ram / ramLimit) * 100
            );

        const cpuPercentage =
            Math.min(
                100,
                (cpu / cpuLimit) * 100
            );

        const storagePercentage =
            Math.min(
                100,
                (storage / storageLimit) * 100
            );


        const ramUsage =
            document.getElementById("ramUsage");

        const cpuUsage =
            document.getElementById("cpuUsage");

        const storageUsage =
            document.getElementById("storageUsage");

        const ramBar =
            document.getElementById("ramBar");

        const cpuBar =
            document.getElementById("cpuBar");

        const storageBar =
            document.getElementById("storageBar");


        if (ramUsage) {
            ramUsage.textContent =
                `${ram} MB / ${ramLimit} MB`;
        }

        if (cpuUsage) {
            cpuUsage.textContent =
                `${cpu}%`;
        }

        if (storageUsage) {
            storageUsage.textContent =
                `${storage} MB / ${storageLimit} MB`;
        }

        if (ramBar) {
            ramBar.style.width =
                `${ramPercentage}%`;
        }

        if (cpuBar) {
            cpuBar.style.width =
                `${cpuPercentage}%`;
        }

        if (storageBar) {
            storageBar.style.width =
                `${storagePercentage}%`;
        }
    }


    // =========================
    // CONSOLE
    // =========================

    function addConsoleLine(message) {

        if (!consoleOutput) {
            return;
        }

        const line =
            document.createElement("div");

        line.textContent =
            `[${new Date().toLocaleTimeString("pt-BR")}] ${message}`;

        consoleOutput.appendChild(line);

        consoleOutput.scrollTop =
            consoleOutput.scrollHeight;
    }


    function setConsoleStatus(status) {

        if (consoleStatus) {
            consoleStatus.textContent = status;
        }
    }


    // =========================
    // STATUS
    // =========================

    function getStatus(data) {

        const status =
            String(
                data.status ||
                "offline"
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
    // DESATIVAR CONTROLES
    // =========================

    function disableControls() {

        [
            startButton,
            stopButton,
            restartButton,
            deployButton,
            deleteButton
        ].forEach((button) => {
            if (button) {
                button.disabled = true;
            }
        });
    }
});
