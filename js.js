const body = document.getElementById("body");
const darkIcon = document.getElementById("dark");
const lightIcon = document.getElementById("light");
const DEV_API_URL = 'http://localhost:3000';
const BACKEND_CHECK_RETRIES = 5;
const BACKEND_CHECK_RETRY_MS = 1200;
const originHost = window.location.hostname;
const isLocalDevHost = window.location.protocol === 'file:'
    || originHost === '127.0.0.1'
    || originHost === 'localhost'
    || originHost.endsWith('.github.io')
    || originHost === 'judo-world-br.vercel.app';
const API_BASE_URL = isLocalDevHost ? DEV_API_URL : window.location.origin;

if (body) {
    if (darkIcon && lightIcon) {
        darkIcon.addEventListener("click", () => {
            body.classList.add("dark-mode");
            localStorage.setItem("tema", "dark");

            darkIcon.style.display = "none";
            lightIcon.style.display = "block";
        });

        lightIcon.addEventListener("click", () => {
            body.classList.remove("dark-mode");
            localStorage.setItem("tema", "light");

            darkIcon.style.display = "block";
            lightIcon.style.display = "none";
        });
    }

    const temaSalvo = localStorage.getItem("tema");

    if (temaSalvo === "dark") {
        body.classList.add("dark-mode");
        if (darkIcon) darkIcon.style.display = "none";
        if (lightIcon) lightIcon.style.display = "block";
    } else {
        body.classList.remove("dark-mode");
        if (darkIcon) darkIcon.style.display = "block";
        if (lightIcon) lightIcon.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    checkBackendConnection();
    if (typeof loadProfileFromStorage === "function") {
        loadProfileFromStorage();
    }
    if (typeof showAulasByFaixa === "function") {
        showAulasByFaixa();
    }
});

function setServerStatus(isOnline) {
    const mensagemEl = document.getElementById('mensagem');
    const loginBtn = document.querySelector('button[onclick="login()"]');
    const registerBtn = document.querySelector('button[onclick="cadastrar()"]');

    if (!loginBtn || !registerBtn) return;

    loginBtn.disabled = !isOnline;
    registerBtn.disabled = !isOnline;

    if (mensagemEl) {
        mensagemEl.innerHTML = isOnline
            ? ''
            : 'Servidor offline. Inicie o backend com npm start e abra a página em http://localhost:3000/conta.html';
    }
}

function checkBackendConnection(retry = 0) {
    fetch(`${API_BASE_URL}/`, { method: 'HEAD' })
        .then(() => setServerStatus(true))
        .catch(() => {
            if (retry < BACKEND_CHECK_RETRIES) {
                setTimeout(() => checkBackendConnection(retry + 1), BACKEND_CHECK_RETRY_MS);
            } else {
                setServerStatus(false);
            }
        });
}

function abrirMenu(){
    const linksNav = document.getElementById("linksNav");
    const menuButton = document.querySelector(".menu-mobile");
    const isOpen = linksNav.classList.toggle("ativo");

    if (menuButton) {
        menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
}

function cadastrar() {
    let nome = document.getElementById("CadastroNome").value;
    let email = document.getElementById("Cadastroemail").value;
    let senha = document.getElementById("CadastroSenha").value;
    let confirmar = document.getElementById("ConfirmarSenha").value;
    let faixa = document.getElementById("cadastroFaixa").value;
    let role = document.getElementById("cadastroRole").value;

    const mensagemEl = document.getElementById("mensagem");

    if (nome == "" || email == "" || senha == "" || confirmar == "" || role == "") {
        if (mensagemEl) mensagemEl.innerHTML = "Preencha tudo";
        return;
    }

    if (senha != confirmar) {
        if (mensagemEl) mensagemEl.innerHTML = "As senhas não coincidem";
        return;
    }

    fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, email, senha, faixa, role })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            if (mensagemEl) mensagemEl.innerHTML = "Cadastro realizado!";
            localStorage.setItem("faixa", faixa);
            if (typeof showAulasByFaixa === "function") {
                showAulasByFaixa();
            }
        } else {
            if (mensagemEl) mensagemEl.innerHTML = data.message || "Erro no cadastro";
        }
    })
    .catch(error => {
        if (mensagemEl) {
            mensagemEl.innerHTML = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:3000';
        }
        checkBackendConnection();
    });
}
function login(){
    const email = document.getElementById("loginemail").value;
    const senha = document.getElementById("loginSenha").value;
    const mensagemEl = document.getElementById('mensagem');

    fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            if (mensagemEl) mensagemEl.innerHTML = 'Login feito com sucesso!';
            if (data.user && data.user.faixa) localStorage.setItem('faixa', data.user.faixa);
            if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
            if (typeof showProfile === "function") {
                showProfile(data.user);
            } else {
                setTimeout(() => { window.location.href = 'conta.html'; }, 800);
            }
        } else {
            if (mensagemEl) mensagemEl.innerHTML = data.message || 'Email ou senha incorretos';
        }
    })
    .catch(() => {
        if (mensagemEl) {
            mensagemEl.innerHTML = 'Não foi possível conectar ao servidor. Inicie o backend com npm start e abra a página em http://localhost:3000/conta.html';
        }
    });
}

