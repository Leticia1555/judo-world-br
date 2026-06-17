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

    let nome = document.getElementById("CadastroNome").value;
    let email = document.getElementById("Cadastroemail").value;
    let senha = document.getElementById("CadastroSenha").value;
    let confirmar = document.getElementById("ConfirmarSenha").value;
    let faixa = document.getElementById("cadastroFaixa").value;

    if(nome == "" || email == "" || senha == "" || confirmar == "" || faixa == ""){
        const mensagemEl = document.getElementById('mensagem');
        if (mensagemEl) mensagemEl.innerHTML = "Preencha tudo";
        return;
    }

    if(senha != confirmar){
        const mensagemEl = document.getElementById('mensagem');
        if (mensagemEl) mensagemEl.innerHTML = "As senhas não coincidem";
        return;
    }

    // Envia para API
    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, faixa })
    })
    .then(res => res.json())
    .then(data => {
        const mensagemEl = document.getElementById('mensagem');
        if (data.success) {
            if (mensagemEl) mensagemEl.innerHTML = 'Cadastro realizado!';
            localStorage.setItem('faixa', faixa);
            if (typeof showAulasByFaixa === 'function') showAulasByFaixa();
        } else {
            if (mensagemEl) mensagemEl.innerHTML = data.message || 'Erro no cadastro';
        }
    })
    .catch(() => {
        const mensagemEl = document.getElementById('mensagem');
        if (mensagemEl) mensagemEl.innerHTML = 'Erro ao conectar com o servidor';
    });
}

function login(){

    let email = document.getElementById("loginemail").value;
    let senha = document.getElementById("loginSenha").value;

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    })
    .then(res => res.json())
    .then(data => {
        const mensagemEl = document.getElementById('mensagem');
        if (data.success) {
            if (mensagemEl) mensagemEl.innerHTML = 'Login feito com sucesso!';
            // salva faixa localmente para exibir aulas
            if (data.user && data.user.faixa) localStorage.setItem('faixa', data.user.faixa);
            setTimeout(() => { window.location.href = 'index.html'; }, 800);
        } else {
            if (mensagemEl) mensagemEl.innerHTML = data.message || 'Email ou senha incorretos';
        }
    })
    .catch(() => {
        const mensagemEl = document.getElementById('mensagem');
        if (mensagemEl) mensagemEl.innerHTML = 'Erro ao conectar com o servidor';
    });
}

function showAulasByFaixa(){
    const faixa = localStorage.getItem('faixa');
    const aulasCinza = document.getElementById('aulas-cinza');
    const aulasAzul = document.getElementById('aulas-azul');
    const aulasAmarela = document.getElementById('aulas-amarela');
    const aulasLaranja = document.getElementById('aulas-laranja');
    const aulasVerde = document.getElementById('aulas-verde');
    const aulasRoxo = document.getElementById('aulas-roxo');
    const aulasMarrom = document.getElementById('aulas-marrom');

    const aulas = [aulasCinza, aulasAzul, aulasAmarela, aulasLaranja, aulasVerde, aulasRoxo, aulasMarrom];
    aulas.forEach(el => { if (el) el.style.display = 'none'; });

    if (faixa === 'cinza' && aulasCinza) aulasCinza.style.display = 'block';
    if (faixa === 'azul' && aulasAzul) aulasAzul.style.display = 'block';
    if (faixa === 'amarela' && aulasAmarela) aulasAmarela.style.display = 'block';
    if (faixa === 'laranja' && aulasLaranja) aulasLaranja.style.display = 'block';
    if (faixa === 'verde' && aulasVerde) aulasVerde.style.display = 'block';
    if (faixa === 'roxa' && aulasRoxo) aulasRoxo.style.display = 'block';
    if (faixa === 'marrom' && aulasMarrom) aulasMarrom.style.display = 'block';
}

// Executa ao carregar a página para aplicar a faixa salva
document.addEventListener('DOMContentLoaded', showAulasByFaixa);
