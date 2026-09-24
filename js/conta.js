/* =====================================================
   ELEMENTOS
===================================================== */

const loginCard = document.getElementById("loginCard");
const profileCard = document.getElementById("profileCard");
const loginForm = document.getElementById("loginForm");
const logoutButton = document.getElementById("logoutButton");
const themeButton = document.getElementById("themeButton");


/* =====================================================
   TEMA
===================================================== */

const temaSalvo = localStorage.getItem("tema");

if (temaSalvo === "escuro") {
    document.body.classList.add("dark");
    if (themeButton) {
        themeButton.textContent = "☀️";
    }
} else {
    if (themeButton) {
        themeButton.textContent = "🌙";
    }
}

if (themeButton) {
    themeButton.addEventListener("click", function () {
        document.body.classList.toggle("dark");
        const escuro = document.body.classList.contains("dark");
        
        if (escuro) {
            themeButton.textContent = "☀️";
            localStorage.setItem("tema", "escuro");
        } else {
            themeButton.textContent = "🌙";
            localStorage.setItem("tema", "claro");
        }
    });
}


/* =====================================================
   LOGIN
===================================================== */

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        console.log("✓ Formulário de login enviado");

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("password").value;

        console.log("Email:", email);
        console.log("Senha:", senha ? "****" : "(vazio)");

        if (!email || !senha) {
            alert("Digite seu e-mail e sua senha.");
            return;
        }

        const button = document.getElementById("loginButton");
        if (!button) {
            console.error("❌ Botão de login não encontrado!");
            alert("Erro: Botão de login não encontrado");
            return;
        }

        button.disabled = true;
        button.textContent = "Entrando...";

        try {
            console.log("→ Enviando requisição para " + API_BASE_URL + "/api/login...");
            
            const res = await fetch(API_BASE_URL + "/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    senha: senha
                })
            });

            console.log("← Resposta recebida:", res.status, res.statusText);
            const data = await res.json();
            console.log("Dados da resposta:", data);

            if (!res.ok) {
                const erro = data.erro || "E-mail ou senha incorretos.";
                console.error("❌ Erro na resposta:", erro);
                alert(erro);
                button.disabled = false;
                button.textContent = "Entrar";
                return;
            }

            console.log("✓ Login bem-sucedido!");
            console.log("Token:", data.token.substring(0, 20) + "...");

            // Salvar token e dados
            localStorage.setItem("token", data.token);
            localStorage.setItem("usuario", JSON.stringify(data.usuario));

            console.log("✓ Dados salvos no localStorage");

            // Redirecionar para a página correta
            if (data.usuario.tipo === "vendedor") {
                console.log("Redirecionando para loja.html (vendedor)...");
                window.location.href = "loja.html";
            } else {
                console.log("Redirecionando para perfil.html (aluno)...");
                window.location.href = "perfil.html";
            }

        } catch (error) {
            console.error("❌ Erro ao fazer login:", error);
            console.error("Detalhes:", error.message);
            console.error("Stack:", error.stack);
            alert("Erro ao tentar entrar: " + error.message);
            button.disabled = false;
            button.textContent = "Entrar";
        }
    });
} else {
    console.error("❌ loginForm não encontrado na página!");
}


/* =====================================================
   MOSTRAR PERFIL
===================================================== */

function mostrarPerfil(usuario) {
    if (!usuario) return;

    // Esconde login
    if (loginCard) {
        loginCard.style.display = "none";
    }

    // Mostra perfil
    if (profileCard) {
        profileCard.style.display = "block";
    }

    // Nome
    const nome = usuario.nome || "Usuário";
    const profileName = document.getElementById("profileName");
    const profileNameInfo = document.getElementById("profileNameInfo");
    
    if (profileName) profileName.textContent = nome;
    if (profileNameInfo) profileNameInfo.textContent = nome;

    // E-mail
    const profileEmail = document.getElementById("profileEmail");
    if (profileEmail) profileEmail.textContent = usuario.email || "-";

    // Telefone
    const profileTelefone = document.getElementById("profileTelefone");
    if (profileTelefone) profileTelefone.textContent = usuario.telefone || "-";

    // Tipo
    const tipo = usuario.tipo || "aluno";
    const profileTipo = document.getElementById("profileTipo");
    if (profileTipo) {
        profileTipo.textContent = tipo === "vendedor" ? "Vendedor" : "Aluno";
    }

    // Faixa (apenas para aluno)
    const faixaBox = document.getElementById("profileFaixaBox");
    if (faixaBox) {
        if (tipo === "aluno") {
            faixaBox.style.display = "flex";
            const profileFaixa = document.getElementById("profileFaixa");
            if (profileFaixa) {
                profileFaixa.textContent = usuario.faixa || "Não informado";
            }
        } else {
            faixaBox.style.display = "none";
        }
    }
}


/* =====================================================
   LOGOUT
===================================================== */

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.href = "conta.html";
    });
}


/* =====================================================
   VERIFICAR USUÁRIO LOGADO
===================================================== */

function verificarUsuario() {
    const usuarioJson = localStorage.getItem("usuario");
    
    if (usuarioJson) {
        try {
            const usuario = JSON.parse(usuarioJson);
            mostrarPerfil(usuario);
        } catch (error) {
            console.error("Erro ao parsear usuário:", error);
        }
    }
}

// Verificar ao carregar a página
verificarUsuario();