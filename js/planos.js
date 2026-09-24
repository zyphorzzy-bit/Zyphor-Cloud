document.addEventListener("DOMContentLoaded", async () => {

    const plansGrid = document.getElementById("plansGrid");

    if (!plansGrid) {
        return;
    }


    // =========================
    // CARREGAR PLANOS
    // =========================

    try {

        const response = await API.getPlans();

        const plans =
            Array.isArray(response)
                ? response
                : response?.plans || [];

        if (!plans.length) {
            return;
        }

        renderPlans(plans);

    } catch (error) {

        console.error(
            "Não foi possível carregar os planos:",
            error
        );

        // A página continua mostrando
        // os planos estáticos do HTML.
    }


    // =========================
    // RENDERIZAR PLANOS
    // =========================

    function renderPlans(plans) {

        plansGrid.innerHTML = "";

        plans.forEach((plan) => {

            const card =
                document.createElement("article");

            card.className =
                "plan-card";


            const price =
                formatPrice(
                    plan.price ??
                    plan.priceCents ??
                    0
                );


            const ram =
                plan.ram ??
                plan.ramMb ??
                plan.memory ??
                "—";


            const cpu =
                plan.cpu ??
                plan.cpuCores ??
                "—";


            const storage =
                plan.storage ??
                plan.storageMb ??
                "—";


            const botLimit =
                plan.botLimit ??
                plan.maxBots ??
                "—";


            card.innerHTML = `

                <div class="plan-top">

                    <span class="plan-name">
                        ${escapeHtml(
                            plan.name || "Plano"
                        )}
                    </span>

                </div>


                <div class="plan-price">

                    <strong>
                        ${price}
                    </strong>

                    <span>
                        /mês
                    </span>

                </div>


                <p class="plan-description">

                    ${escapeHtml(
                        plan.description ||
                        "Recursos para seus projetos."
                    )}

                </p>


                <div class="plan-divider"></div>


                <ul class="plan-features">

                    <li>
                        <span>✓</span>
                        ${escapeHtml(
                            formatResource(
                                "RAM",
                                ram,
                                "MB"
                            )
                        )}
                    </li>

                    <li>
                        <span>✓</span>
                        ${escapeHtml(
                            formatResource(
                                "CPU",
                                cpu,
                                "vCPU"
                            )
                        )}
                    </li>

                    <li>
                        <span>✓</span>
                        ${escapeHtml(
                            formatResource(
                                "Armazenamento",
                                storage,
                                "MB"
                            )
                        )}
                    </li>

                    <li>
                        <span>✓</span>
                        Até ${escapeHtml(
                            String(botLimit)
                        )} bots*
                    </li>

                </ul>


                <a
                    href="cadastro.html"
                    class="btn ${
                        isFeatured(plan)
                            ? "btn-primary"
                            : "btn-secondary"
                    } btn-large plan-button"
                >
                    ${
                        Number(
                            plan.price ??
                            plan.priceCents ??
                            0
                        ) === 0
                            ? "Começar grátis"
                            : "Escolher plano"
                    }
                </a>

            `;


            if (isFeatured(plan)) {

                const highlight =
                    document.createElement("div");

                highlight.className =
                    "plan-highlight";

                highlight.textContent =
                    "MAIS RECURSOS";

                card.prepend(highlight);
            }


            plansGrid.appendChild(card);

        });

    }


    // =========================
    // PREÇO
    // =========================

    function formatPrice(value) {

        let cents =
            Number(value);

        if (!Number.isFinite(cents)) {
            cents = 0;
        }

        /*
         * O backend normalmente guarda
         * o preço em centavos.
         */

        if (cents >= 100) {
            cents = cents / 100;
        }

        return cents.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }


    // =========================
    // RECURSOS
    // =========================

    function formatResource(
        label,
        value,
        unit
    ) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return `${label}: —`;
        }

        return `${label}: ${value} ${unit}`;
    }


    // =========================
    // PLANO DESTAQUE
    // =========================

    function isFeatured(plan) {

        const name =
            String(
                plan.name || ""
            ).toLowerCase();

        return (
            name === "prata" ||
            name.includes("prata")
        );
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
