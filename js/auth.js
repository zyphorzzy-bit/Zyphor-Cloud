document.addEventListener("DOMContentLoaded", () => {
    // =========================
    // LOGIN
    // =========================

    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");

    if (loginForm) {
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

            try {
                await API.login({
                    email,
                    password
                });

                loginMessage.className = "auth-message success";
                loginMessage.textContent =
                    "Login realizado com sucesso.";

                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 500);

            } catch (error) {
                loginMessage.className = "auth-message error";
                loginMessage.textContent =
                    error.message || "Não foi possível entrar.";

            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Entrar";
            }
        });
    }


    // =========================
    // CADASTRO
    // =========================

    const registerForm = document.getElementById("registerForm");
    const registerMessage =
        document.getElementById("registerMessage");

    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const name =
                document.getElementById("name")?.value.trim();

            const email =
                document.getElementById("email")?.value.trim();

            const password =
                document.getElementById("password")?.value;

            const confirmPassword =
                document.getElementById("confirmPassword")?.value;

            const submitButton = registerForm.querySelector(
                'button[type="submit"]'
            );

            if (!name || !email || !password || !confirmPassword) {
                registerMessage.className =
                    "auth-message error";

                registerMessage.textContent =
                    "Preencha todos os campos.";

                return;
            }

            if (password.length < 6) {
                registerMessage.className =
                    "auth-message error";

                registerMessage.textContent =
                    "A senha precisa ter pelo menos 6 caracteres.";

                return;
            }

            if (password !== confirmPassword) {
                registerMessage.className =
                    "auth-message error";

                registerMessage.textContent =
                    "As senhas não coincidem.";

                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = "Criando...";

            registerMessage.className = "auth-message";
            registerMessage.textContent = "";

            try {
                await API.register({
                    name,
                    email,
                    password
                });

                registerMessage.className =
                    "auth-message success";

                registerMessage.textContent =
                    "Conta criada com sucesso!";

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 800);

            } catch (error) {
                registerMessage.className =
                    "auth-message error";

                registerMessage.textContent =
                    error.message ||
                    "Não foi possível criar a conta.";

            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Criar conta";
            }
        });
    }
});
