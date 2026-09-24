document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email")?.value.trim();
        const password = document.getElementById("password")?.value;
        const submitButton = loginForm.querySelector(
            'button[type="submit"]'
        );

        if (!email || !password) {
            loginMessage.className = "auth-message error";
            loginMessage.textContent = "Preencha todos os campos.";
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Entrando...";

        loginMessage.className = "auth-message";
        loginMessage.textContent = "";

        try {
            await API.login({
                email,
                password
            });

            loginMessage.className = "auth-message success";
            loginMessage.textContent = "Login realizado com sucesso.";

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 500);

        } catch (error) {
            loginMessage.className = "auth-message error";
            loginMessage.textContent =
                error.message || "E-mail ou senha incorretos.";
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Entrar";
        }
    });
});
