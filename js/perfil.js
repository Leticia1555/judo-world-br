/* =====================================================
   VERIFICAR LOGIN
===================================================== */

const usuarioJson = localStorage.getItem("usuario");

if (!usuarioJson) {
    window.location.href = "conta.html";
}

let usuarioLogado = null;
try {
    usuarioLogado = JSON.parse(usuarioJson);
} catch (error) {
    console.error("Erro ao parsear usuário:", error);
    window.location.href = "conta.html";
}


/* =====================================================
   ELEMENTOS
===================================================== */

const profileName =
    document.getElementById("profileName");

const profileType =
    document.getElementById("profileType");

const nameData =
    document.getElementById("nameData");

const emailData =
    document.getElementById("emailData");

const typeData =
    document.getElementById("typeData");

const storeButton =
    document.getElementById("storeButton");

const editPanel =
    document.getElementById("editPanel");

const editName =
    document.getElementById("editName");

const editEmail =
    document.getElementById("editEmail");

const themeButton =
    document.getElementById("themeButton");


/* =====================================================
   CARREGAR PERFIL
===================================================== */

function carregarPerfil() {
    const nome = usuarioLogado.nome || "Usuário";
    const email = usuarioLogado.email || "Não informado";
    const tipo = usuarioLogado.tipo || "aluno";

    /* NOME */
    profileName.textContent = nome;
    nameData.textContent = nome;

    /* E-MAIL */
    emailData.textContent = email;

    /* TIPO */
    if (tipo === "vendedor") {
        profileType.textContent = "VENDEDOR";
        typeData.textContent = "Vendedor";
        storeButton.style.display = "flex";
    } else {
        profileType.textContent = "ALUNO";
        typeData.textContent = "Aluno";
        storeButton.style.display = "none";
    }
}


/* =====================================================
   EDITAR PERFIL
===================================================== */

document
    .getElementById("editButton")
    .addEventListener(
        "click",
        function() {

            editName.value = usuarioLogado.nome || "";
            editEmail.value = usuarioLogado.email || "";


            editPanel.classList.add(
                "show"
            );


            editPanel.scrollIntoView({
                behavior: "smooth"
            });

        }
    );


/* =====================================================
   CANCELAR EDIÇÃO
===================================================== */

document
    .getElementById("cancelEdit")
    .addEventListener(
        "click",
        function() {

            editPanel.classList.remove(
                "show"
            );

        }
    );


/* =====================================================
   SALVAR PERFIL
===================================================== */

document
    .getElementById("profileForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const nome =
                editName.value.trim();

            const email =
                editEmail.value.trim();


            if (!nome || !email) {

                alert(
                    "Preencha todos os campos."
                );

                return;

            }


            // Atualizar dados do usuário
            usuarioLogado.nome = nome;
            usuarioLogado.email = email;
            localStorage.setItem("usuario", JSON.stringify(usuarioLogado));


            carregarPerfil();


            editPanel.classList.remove(
                "show"
            );


            alert(
                "Perfil atualizado com sucesso!"
            );

        }
    );


/* =====================================================
   SAIR DA CONTA
===================================================== */

document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        function() {

            const confirmar =
                confirm(
                    "Deseja sair da sua conta?"
                );


            if (!confirmar) return;

            localStorage.removeItem("token");
            localStorage.removeItem("usuario");

            window.location.href = "conta.html";

        }
    );


/* =====================================================
   MODO CLARO / ESCURO
===================================================== */

function carregarTema() {

    const tema =
        localStorage.getItem("tema");


    if (tema === "escuro") {

        document.body.classList.add(
            "dark"
        );

        themeButton.textContent =
            "☀️";

    } else {

        document.body.classList.remove(
            "dark"
        );

        themeButton.textContent =
            "🌙";

    }

}


themeButton.addEventListener(
    "click",
    function() {

        document.body.classList.toggle(
            "dark"
        );


        const escuro =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            "tema",
            escuro
                ? "escuro"
                : "claro"
        );


        themeButton.textContent =
            escuro
                ? "☀️"
                : "🌙";

    }
);


/* =====================================================
   INICIAR
===================================================== */

carregarPerfil();

carregarTema();