/* =====================================================
   AULAS
===================================================== */

const aulas = [

    {
        id: 1,
        nome: "Fundamentos do Judô",
        nivel: "Iniciante",
        professor: "Instrutor Judô World",
        duracao: "25 min",
        icone: "🥋",
        descricao:
            "Conheça os principais fundamentos do judô."
    },

    {
        id: 2,
        nome: "Quedas - Ukemi",
        nivel: "Iniciante",
        professor: "Instrutor Judô World",
        duracao: "20 min",
        icone: "🤼",
        descricao:
            "Aprenda a executar quedas com segurança."
    },

    {
        id: 3,
        nome: "O-Goshi",
        nivel: "Iniciante",
        professor: "Instrutor Judô World",
        duracao: "18 min",
        icone: "🥋",
        descricao:
            "Aprenda a técnica O-Goshi passo a passo."
    },

    {
        id: 4,
        nome: "Ippon Seoi Nage",
        nivel: "Intermediário",
        professor: "Instrutor Judô World",
        duracao: "28 min",
        icone: "🥋",
        descricao:
            "Estude os principais detalhes da técnica."
    },

    {
        id: 5,
        nome: "Osoto Gari",
        nivel: "Intermediário",
        professor: "Instrutor Judô World",
        duracao: "24 min",
        icone: "🥋",
        descricao:
            "Aprenda entradas e finalizações do Osoto Gari."
    },

    {
        id: 6,
        nome: "Combinações de Golpes",
        nivel: "Avançado",
        professor: "Instrutor Judô World",
        duracao: "35 min",
        icone: "🥋",
        descricao:
            "Treine combinações avançadas de técnicas."
    },

    {
        id: 7,
        nome: "Estratégia de Competição",
        nivel: "Avançado",
        professor: "Instrutor Judô World",
        duracao: "40 min",
        icone: "🏆",
        descricao:
            "Estratégias para melhorar seu desempenho."
    },

    {
        id: 8,
        nome: "Treino de Pegada",
        nivel: "Intermediário",
        professor: "Instrutor Judô World",
        duracao: "22 min",
        icone: "🥋",
        descricao:
            "Melhore sua pegada e controle durante a luta."
    }

];


/* =====================================================
   ELEMENTOS
===================================================== */

const lessons =
    document.getElementById("lessons");

const empty =
    document.getElementById("empty");

const searchInput =
    document.getElementById("searchInput");

const levelFilter =
    document.getElementById("levelFilter");

const themeButton =
    document.getElementById("themeButton");


/* =====================================================
   MOSTRAR AULAS
===================================================== */

function mostrarAulas() {

    const pesquisa =
        searchInput.value
            .toLowerCase()
            .trim();

    const nivel =
        levelFilter.value;


    lessons.innerHTML = "";


    const filtradas =
        aulas.filter(function(aula) {

            const nome =
                aula.nome.toLowerCase();

            const descricao =
                aula.descricao.toLowerCase();


            const pesquisaOK =
                nome.includes(pesquisa) ||
                descricao.includes(pesquisa);


            const nivelOK =
                nivel === "todos" ||
                aula.nivel === nivel;


            return pesquisaOK &&
                   nivelOK;

        });


    if (filtradas.length === 0) {

        empty.style.display = "block";

        return;

    }


    empty.style.display = "none";


    filtradas.forEach(function(aula) {

        const card =
            document.createElement("article");

        card.className =
            "lesson-card";


        card.innerHTML = `

            <div class="lesson-cover">

                ${aula.icone}

            </div>


            <div class="lesson-info">

                <div class="lesson-level">

                    ${aula.nivel}

                </div>


                <h2 class="lesson-name">

                    ${aula.nome}

                </h2>


                <p class="lesson-description">

                    ${aula.descricao}

                </p>


                <div class="lesson-meta">

                    <span>
                        👨‍🏫 ${aula.professor}
                    </span>

                    <span>
                        ⏱️ ${aula.duracao}
                    </span>

                </div>


                <button
                    class="lesson-button"
                    onclick="abrirAula(${aula.id})">

                    ▶ Assistir aula

                </button>

            </div>

        `;


        lessons.appendChild(card);

    });

}


/* =====================================================
   ABRIR AULA
===================================================== */

function abrirAula(id) {

    window.location.href =
        "aula.html?id=" + id;

}


/* =====================================================
   PESQUISA
===================================================== */

searchInput.addEventListener(
    "input",
    mostrarAulas
);


/* =====================================================
   FILTRO
===================================================== */

levelFilter.addEventListener(
    "change",
    mostrarAulas
);


/* =====================================================
   BOTÃO PESQUISA
===================================================== */

function focarPesquisa() {

    searchInput.focus();

    searchInput.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =====================================================
   MODO ESCURO / CLARO
===================================================== */

function carregarTema() {

    const tema =
        localStorage.getItem("tema");


    if (tema === "escuro") {

        document.body.classList.add("dark");

        themeButton.textContent =
            "☀️";

    } else {

        document.body.classList.remove("dark");

        themeButton.textContent =
            "🌙";

    }

}


themeButton.addEventListener(
    "click",
    function() {

        document.body.classList.toggle("dark");


        const escuro =
            document.body.classList.contains("dark");


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

carregarTema();

mostrarAulas();