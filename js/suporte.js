document.addEventListener("DOMContentLoaded", async () => {

    const userName =
        document.getElementById("userName");

    const logoutButton =
        document.getElementById("logoutButton");

    const openTicketButton =
        document.getElementById("openTicketButton");

    const viewTicketsButton =
        document.getElementById("viewTicketsButton");

    const ticketSection =
        document.getElementById("ticketSection");

    const ticketsSection =
        document.getElementById("ticketsSection");

    const ticketForm =
        document.getElementById("ticketForm");

    const cancelTicketButton =
        document.getElementById("cancelTicketButton");

    const ticketSubject =
        document.getElementById("ticketSubject");

    const ticketCategory =
        document.getElementById("ticketCategory");

    const ticketMessage =
        document.getElementById("ticketMessage");

    const ticketMessageStatus =
        document.getElementById(
            "ticketMessageStatus"
        );

    const ticketButton =
        document.getElementById("ticketButton");

    const ticketsList =
        document.getElementById("ticketsList");


    /*
     * Carregar usuário
     */

    try {

        const response =
            await API.me();

        const user =
            response?.user ||
            response;

        const name =
            user?.name ||
            user?.username ||
            user?.email ||
            "Usuário";

        if (userName) {
            userName.textContent =
                name;
        }

    } catch (error) {

        console.error(error);

        window.location.href =
            "login.html";

        return;
    }


    /*
     * Abrir formulário
     */

    openTicketButton?.addEventListener(
        "click",
        () => {

            ticketSection?.classList.remove(
                "hidden"
            );

            ticketsSection?.classList.add(
                "hidden"
            );

            ticketSubject?.focus();

            ticketSection?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );


    /*
     * Ver chamados
     */

    viewTicketsButton?.addEventListener(
        "click",
        async () => {

            ticketSection?.classList.add(
                "hidden"
            );

            ticketsSection?.classList.remove(
                "hidden"
            );

            ticketsSection?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            await loadTickets();

        }
    );


    /*
     * Cancelar chamado
     */

    cancelTicketButton?.addEventListener(
        "click",
        () => {

            ticketForm?.reset();

            ticketSection?.classList.add(
                "hidden"
            );

            clearMessage();

        }
    );


    /*
     * Criar chamado
     */

    ticketForm?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const subject =
                ticketSubject?.value.trim();

            const category =
                ticketCategory?.value;

            const message =
                ticketMessage?.value.trim();


            if (!subject) {

                showMessage(
                    "Informe o assunto do chamado.",
                    "error"
                );

                ticketSubject?.focus();

                return;
            }


            if (!category) {

                showMessage(
                    "Selecione uma categoria.",
                    "error"
                );

                ticketCategory?.focus();

                return;
            }


            if (!message) {

                showMessage(
                    "Digite uma mensagem.",
                    "error"
                );

                ticketMessage?.focus();

                return;
            }


            if (message.length < 10) {

                showMessage(
                    "Explique um pouco mais o problema.",
                    "error"
                );

                ticketMessage?.focus();

                return;
            }


            ticketButton.disabled = true;
            ticketButton.textContent =
                "Enviando...";


            try {

                /*
                 * Quando a rota de tickets estiver
                 * disponível no API.js, ela será usada.
                 */

                if (
                    typeof API.createTicket ===
                    "function"
                ) {

                    await API.createTicket({
                        subject,
                        category,
                        message
                    });

                } else {

                    /*
                     * A API ainda não está disponível.
                     */

                    throw new Error(
                        "O sistema de chamados ainda não está conectado ao servidor."
                    );

                }


                showMessage(
                    "Chamado enviado com sucesso.",
                    "success"
                );


                ticketForm.reset();


                setTimeout(() => {

                    ticketSection?.classList.add(
                        "hidden"
                    );

                    ticketsSection?.classList.remove(
                        "hidden"
                    );

                    loadTickets();

                }, 700);


            } catch (error) {

                console.error(
                    "Erro ao criar chamado:",
                    error
                );

                showMessage(
                    error.message ||
                    "Não foi possível enviar o chamado.",
                    "error"
                );

            } finally {

                ticketButton.disabled = false;
                ticketButton.textContent =
                    "Enviar chamado";

            }

        }
    );


    /*
     * Carregar chamados
     */

    async function loadTickets() {

        if (!ticketsList) {
            return;
        }


        ticketsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    ...
                </div>

                <p>
                    Carregando chamados...
                </p>
            </div>
        `;


        try {

            if (
                typeof API.getTickets !==
                "function"
            ) {

                throw new Error(
                    "Sistema de chamados ainda não conectado."
                );

            }


            const response =
                await API.getTickets();


            const tickets =
                Array.isArray(response)
                    ? response
                    : response?.tickets || [];


            renderTickets(tickets);


        } catch (error) {

            console.error(
                "Erro ao carregar chamados:",
                error
            );


            ticketsList.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        —
                    </div>

                    <p>
                        Não foi possível carregar os chamados.
                    </p>

                </div>
            `;

        }

    }


    /*
     * Renderizar chamados
     */

    function renderTickets(tickets) {

        if (!tickets.length) {

            ticketsList.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        —
                    </div>

                    <p>
                        Você ainda não abriu nenhum chamado.
                    </p>

                </div>
            `;

            return;
        }


        ticketsList.innerHTML = "";


        tickets.forEach(ticket => {

            const item =
                document.createElement("div");

            item.className =
                "ticket-item";


            const subject =
                ticket.subject ||
                ticket.title ||
                "Chamado sem assunto";


            const category =
                formatCategory(
                    ticket.category
                );


            const status =
                normalizeStatus(
                    ticket.status
                );


            const statusLabel =
                getStatusLabel(status);


            const date =
                formatDate(
                    ticket.createdAt ||
                    ticket.created_at
                );


            item.innerHTML = `

                <div class="ticket-item-info">

                    <div class="ticket-item-title">
                        ${escapeHtml(subject)}
                    </div>

                    <div class="ticket-item-meta">
                        ${escapeHtml(category)}
                        ·
                        ${escapeHtml(date)}
                    </div>

                </div>


                <div class="ticket-item-right">

                    <span class="ticket-status ${status}">
                        ${escapeHtml(statusLabel)}
                    </span>

                </div>

            `;


            ticketsList.appendChild(item);

        });

    }


    /*
     * Categorias
     */

    function formatCategory(category) {

        const categories = {

            bot: "Problema com bot",

            account: "Conta",

            payment: "Pagamento",

            hosting: "Hospedagem",

            other: "Outro"

        };


        return (
            categories[category] ||
            category ||
            "Outro"
        );

    }


    /*
     * Status
     */

    function normalizeStatus(status) {

        const value =
            String(
                status ||
                "open"
            ).toLowerCase();


        if (
            value === "closed" ||
            value === "fechado"
        ) {
            return "closed";
        }


        if (
            value === "pending" ||
            value === "pendente"
        ) {
            return "pending";
        }


        return "open";

    }


    function getStatusLabel(status) {

        const labels = {

            open: "Aberto",

            pending: "Pendente",

            closed: "Fechado"

        };


        return (
            labels[status] ||
            "Aberto"
        );

    }


    /*
     * Data
     */

    function formatDate(value) {

        if (!value) {
            return "Data não informada";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "Data não informada";
        }


        return date.toLocaleString(
            "pt-BR",
            {
                dateStyle: "short",
                timeStyle: "short"
            }
        );

    }


    /*
     * Mensagens
     */

    function showMessage(
        message,
        type
    ) {

        if (!ticketMessageStatus) {
            return;
        }


        ticketMessageStatus.className =
            `auth-message ${type}`;


        ticketMessageStatus.textContent =
            message;

    }


    function clearMessage() {

        if (!ticketMessageStatus) {
            return;
        }


        ticketMessageStatus.className =
            "auth-message";


        ticketMessageStatus.textContent =
            "";

    }


    /*
     * Logout
     */

    logoutButton?.addEventListener(
        "click",
        async () => {

            logoutButton.disabled = true;
            logoutButton.textContent =
                "Saindo...";


            try {

                await API.logout();

                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(error);

                logoutButton.disabled =
                    false;

                logoutButton.textContent =
                    "Sair";

            }

        }
    );


    /*
     * Segurança contra HTML
     */

    function escapeHtml(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }

});
