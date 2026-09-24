/* =====================================================
   ELEMENTOS
===================================================== */

const cadastroForm = 
    document.getElementById("cadastroForm");

const tipoRadios = 
    document.querySelectorAll('input[name="tipo"]');

const studentFields = 
    document.getElementById("studentFields");

const sellerFields = 
    document.getElementById("sellerFields");

const themeButton = 
    document.getElementById("themeButton");


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
   MOSTRAR/OCULTAR CAMPOS
===================================================== */

function alternarCampos() {
    const tipoSelecionado = 
        document.querySelector('input[name="tipo"]:checked').value;

    if (tipoSelecionado === "aluno") {
        studentFields.style.display = "block";
        sellerFields.style.display = "none";
        
        // Remove required dos campos do vendedor
        document.getElementById("nomeLoja").removeAttribute("required");
        document.getElementById("categoriaLoja").removeAttribute("required");
        
        // Adiciona required ao campo de faixa
        document.getElementById("faixa").setAttribute("required", "required");
        
    } else if (tipoSelecionado === "vendedor") {
        studentFields.style.display = "none";
        sellerFields.style.display = "block";
        
        // Remove required do campo de faixa
        document.getElementById("faixa").removeAttribute("required");
        
        // Adiciona required aos campos do vendedor
        document.getElementById("nomeLoja").setAttribute("required", "required");
        document.getElementById("categoriaLoja").setAttribute("required", "required");
    }
}

// Chamar ao carregar a página
alternarCampos();

// Chamar quando mudar a seleção
tipoRadios.forEach(radio => {
    radio.addEventListener("change", alternarCampos);
});


/* =====================================================
   CADASTRO
===================================================== */

if (cadastroForm) {
    cadastroForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Validar senha
        const senha = document.getElementById("senha").value;
        const confirmar = document.getElementById("confirmar").value;

        if (senha !== confirmar) {
            alert("As senhas não conferem!");
            return;
        }

        if (senha.length < 6) {
            alert("A senha deve ter no mínimo 6 caracteres!");
            return;
        }

        // Validar termos
        if (!document.getElementById("termos").checked) {
            alert("Você precisa aceitar os termos de uso!");
            return;
        }

        // Desabilitar botão
        const button = cadastroForm.querySelector("button[type='submit']");
        const botaoOriginal = button.textContent;
        button.disabled = true;
        button.textContent = "Criando conta...";

        try {
            // Dados do formulário
            const email = document.getElementById("email").value.trim();
            const nome = document.getElementById("nome").value.trim();
            const telefone = document.getElementById("telefone").value.trim();
            const tipo = document.querySelector('input[name="tipo"]:checked').value;

            // 1. CRIAR USUÁRIO
            const resUsuario = await fetch(API_BASE_URL + "/api/cadastro", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    senha: senha,
                    tipo: tipo
                })
            });

            const dataUsuario = await resUsuario.json();

            if (!resUsuario.ok) {
                alert(dataUsuario.erro || "Erro ao criar conta!");
                button.disabled = false;
                button.textContent = botaoOriginal;
                return;
            }

            // 2. SE FOR VENDEDOR, CRIAR LOJA
            if (tipo === "vendedor") {
                try {
                    // Fazer login primeiro para obter token
                    const resLogin = await fetch(API_BASE_URL + "/api/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email: email,
                            senha: senha
                        })
                    });

                    const dataLogin = await resLogin.json();

                    if (!resLogin.ok) {
                        console.error("Erro no login:", dataLogin);
                        alert("Erro ao fazer login após cadastro: " + (dataLogin.erro || "Desconhecido"));
                        button.disabled = false;
                        button.textContent = botaoOriginal;
                        return;
                    }

                    const token = dataLogin.token;
                    const nomeLoja = document.getElementById("nomeLoja").value.trim();
                    const categoriaLoja = document.getElementById("categoriaLoja").value;
                    const descricaoLoja = document.getElementById("descricaoLoja").value.trim();

                    if (!nomeLoja || !categoriaLoja) {
                        alert("Preencha todos os campos da loja!");
                        button.disabled = false;
                        button.textContent = botaoOriginal;
                        return;
                    }

                    // Criar loja
                    const resLoja = await fetch(API_BASE_URL + "/api/minha-loja", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            nome: nomeLoja,
                            descricao: descricaoLoja
                        })
                    });

                    if (!resLoja.ok) {
                        const dataLoja = await resLoja.json();
                        console.warn("Aviso ao criar loja:", dataLoja);
                    }

                    // Salvar token na sessão
                    localStorage.setItem("token", token);

                } catch (erroVendedor) {
                    console.error("Erro ao processar vendedor:", erroVendedor);
                    alert("Erro ao criar loja: " + erroVendedor.message);
                    button.disabled = false;
                    button.textContent = botaoOriginal;
                    return;
                }
            }

            alert("Conta criada com sucesso!");
            
            // Redirecionar para conta
            setTimeout(() => {
                window.location.href = "conta.html";
            }, 1500);

        } catch (error) {
            console.error("Erro no cadastro:", error);
            alert("Erro ao criar conta: " + error.message);
        } finally {
            button.disabled = false;
            button.textContent = botaoOriginal;
        }
    });
}
