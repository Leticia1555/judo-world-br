
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