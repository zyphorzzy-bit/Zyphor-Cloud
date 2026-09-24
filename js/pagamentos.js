document.addEventListener("DOMContentLoaded", async () => {

    const userName = document.getElementById("userName");
    const logoutButton = document.getElementById("logoutButton");

    const paymentForm = document.getElementById("paymentForm");
    const paymentPlan = document.getElementById("paymentPlan");
    const selectedPlan = document.getElementById("selectedPlan");
    const selectedPlanName = document.getElementById("selectedPlanName");
    const selectedPlanPrice = document.getElementById("selectedPlanPrice");
    const paymentMessage = document.getElementById("paymentMessage");
    const paymentButton = document.getElementById("paymentButton");

    const pixKey = document.getElementById("pixKey");
    const copyPix = document.getElementById("copyPix");
    const pixReceiverName = document.getElementById("pixReceiverName");
    const pixBank = document.getElementById("pixBank");

    const proofSection = document.getElementById("proofSection");
    const proofForm = document.getElementById("proofForm");
    const proofFile = document.getElementById("proofFile");
    const proofNote = document.getElementById("proofNote");
    const proofMessage = document.getElementById("proofMessage");
    const proofButton = document.getElementById("proofButton");

    const paymentsList = document.getElementById("paymentsList");

    let plans = [];
    let activePaymentId = null;

    /*
     * Carregar usuário
     */

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

    /*
     * Carregar planos
     */

    await loadPlans();

    /*
     * Carregar pagamentos
     */

    await loadPayments();

    /*
     * Seleção de plano
     */

    paymentPlan?.addEventListener("change", () => {

        const value = paymentPlan.value;

        if (!value) {

            selectedPlan?.classList.add("hidden");

            if (paymentButton) {
                paymentButton.disabled = true;
            }

            return;
        }

        const plan =
            plans.find(
                item =>
                    String(item.id) === String(value)
            ) ||
            plans.find(
                item =>
                    String(item.name).toLowerCase() ===
                    String(value).toLowerCase()
            );

        if (!plan) {
            return;
        }

        const price =
            formatPrice(
                plan.price ??
                plan.priceCents ??
                0
            );

        if (selectedPlanName) {
            selectedPlanName.textContent =
                plan.name || "Plano";
        }

        if (selectedPlanPrice) {
            selectedPlanPrice.textContent =
                price + "/mês";
        }

        selectedPlan?.classList.remove("hidden");

        if (paymentButton) {
            paymentButton.disabled = false;
        }

    });

    /*
     * Criar pagamento
     */

    paymentForm?.addEventListener("submit", async event => {

        event.preventDefault();

        const value = paymentPlan?.value;

        if (!value) {

            showPaymentMessage(
                "Selecione um plano.",
                "error"
            );

            return;
        }

        const plan =
            plans.find(
                item =>
                    String(item.id) === String(value)
            ) ||
            plans.find(
                item =>
                    String(item.name).toLowerCase() ===
                    String(value).toLowerCase()
            );

        if (!plan) {

            showPaymentMessage(
                "Plano inválido.",
                "error"
            );

            return;
        }

        paymentButton.disabled = true;
        paymentButton.textContent = "Criando pagamento...";

        try {

            const response =
                await API.createPayment({
                    planId: plan.id || value
                });

            showPaymentMessage(
                "Pagamento criado. Faça o PIX e envie o comprovante.",
                "success"
            );

            const payment =
                response?.payment ||
                response;

            if (payment?.id) {
                activePaymentId = payment.id;
                showProofSection();
            }

            await loadPayments();

        } catch (error) {

            console.error(error);

            showPaymentMessage(
                error.message ||
                "Não foi possível criar o pagamento.",
                "error"
            );

        } finally {

            paymentButton.disabled = false;
            paymentButton.textContent = "Criar pagamento";

        }

    });

    /*
     * Copiar PIX
     */

    copyPix?.addEventListener("click", async () => {

        const value =
            pixKey?.textContent?.trim();

        if (!value) {
            return;
        }

        try {

            await navigator.clipboard.writeText(value);

            copyPix.textContent = "Copiado!";

            setTimeout(() => {
                copyPix.textContent = "Copiar";
            }, 1500);

        } catch (error) {

            console.error(error);

            showPaymentMessage(
                "Não foi possível copiar a chave PIX.",
                "error"
            );

        }

    });

    /*
     * Enviar comprovante
     */

    proofForm?.addEventListener("submit", async event => {

        event.preventDefault();

        if (!activePaymentId) {

            showProofMessage(
                "Selecione um pagamento pendente.",
                "error"
            );

            return;
        }

        const file =
            proofFile?.files?.[0];

        if (!file) {

            showProofMessage(
                "Selecione o comprovante.",
                "error"
            );

            return;
        }

        /*
         * Limite de 5 MB
         */

        if (file.size > 5 * 1024 * 1024) {

            showProofMessage(
                "O comprovante deve ter no máximo 5 MB.",
                "error"
            );

            return;
        }

        proofButton.disabled = true;
        proofButton.textContent = "Enviando...";

        try {

            const fileData =
                await fileToBase64(file);

            await API.sendPaymentProof(
                activePaymentId,
                {
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    fileData,
                    note:
                        proofNote?.value?.trim() || ""
                }
            );

            showProofMessage(
                "Comprovante enviado com sucesso.",
                "success"
            );

            proofForm.reset();

            await loadPayments();

        } catch (error) {

            console.error(error);

            showProofMessage(
                error.message ||
                "Não foi possível enviar o comprovante.",
                "error"
            );

        } finally {

            proofButton.disabled = false;
            proofButton.textContent = "Enviar comprovante";

        }

    });

    /*
     * Logout
     */

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

    /*
     * Função: carregar planos
     */

    async function loadPlans() {

        try {

            const response =
                await API.getPlans();

            plans =
                Array.isArray(response)
                    ? response
                    : response?.plans || [];

            if (!plans.length) {
                return;
            }

            populatePlanSelect();

        } catch (error) {

            console.error(
                "Erro ao carregar planos:",
                error
            );

            /*
             * Fallback caso a API ainda não esteja pronta.
             */

            plans = [
                {
                    id: "free",
                    name: "Free",
                    price: 0
                },
                {
                    id: "bronze",
                    name: "Bronze",
                    price: 490
                },
                {
                    id: "prata",
                    name: "Prata",
                    price: 990
                },
                {
                    id: "ouro",
                    name: "Ouro",
                    price: 1790
                },
                {
                    id: "diamante",
                    name: "Diamante",
                    price: 2990
                }
            ];

        }

    }

    /*
     * Preencher select
     */

    function populatePlanSelect() {

        if (!paymentPlan) {
            return;
        }

        paymentPlan.innerHTML =
            '<option value="">Selecione um plano</option>';

        plans.forEach(plan => {

            const option =
                document.createElement("option");

            option.value =
                plan.id ||
                plan.name;

            const price =
                formatPrice(
                    plan.price ??
                    plan.priceCents ??
                    0
                );

            option.textContent =
                `${plan.name || "Plano"} — ${price}/mês`;

            paymentPlan.appendChild(option);

        });

    }

    /*
     * Carregar histórico
     */

    async function loadPayments() {

        if (!paymentsList) {
            return;
        }

        try {

            const response =
                await API.getPayments();

            const payments =
                Array.isArray(response)
                    ? response
                    : response?.payments || [];

            renderPayments(payments);

        } catch (error) {

            console.error(
                "Erro ao carregar pagamentos:",
                error
            );

            paymentsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">—</div>

                    <p>
                        Nenhum pagamento encontrado.
                    </p>
                </div>
            `;

        }

    }

    /*
     * Renderizar pagamentos
     */

    function renderPayments(payments) {

        if (!payments.length) {

            paymentsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">—</div>

                    <p>
                        Você ainda não possui pagamentos.
                    </p>
                </div>
            `;

            return;
        }

        paymentsList.innerHTML = "";

        payments.forEach(payment => {

            const item =
                document.createElement("div");

            item.className =
                "payment-item";

            const plan =
                findPlan(
                    payment.planId ||
                    payment.plan?.id ||
                    payment.plan
                );

            const planName =
                payment.plan?.name ||
                plan?.name ||
                payment.planName ||
                "Plano";

            const price =
                formatPrice(
                    payment.amount ??
                    payment.price ??
                    payment.priceCents ??
                    plan?.price ??
                    0
                );

            const status =
                normalizeStatus(
                    payment.status
                );

            const statusLabel =
                getStatusLabel(status);

            const date =
                formatDate(
                    payment.createdAt ||
                    payment.created_at
                );

            item.innerHTML = `

                <div class="payment-item-info">

                    <div class="payment-item-name">
                        ${escapeHtml(planName)}
                    </div>

                    <div class="payment-item-meta">
                        ${escapeHtml(date)}
                    </div>

                </div>

                <div class="payment-item-right">

                    <div class="payment-item-price">
                        ${escapeHtml(price)}
                    </div>

                    <span class="payment-status ${status}">
                        ${escapeHtml(statusLabel)}
                    </span>

                    ${
                        status === "pending"
                            ? `
                                <button
                                    type="button"
                                    class="btn btn-secondary payment-action"
                                    data-payment-id="${escapeHtml(
                                        payment.id
                                    )}"
                                >
                                    Enviar comprovante
                                </button>
                            `
                            : ""
                    }

                </div>

            `;

            paymentsList.appendChild(item);

        });

        paymentsList
            .querySelectorAll("[data-payment-id]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        activePaymentId =
                            button.dataset.paymentId;

                        showProofSection();

                        proofSection?.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                    }
                );

            });

    }

    /*
     * Mostrar área de comprovante
     */

    function showProofSection() {

        if (!proofSection) {
            return;
        }

        proofSection.classList.remove("hidden");

    }

    /*
     * Mensagem do pagamento
     */

    function showPaymentMessage(
        message,
        type
    ) {

        if (!paymentMessage) {
            return;
        }

        paymentMessage.className =
            `auth-message ${type}`;

        paymentMessage.textContent =
            message;

    }

    /*
     * Mensagem do comprovante
     */

    function showProofMessage(
        message,
        type
    ) {

        if (!proofMessage) {
            return;
        }

        proofMessage.className =
            `auth-message ${type}`;

        proofMessage.textContent =
            message;

    }

    /*
     * Encontrar plano
     */

    function findPlan(value) {

        if (!value) {
            return null;
        }

        return plans.find(
            plan =>
                String(plan.id) === String(value)
        ) || plans.find(
            plan =>
                String(plan.name).toLowerCase() ===
                String(value).toLowerCase()
        );

    }

    /*
     * Status
     */

    function normalizeStatus(status) {

        const value =
            String(
                status || "pending"
            ).toLowerCase();

        if (
            value === "approved" ||
            value === "aprovado" ||
            value === "paid"
        ) {
            return "approved";
        }

        if (
            value === "rejected" ||
            value === "recusado"
        ) {
            return "rejected";
        }

        if (
            value === "expired" ||
            value === "expirado"
        ) {
            return "expired";
        }

        return "pending";

    }

    function getStatusLabel(status) {

        const labels = {
            pending: "Pendente",
            approved: "Aprovado",
            rejected: "Recusado",
            expired: "Expirado"
        };

        return labels[status] || "Pendente";

    }

    /*
     * Formatar preço
     */

    function formatPrice(value) {

        let number =
            Number(value);

        if (!Number.isFinite(number)) {
            number = 0;
        }

        /*
         * Valores acima de 100 normalmente
         * estão em centavos.
         */

        if (number >= 100) {
            number = number / 100;
        }

        return number.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }

    /*
     * Formatar data
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
     * Arquivo → Base64
     */

    function fileToBase64(file) {

        return new Promise(
            (resolve, reject) => {

                const reader =
                    new FileReader();

                reader.onload = () => {

                    const result =
                        String(
                            reader.result || ""
                        );

                    const base64 =
                        result.includes(",")
                            ? result.split(",")[1]
                            : result;

                    resolve(base64);

                };

                reader.onerror = () => {
                    reject(
                        new Error(
                            "Não foi possível ler o arquivo."
                        )
                    );
                };

                reader.readAsDataURL(file);

            }
        );

    }

    /*
     * Segurança contra HTML
     */

    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

});
