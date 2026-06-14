const body = document.getElementById("body");
const darkIcon = document.getElementById("dark");
const lightIcon = document.getElementById("light");

// Ativar modo escuro
darkIcon.addEventListener("click", () => {
    body.classList.add("dark-mode");
    localStorage.setItem("tema", "dark");

    darkIcon.style.display = "none";
    lightIcon.style.display = "block";
});

// Ativar modo claro
lightIcon.addEventListener("click", () => {
    body.classList.remove("dark-mode");
    localStorage.setItem("tema", "light");

    darkIcon.style.display = "block";
    lightIcon.style.display = "none";
});
const temaSalvo = localStorage.getItem("tema");

if (temaSalvo === "dark") {
    body.classList.add("dark-mode");
    darkIcon.style.display = "none";
    lightIcon.style.display = "block";
} else {
    body.classList.remove("dark-mode");
    darkIcon.style.display = "block";
    lightIcon.style.display = "none";
}
function abrirMenu(){
    const linksNav = document.getElementById("linksNav");
    const menuButton = document.querySelector(".menu-mobile");
    const isOpen = linksNav.classList.toggle("ativo");

    if (menuButton) {
        menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
}

function cadastrar(){

    let email = document.getElementById("Cadastroemail").value;
    let senha = document.getElementById("CadastroSenha").value;
    let confirmar = document.getElementById("ConfirmarSenha").value;
    let faixa = document.getElementById("cadastroFaixa").value;

    if(email == "" || senha == "" || confirmar == "" || faixa == ""){
        mensagem.innerHTML = "Preencha tudo";
        return;
    }

    if(senha != confirmar){
        mensagem.innerHTML = "As senhas não coincidem";
        return;
    }

    localStorage.setItem("email", email);
    localStorage.setItem("senha", senha);
    localStorage.setItem("faixa", faixa);

    mensagem.innerHTML = "Cadastro realizado!";
}

function login(){

    let email = document.getElementById("loginemail").value;
    let senha = document.getElementById("loginSenha").value;

    let emailSalvo = localStorage.getItem("email");
    let senhaSalva = localStorage.getItem("senha");

    if(email == emailSalvo && senha == senhaSalva){

        mensagem.innerHTML = "Login feito com sucesso!";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

    } else {

        mensagem.innerHTML = "Email ou senha incorretos";
    }
}

if (faixa === "branca") {
    document.getElementById("aulas-cinza").style.display = "block";
}

if (faixa === "cinza") {
    document.getElementById("aulas-amarela").style.display = "block";
}

if (faixa === "amarela") {
    document.getElementById("aulas-laranja").style.display = "block";
}

const body = document.getElementById("body");
const darkIcon = document.getElementById("dark");
const lightIcon = document.getElementById("light");

// Ativar modo escuro
darkIcon.addEventListener("click", () => {
    body.classList.add("dark-mode");
    localStorage.setItem("tema", "dark");

    darkIcon.style.display = "none";
    lightIcon.style.display = "block";
});

// Ativar modo claro
lightIcon.addEventListener("click", () => {
    body.classList.remove("dark-mode");
    localStorage.setItem("tema", "light");

    darkIcon.style.display = "block";
    lightIcon.style.display = "none";
});
const temaSalvo = localStorage.getItem("tema");

if (temaSalvo === "dark") {
    body.classList.add("dark-mode");
    darkIcon.style.display = "none";
    lightIcon.style.display = "block";
} else {
    body.classList.remove("dark-mode");
    darkIcon.style.display = "block";
    lightIcon.style.display = "none";
}
function abrirMenu(){
    document
    .getElementById("linksNav")
    .classList.toggle("ativo");
}
