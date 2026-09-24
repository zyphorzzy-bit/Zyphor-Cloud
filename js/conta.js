document.addEventListener("DOMContentLoaded", async () => {

    const userName = document.getElementById("userName");
    const logoutButton = document.getElementById("logoutButton");

    const accountForm =
        document.getElementById("accountForm");

    const nameInput =
        document.getElementById("name");

    const emailInput =
        document.getElementById("email");

    const accountMessage =
        document.getElementById("accountMessage");

    const saveAccountButton =
        document.getElementById("saveAccountButton");

    const accountPlan =
        document.getElementById("accountPlan");

    const planRam =
        document.getElementById("planRam");

    const planCpu =
        document.getElementById("planCpu");

    const planStorage =
        document.getElementById("planStorage");

    const planBots =
        document.getElementById("planBots");

    const changePasswordButton =
        document.getElementById("changePasswordButton");

    const logoutSecurityButton =
        document.getElementById("logoutSecurityButton");

    const deleteAccountButton =
        document.getElementById("deleteAccountButton");


    /*
     * Carregar conta
     */

    let currentUser = null;

    try {

        const response =
            await API.me();

        currentUser =
            response?.user ||
            response;

        if (!currentUser) {
            throw new Error(
                "Usuário não encontrado."
            );
        }

        renderUser(currentUser);

    } catch (error) {

        console.error(
            "Erro ao carregar conta:",
            error
        );

        window.location.href =
            "login.html";

        return;
    }


    /*
     * Salvar alterações
     */

    accountForm?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const name =
                nameInput?.value.trim();

            if (!name) {

                showMessage(
                    "Informe seu nome.",
                    "error"
                );

                return;
            }

            saveAccountButton.disabled = true;
            saveAccountButton.textContent =
                "Salvando...";

            try {

                /*
                 * A rota de atualização será
                 * conectada ao backend.
                 */

                if (typeof API.updateAccount === "function") {

                    const response =
                        await API.updateAccount({
                            name
                        });

                    currentUser =
                        response?.user ||
                        response ||
                        currentUser;

                } else {

                    /*
                     * Enquanto a rota ainda não
                     * existir, atualizamos a interface.
                     */

                    currentUser = {
                        ...currentUser,
                        name
                    };

                }

                renderUser(currentUser);

                showMessage(
                    "Alterações salvas com sucesso.",
                    "success"
                );

            } catch (error) {

                console.error(error);

                showMessage(
                    error.message ||
                    "Não foi possível salvar as alterações.",
                    "error"
                );

            } finally {

                saveAccountButton.disabled = false;
                saveAccountButton.textContent =
                    "Salvar alterações";

            }

        }
    );


    /*
     * Alterar senha
     */

    changePasswordButton?.addEventListener(
        "click",
        () => {

            window.location.href =
                "login.html?reset=password";

        }
    );


    /*
     * Logout principal
     */

    logoutButton?.addEventListener(
        "click",
        logout
    );


    /*
     * Logout pela área de segurança
     */

    logoutSecurityButton?.addEventListener(
        "click",
        logout
    );


    /*
     * Excluir conta
     */

    deleteAccountButton?.addEventListener(
        "click",
        async () => {

            const confirmed =
                confirm(
                    "Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita."
                );

            if (!confirmed) {
                return;
            }

            const secondConfirmation =
                confirm(
                    "Todos os dados e projetos vinculados à conta poderão ser removidos. Deseja continuar?"
                );

            if (!secondConfirmation) {
                return;
            }

            deleteAccountButton.disabled = true;
            deleteAccountButton.textContent =
                "Excluindo...";

            try {

                if (
                    typeof API.deleteAccount ===
                    "function"
                ) {

                    await API.deleteAccount();

                    window.location.href =
                        "../index.html";

                    return;
                }

                /*
                 * Enquanto a rota ainda não
                 * existir no backend.
                 */

                showMessage(
                    "A exclusão de conta ainda não está disponível.",
                    "error"
                );

            } catch (error) {

                console.error(error);

                showMessage(
                    error.message ||
                    "Não foi possível excluir a conta.",
                    "error"
                );

            } finally {

                deleteAccountButton.disabled =
                    false;

                deleteAccountButton.textContent =
                    "Excluir conta";

            }

        }
    );


    /*
     * Renderizar usuário
     */

    function renderUser(user) {

        const name =
            user?.name ||
            user?.username ||
            user?.email ||
            "Usuário";

        const email =
            user?.email ||
            "";

        if (userName) {
            userName.textContent =
                name;
        }

        if (nameInput) {
            nameInput.value =
                user?.name || "";
        }

        if (emailInput) {
            emailInput.value =
                email;
        }

        renderPlan(
            user?.plan ||
            user?.subscription?.plan ||
            user?.currentPlan
        );

    }


    /*
     * Renderizar plano
     */

    function renderPlan(plan) {

        if (!plan) {

            if (accountPlan) {
                accountPlan.textContent =
                    "Free";
            }

            if (planRam) {
                planRam.textContent =
                    "512 MB";
            }

            if (planCpu) {
                planCpu.textContent =
                    "0.25 vCPU";
            }

            if (planStorage) {
                planStorage.textContent =
                    "1 GB";
            }

            if (planBots) {
                planBots.textContent =
                    "Até 2";
            }

            return;
        }

        const name =
            plan.name ||
            "Free";

        const ram =
            formatRam(
                plan.ram ??
                plan.ramMb ??
                plan.memory
            );

        const cpu =
            plan.cpu ??
            plan.cpuCores ??
            "0.25";

        const storage =
            formatStorage(
                plan.storage ??
                plan.storageMb
            );

        const bots =
            plan.botLimit ??
            plan.maxBots ??
            plan.bots ??
            "2";

        if (accountPlan) {
            accountPlan.textContent =
                name;
        }

        if (planRam) {
            planRam.textContent =
                ram;
        }

        if (planCpu) {
            planCpu.textContent =
                `${cpu} vCPU`;
        }

        if (planStorage) {
            planStorage.textContent =
                storage;
        }

        if (planBots) {
            planBots.textContent =
                `Até ${bots}`;
        }

    }


    /*
     * RAM
     */

    function formatRam(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "512 MB";
        }

        const number =
            Number(value);

        if (
            Number.isFinite(number)
        ) {
            return `${number} MB`;
        }

        return String(value);

    }


    /*
     * Armazenamento
     */

    function formatStorage(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "1 GB";
        }

        const number =
            Number(value);

        if (
            !Number.isFinite(number)
        ) {
            return String(value);
        }

        if (number >= 1024) {

            const gb =
                number / 1024;

            return `${gb} GB`;

        }

        return `${number} MB`;

    }


    /*
     * Mensagens
     */

    function showMessage(
        message,
        type
    ) {

        if (!accountMessage) {
            return;
        }

        accountMessage.className =
            `auth-message ${type}`;

        accountMessage.textContent =
            message;

    }


    /*
     * Logout
     */

    async function logout() {

        if (logoutButton) {
            logoutButton.disabled = true;
            logoutButton.textContent =
                "Saindo...";
        }

        if (logoutSecurityButton) {
            logoutSecurityButton.disabled =
                true;
        }

        try {

            await API.logout();

            window.location.href =
                "login.html";

        } catch (error) {

            console.error(error);

            if (logoutButton) {
                logoutButton.disabled =
                    false;

                logoutButton.textContent =
                    "Sair";
            }

            if (logoutSecurityButton) {
                logoutSecurityButton.disabled =
                    false;
            }

        }

    }

});
