document.addEventListener("DOMContentLoaded", async () => {

    const userName = document.getElementById("userName");
    const logoutButton = document.getElementById("logoutButton");

    const form = document.getElementById("createBotForm");
    const message = document.getElementById("createBotMessage");
    const createButton = document.getElementById("createBotButton");

    const githubSource = document.getElementById("githubSource");
    const zipSource = document.getElementById("zipSource");

    const githubUrl = document.getElementById("githubUrl");
    const githubBranch = document.getElementById("githubBranch");

    const projectZip = document.getElementById("projectZip");
    const zipFileName = document.getElementById("zipFileName");

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
    // ORIGEM DO PROJETO
    // =========================

    const sourceInputs =
        document.querySelectorAll(
            'input[name="sourceType"]'
        );

    sourceInputs.forEach((input) => {

        input.addEventListener("change", () => {

            if (input.value === "github" && input.checked) {

                githubSource.hidden = false;
                zipSource.hidden = true;

            }

            if (input.value === "zip" && input.checked) {

                githubSource.hidden = true;
                zipSource.hidden = false;

            }

        });

    });


    // =========================
    // ARQUIVO ZIP
    // =========================

    projectZip?.addEventListener("change", () => {

        const file = projectZip.files?.[0];

        if (!file) {

            zipFileName.textContent = "";
            zipFileName.classList.remove("visible");

            return;
        }

        zipFileName.textContent =
            `Arquivo selecionado: ${file.name}`;

        zipFileName.classList.add("visible");

    });


    // =========================
    // CRIAR BOT
    // =========================

    form?.addEventListener("submit", async (event) => {

        event.preventDefault();

        clearMessage();


        const name =
            document.getElementById("botName")?.value.trim();

        const description =
            document.getElementById("botDescription")?.value.trim();

        const language =
            document.getElementById("botLanguage")?.value;

        const runtime =
            document.getElementById("botRuntime")?.value;

        const startCommand =
            document.getElementById("startCommand")?.value.trim();

        const sourceType =
            document.querySelector(
                'input[name="sourceType"]:checked'
            )?.value;


        // =========================
        // VALIDAÇÃO
        // =========================

        if (!name) {
            showError("Digite o nome do bot.");
            return;
        }

        if (!language) {
            showError("Selecione a linguagem do bot.");
            return;
        }

        if (!sourceType) {
            showError("Selecione a origem do projeto.");
            return;
        }


        if (sourceType === "github") {

            if (!githubUrl?.value.trim()) {
                showError(
                    "Digite a URL do repositório do GitHub."
                );
                return;
            }

        }


        if (sourceType === "zip") {

            if (!projectZip?.files?.length) {
                showError(
                    "Selecione o arquivo ZIP do projeto."
                );
                return;
            }

            const file = projectZip.files[0];

            if (
                !file.name.toLowerCase().endsWith(".zip")
            ) {
                showError(
                    "O arquivo precisa estar no formato ZIP."
                );
                return;
            }

        }


        // =========================
        // BOTÃO
        // =========================

        createButton.disabled = true;
        createButton.textContent = "Criando...";


        try {

            /*
             * Neste momento enviamos apenas os dados
             * básicos para a API.
             *
             * O upload real do ZIP/GitHub será conectado
             * ao backend quando as rotas de criação/importação
             * estiverem prontas.
             */

            const payload = {
                name,
                description,
                language,
                runtime:
                    runtime || null,
                startCommand:
                    startCommand || null,
                sourceType
            };


            if (sourceType === "github") {

                payload.githubUrl =
                    githubUrl.value.trim();

                payload.githubBranch =
                    githubBranch?.value.trim() ||
                    "main";
            }


            const response =
                await API.createBot(payload);


            const bot =
                response?.bot ||
                response;


            if (!bot?.id) {

                throw new Error(
                    "O servidor não retornou o ID do bot."
                );
            }


            showSuccess(
                "Bot criado com sucesso! Redirecionando..."
            );


            setTimeout(() => {

                window.location.href =
                    `bot.html?id=${encodeURIComponent(bot.id)}`;

            }, 700);


        } catch (error) {

            console.error(
                "Erro ao criar bot:",
                error
            );

            showError(
                error.message ||
                "Não foi possível criar o bot."
            );

            createButton.disabled = false;
            createButton.textContent = "Continuar";
        }

    });


    // =========================
    // LOGOUT
    // =========================

    logoutButton?.addEventListener(
        "click",
        async () => {

            logoutButton.disabled = true;
            logoutButton.textContent = "Saindo...";

            try {

                await API.logout();

                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(error);

                logoutButton.disabled = false;
                logoutButton.textContent = "Sair";
            }

        }
    );


    // =========================
    // MENSAGENS
    // =========================

    function clearMessage() {

        if (!message) {
            return;
        }

        message.className =
            "auth-message";

        message.textContent = "";
    }


    function showError(text) {

        if (!message) {
            return;
        }

        message.className =
            "auth-message error";

        message.textContent = text;
    }


    function showSuccess(text) {

        if (!message) {
            return;
        }

        message.className =
            "auth-message success";

        message.textContent = text;
    }

});