function showProfile(user) {
    const loginForm = document.getElementById('login-form');
    const perfilSection = document.getElementById('perfil');
    const nomeEl = document.getElementById('perfil-nome');
    const emailEl = document.getElementById('perfil-email');
    const faixaEl = document.getElementById('perfil-faixa');
    const roleEl = document.getElementById('perfil-role');
    const mensagemEl = document.getElementById('mensagem');

    if (!perfilSection || !nomeEl || !emailEl || !faixaEl || !roleEl) return;

    const profile = user || JSON.parse(localStorage.getItem('user') || 'null');
    if (!profile) return;

    if (loginForm) loginForm.style.display = 'none';
    perfilSection.style.display = 'block';

    nomeEl.textContent = profile.nome || '';
    emailEl.textContent = profile.email || '';
    faixaEl.textContent = profile.faixa || 'Sem faixa';
    roleEl.textContent = profile.role || 'Usuário';
    if (mensagemEl) mensagemEl.innerHTML = '';
}

function loadProfileFromStorage() {
    const profile = JSON.parse(localStorage.getItem('user') || 'null');
    if (profile) {
        showProfile(profile);
    }
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('faixa');
    const loginForm = document.getElementById('login-form');
    const perfilSection = document.getElementById('perfil');
    const mensagemEl = document.getElementById('mensagem');

    if (loginForm) loginForm.style.display = 'block';
    if (perfilSection) perfilSection.style.display = 'none';
    if (mensagemEl) mensagemEl.innerHTML = 'Você saiu.';
}

function togglePasswordVisibility(inputId, element) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (element && element.tagName === 'INPUT' && element.type === 'checkbox') {
        input.type = element.checked ? 'text' : 'password';
        return;
    }

    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    if (element && element.tagName === 'IMG') {
        element.src = isPassword ? 'imagens/olho(1).png' : 'imagens/olho.png';
        element.alt = isPassword ? 'Esconder senha' : 'Mostrar senha';
        element.title = isPassword ? 'Esconder senha' : 'Mostrar senha';
    }
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

/* Carousel with arrows (manual control) */
function initCarousel() {
    const carousel = document.getElementById('main-carousel');
    if (!carousel) return;
    const track = carousel.querySelector('.carousel-animated');
    const slides = Array.from(track.querySelectorAll('img'));
    let index = 0;

    function update() {
        track.style.transform = `translateX(-${index * 100}%)`;
    }

    const prev = carousel.querySelector('.carousel-prev');
    const next = carousel.querySelector('.carousel-next');

    prev && prev.addEventListener('click', () => {
        index = (index - 1 + slides.length) % slides.length;
        update();
    });

    next && next.addEventListener('click', () => {
        index = (index + 1) % slides.length;
        update();
    });

    // allow keyboard navigation
    carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prev && prev.click();
        if (e.key === 'ArrowRight') next && next.click();
    });

    // make focusable
    carousel.setAttribute('tabindex', '0');
    // initial update
    update();
}

document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
});


function showAulasByFaixa() {
    const faixa = localStorage.getItem('faixa');

    const aulasCinza = document.getElementById('aulas-cinza');
    const aulasAzul = document.getElementById('aulas-azul');
    const aulasAmarela = document.getElementById('aulas-amarela');
    const aulasLaranja = document.getElementById('aulas-laranja');
    const aulasVerde = document.getElementById('aulas-verde');
    const aulasRoxo = document.getElementById('aulas-roxo');
    const aulasMarrom = document.getElementById('aulas-marrom');

    const aulas = [
        aulasCinza,
        aulasAzul,
        aulasAmarela,
        aulasLaranja,
        aulasVerde,
        aulasRoxo,
        aulasMarrom
    ];

    aulas.forEach(el => {
        if (el) el.style.display = 'none';
    });

    if (faixa === 'cinza' && aulasCinza) aulasCinza.style.display = 'block';
    if (faixa === 'azul' && aulasAzul) aulasAzul.style.display = 'block';
    if (faixa === 'amarela' && aulasAmarela) aulasAmarela.style.display = 'block';
    if (faixa === 'laranja' && aulasLaranja) aulasLaranja.style.display = 'block';
    if (faixa === 'verde' && aulasVerde) aulasVerde.style.display = 'block';
    if (faixa === 'roxa' && aulasRoxo) aulasRoxo.style.display = 'block';
    if (faixa === 'marrom' && aulasMarrom) aulasMarrom.style.display = 'block';
}

