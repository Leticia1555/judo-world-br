/* =====================================================
   VERIFICAR AUTENTICAÇÃO
===================================================== */

let usuarioLogado = null;

const usuarioJson = localStorage.getItem("usuario");

if (usuarioJson) {
    try {
        usuarioLogado = JSON.parse(usuarioJson);

        console.log(
            "✓ Usuário logado:",
            usuarioLogado.nome,
            "(" + usuarioLogado.tipo + ")"
        );

    } catch (error) {
        console.error("Erro ao parsear usuário:", error);
    }
}


/* =====================================================
   DADOS DOS PRODUTOS
===================================================== */

let produtos = [];

try {

    produtos = JSON.parse(
        localStorage.getItem("produtosJudo")
    ) || [];

} catch (error) {

    console.error(
        "Erro ao carregar produtos:",
        error
    );

    produtos = [];

}


/* =====================================================
   PRODUTOS PADRÃO
===================================================== */

if (!Array.isArray(produtos) || produtos.length === 0) {

    produtos = [

        {
            id: 1,
            nome: "Kimono Judo",
            categoria: "Kimonos",
            preco: 199.90,
            icone: "🥋",
            descricao: "Kimono resistente para treino."
        },

        {
            id: 2,
            nome: "Faixa Preta",
            categoria: "Faixas",
            preco: 49.90,
            icone: "🥋",
            descricao: "Faixa para graduação."
        },

        {
            id: 3,
            nome: "Saco de Treino",
            categoria: "Equipamentos",
            preco: 129.90,
            icone: "🥊",
            descricao: "Equipamento para treinamento."
        },

        {
            id: 4,
            nome: "Camiseta Judô",
            categoria: "Roupas",
            preco: 69.90,
            icone: "👕",
            descricao: "Camiseta oficial Judô World."
        }

    ];

    localStorage.setItem(
        "produtosJudo",
        JSON.stringify(produtos)
    );
}


/* =====================================================
   ELEMENTOS
===================================================== */

const products =
    document.getElementById("products");

const empty =
    document.getElementById("empty");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const sellerPanel =
    document.getElementById("sellerPanel");

const sellerButton =
    document.getElementById("sellerButton");

const themeButton =
    document.getElementById("themeButton");

const cartCount =
    document.getElementById("cartCount");


/* =====================================================
   API
===================================================== */

/*
   Corrigido para não quebrar caso
   API_BASE_URL não exista.
*/

const API_BASE =
    typeof API_BASE_URL !== "undefined"
        ? API_BASE_URL
        : "/api";


function getToken() {

    return localStorage.getItem("token");

}


/* =====================================================
   TIPO DE USUÁRIO
===================================================== */

const tipoUsuario =
    usuarioLogado
        ? usuarioLogado.tipo
        : "aluno";


/* =====================================================
   MOSTRAR ÁREA DO VENDEDOR
===================================================== */

if (
    tipoUsuario === "vendedor" &&
    sellerButton
) {

    sellerButton.style.display = "flex";

}


/* =====================================================
   BOTÃO MINHA LOJA
===================================================== */

if (sellerButton) {

    sellerButton.addEventListener(
        "click",
        function () {

            if (!sellerPanel) return;

            sellerPanel.classList.toggle("show");

            if (
                sellerPanel.classList.contains("show")
            ) {

                sellerPanel.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

}


/* =====================================================
   FORMATAR PREÇO
===================================================== */

function formatarPreco(valor) {

    const numero = Number(valor);

    if (isNaN(numero)) {
        return "R$ 0,00";
    }

    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* =====================================================
   ABRIR PRODUTO
===================================================== */

function abrirProduto(id) {

    window.location.href =
        "produto.html?id=" +
        encodeURIComponent(id);

}


/* =====================================================
   RENDERIZAR PRODUTOS
===================================================== */

function mostrarProdutos() {

    if (!products) return;


    const pesquisa =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const categoria =
        categoryFilter
            ? categoryFilter.value
            : "todos";


    products.innerHTML = "";


    const filtrados =
        produtos.filter(
            function (produto) {

                const nome =
                    String(
                        produto.nome || ""
                    )
                    .toLowerCase();


                const descricao =
                    String(
                        produto.descricao || ""
                    )
                    .toLowerCase();


                const pesquisaOK =
                    nome.includes(pesquisa) ||
                    descricao.includes(pesquisa);


                const categoriaOK =
                    categoria === "todos" ||
                    produto.categoria === categoria;


                return (
                    pesquisaOK &&
                    categoriaOK
                );

            }
        );


    /* =================================================
       NENHUM PRODUTO
    ================================================= */

    if (filtrados.length === 0) {

        if (empty) {

            empty.style.display = "block";

        }

        return;

    }


    if (empty) {

        empty.style.display = "none";

    }


    /* =================================================
       CRIAR CARDS
    ================================================= */

    filtrados.forEach(
        function (produto) {

            const card =
                document.createElement("article");


            card.className =
                "product-card";


            const idProduto =
                produto.id;


            card.innerHTML = `

                <button
                    class="product-click"
                    onclick="abrirProduto(${JSON.stringify(idProduto)})"
                    aria-label="Ver ${produto.nome}">

                    <div class="product-image">

                        ${produto.icone || "🥋"}

                    </div>

                </button>


                <div class="product-info">


                    <div class="product-category">

                        ${produto.categoria || "Produto"}

                    </div>


                    <h2 class="product-name">

                        ${produto.nome || "Produto"}

                    </h2>


                    <p class="product-description">

                        ${produto.descricao || ""}

                    </p>


                    <div class="product-bottom">


                        <strong class="product-price">

                            ${formatarPreco(produto.preco)}

                        </strong>


                        <button
                            class="buy-button"
                            type="button"
                            onclick="abrirProduto(${JSON.stringify(idProduto)})">

                            Ver produto

                        </button>


                        <button
                            class="buy-button"
                            type="button"
                            onclick="adicionarAoCarrinho(${JSON.stringify(idProduto)})">

                            🛒 Adicionar ao carrinho

                        </button>


                    </div>


                    ${
                        tipoUsuario === "vendedor"
                            ? `

                                <div class="seller-actions">

                                    <button
                                        class="edit-button"
                                        type="button"
                                        onclick="editarProduto(${JSON.stringify(idProduto)})">

                                        ✏️ Editar

                                    </button>


                                    <button
                                        class="delete-button"
                                        type="button"
                                        onclick="excluirProduto(${JSON.stringify(idProduto)})">

                                        🗑️ Excluir

                                    </button>

                                </div>

                            `
                            : ""
                    }


                </div>

            `;


            products.appendChild(card);

        }
    );

}


/* =====================================================
   PESQUISA
===================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        mostrarProdutos
    );

}


/* =====================================================
   FILTRO
===================================================== */

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        mostrarProdutos
    );

}


/* =====================================================
   FOCAR PESQUISA
===================================================== */

function focarPesquisa() {

    if (!searchInput) return;


    searchInput.focus();


    searchInput.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =====================================================
   SALVAR LOJA
===================================================== */

const storeForm =
    document.getElementById("storeForm");


if (storeForm) {

    storeForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const storeName =
                document.getElementById(
                    "storeName"
                );


            const storeDescription =
                document.getElementById(
                    "storeDescription"
                );


            const nome =
                storeName
                    ? storeName.value.trim()
                    : "";


            const descricao =
                storeDescription
                    ? storeDescription.value.trim()
                    : "";


            if (!nome) {

                alert(
                    "Digite o nome da loja."
                );

                return;

            }


            const token =
                getToken();


            /* =========================================
               SALVAR NO SERVIDOR
            ========================================= */

            if (token) {

                try {

                    const res =
                        await fetch(
                            `${API_BASE}/minha-loja`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${token}`
                                },

                                body:
                                    JSON.stringify({
                                        nome,
                                        descricao
                                    })
                            }
                        );


                    let data = {};

                    try {

                        data =
                            await res.json();

                    } catch (e) {

                        data = {};

                    }


                    if (!res.ok) {

                        alert(
                            data.erro ||
                            "Erro ao salvar loja."
                        );

                        return;

                    }


                    localStorage.setItem(
                        "nomeLoja",
                        nome
                    );


                    localStorage.setItem(
                        "descricaoLoja",
                        descricao
                    );


                    atualizarLoja();


                    alert(
                        "Loja salva com sucesso!"
                    );


                } catch (err) {

                    console.error(
                        "Erro ao salvar loja:",
                        err
                    );


                    /*
                       Se o servidor estiver indisponível,
                       mantém os dados localmente.
                    */

                    localStorage.setItem(
                        "nomeLoja",
                        nome
                    );


                    localStorage.setItem(
                        "descricaoLoja",
                        descricao
                    );


                    atualizarLoja();


                    alert(
                        "Não foi possível conectar ao servidor. " +
                        "A loja foi salva localmente."
                    );

                }


                return;

            }


            /* =========================================
               FALLBACK LOCAL
            ========================================= */

            localStorage.setItem(
                "nomeLoja",
                nome
            );


            localStorage.setItem(
                "descricaoLoja",
                descricao
            );


            atualizarLoja();


            alert(
                "Loja salva localmente. " +
                "Faça login para salvar no servidor."
            );

        }
    );

}


/* =====================================================
   ATUALIZAR LOJA
===================================================== */

function atualizarLoja() {

    const nome =
        localStorage.getItem(
            "nomeLoja"
        );


    const descricao =
        localStorage.getItem(
            "descricaoLoja"
        );


    const displayStoreName =
        document.getElementById(
            "displayStoreName"
        );


    const storeName =
        document.getElementById(
            "storeName"
        );


    const displayStoreDescription =
        document.getElementById(
            "displayStoreDescription"
        );


    const storeDescription =
        document.getElementById(
            "storeDescription"
        );


    if (nome) {

        if (displayStoreName) {

            displayStoreName.textContent =
                nome;

        }


        if (storeName) {

            storeName.value =
                nome;

        }

    }


    if (descricao !== null) {

        if (displayStoreDescription) {

            displayStoreDescription.textContent =
                descricao;

        }


        if (storeDescription) {

            storeDescription.value =
                descricao;

        }

    }

}


/* =====================================================
   ADICIONAR PRODUTO
===================================================== */

const productForm =
    document.getElementById(
        "productForm"
    );


if (productForm) {

    productForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const productName =
                document.getElementById(
                    "productName"
                );


            const productCategory =
                document.getElementById(
                    "productCategory"
                );


            const productPrice =
                document.getElementById(
                    "productPrice"
                );


            const productIcon =
                document.getElementById(
                    "productIcon"
                );


            const productDescription =
                document.getElementById(
                    "productDescription"
                );


            const nome =
                productName
                    ? productName.value.trim()
                    : "";


            const categoria =
                productCategory
                    ? productCategory.value
                    : "Produtos";


            const preco =
                productPrice
                    ? Number(
                        String(
                            productPrice.value
                        ).replace(",", ".")
                    )
                    : 0;


            const icone =
                productIcon
                    ? (
                        productIcon.value.trim() ||
                        "🥋"
                    )
                    : "🥋";


            const descricao =
                productDescription
                    ? productDescription.value.trim()
                    : "";


            if (
                !nome ||
                !isFinite(preco) ||
                preco <= 0
            ) {

                alert(
                    "Preencha o nome e um preço válido."
                );

                return;

            }


            const token =
                getToken();


            /* =========================================
               SERVIDOR
            ========================================= */

            if (token) {

                try {

                    const res =
                        await fetch(
                            `${API_BASE}/produtos`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${token}`
                                },

                                body:
                                    JSON.stringify({
                                        nome,
                                        descricao,
                                        preco,
                                        imagem: icone,
                                        estoque: 10
                                    })
                            }
                        );


                    let data = {};

                    try {

                        data =
                            await res.json();

                    } catch (e) {

                        data = {};

                    }


                    if (!res.ok) {

                        alert(
                            data.erro ||
                            "Erro ao criar produto."
                        );

                        return;

                    }


                    const novoProduto = {

                        id: Date.now(),

                        backendId:
                            data.id,

                        nome,

                        categoria,

                        preco,

                        icone,

                        descricao

                    };


                    produtos.push(
                        novoProduto
                    );


                    localStorage.setItem(
                        "produtosJudo",
                        JSON.stringify(produtos)
                    );


                    productForm.reset();


                    if (productIcon) {

                        productIcon.value =
                            "🥋";

                    }


                    mostrarProdutos();


                    atualizarCarrinho();


                    alert(
                        "Produto adicionado com sucesso!"
                    );


                } catch (err) {

                    console.error(
                        "Erro de rede:",
                        err
                    );


                    /*
                       Caso a API não esteja disponível,
                       salva localmente.
                    */

                    const novoProduto = {

                        id: Date.now(),

                        nome,

                        categoria,

                        preco,

                        icone,

                        descricao

                    };


                    produtos.push(
                        novoProduto
                    );


                    localStorage.setItem(
                        "produtosJudo",
                        JSON.stringify(produtos)
                    );


                    productForm.reset();


                    if (productIcon) {

                        productIcon.value =
                            "🥋";

                    }


                    mostrarProdutos();


                    alert(
                        "Servidor indisponível. " +
                        "Produto salvo localmente."
                    );

                }


                return;

            }


            /* =========================================
               LOCAL
            ========================================= */

            const novoProduto = {

                id: Date.now(),

                nome,

                categoria,

                preco,

                icone,

                descricao

            };


            produtos.push(
                novoProduto
            );


            localStorage.setItem(
                "produtosJudo",
                JSON.stringify(produtos)
            );


            productForm.reset();


            if (productIcon) {

                productIcon.value =
                    "🥋";

            }


            mostrarProdutos();


            alert(
                "Produto adicionado localmente. " +
                "Faça login para salvar no servidor."
            );

        }
    );

}


/* =====================================================
   EDITAR PRODUTO
===================================================== */

function editarProduto(id) {

    const produto =
        produtos.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!produto) {

        alert(
            "Produto não encontrado."
        );

        return;

    }


    const novoNome =
        prompt(
            "Nome do produto:",
            produto.nome
        );


    if (novoNome === null) {

        return;

    }


    const novoPrecoStr =
        prompt(
            "Preço:",
            produto.preco
        );


    if (novoPrecoStr === null) {

        return;

    }


    const preco =
        Number(
            String(
                novoPrecoStr
            ).replace(",", ".")
        );


    if (
        !novoNome.trim() ||
        !isFinite(preco) ||
        preco <= 0
    ) {

        alert(
            "Dados inválidos."
        );

        return;

    }


    const token =
        getToken();


    /* =========================================
       SERVIDOR
    ========================================= */

    if (
        token &&
        produto.backendId
    ) {

        fetch(
            `${API_BASE}/produtos/${produto.backendId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`
                },

                body:
                    JSON.stringify({
                        nome:
                            novoNome.trim(),

                        preco
                    })
            }
        )
        .then(
            async function (res) {

                let data = {};

                try {

                    data =
                        await res.json();

                } catch (e) {

                    data = {};

                }


                if (!res.ok) {

                    alert(
                        data.erro ||
                        "Erro ao editar produto."
                    );

                    return;

                }


                produto.nome =
                    novoNome.trim();


                produto.preco =
                    preco;


                localStorage.setItem(
                    "produtosJudo",
                    JSON.stringify(produtos)
                );


                mostrarProdutos();

            }
        )
        .catch(
            function (err) {

                console.error(err);


                /*
                   Mesmo se a API falhar,
                   atualiza localmente.
                */

                produto.nome =
                    novoNome.trim();


                produto.preco =
                    preco;


                localStorage.setItem(
                    "produtosJudo",
                    JSON.stringify(produtos)
                );


                mostrarProdutos();


                alert(
                    "Servidor indisponível. " +
                    "Produto atualizado localmente."
                );

            }
        );


        return;

    }


    /* =========================================
       LOCAL
    ========================================= */

    produto.nome =
        novoNome.trim();


    produto.preco =
        preco;


    localStorage.setItem(
        "produtosJudo",
        JSON.stringify(produtos)
    );


    mostrarProdutos();

}


/* =====================================================
   EXCLUIR PRODUTO
===================================================== */

function excluirProduto(id) {

    const confirmar =
        confirm(
            "Deseja realmente excluir este produto?"
        );


    if (!confirmar) {

        return;

    }


    const produto =
        produtos.find(
            p => p.id === id
        );


    if (!produto) {

        alert(
            "Produto não encontrado."
        );

        return;

    }


    const token =
        getToken();


    /* =========================================
       SERVIDOR
    ========================================= */

    if (
        token &&
        produto.backendId
    ) {

        fetch(
            `${API_BASE}/produtos/${produto.backendId}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        )
        .then(
            async function (res) {

                let data = {};

                try {

                    data =
                        await res.json();

                } catch (e) {

                    data = {};

                }


                if (!res.ok) {

                    alert(
                        data.erro ||
                        "Erro ao excluir produto."
                    );

                    return;

                }


                produtos =
                    produtos.filter(
                        p => p.id !== id
                    );


                localStorage.setItem(
                    "produtosJudo",
                    JSON.stringify(produtos)
                );


                /*
                   Também remove do carrinho
                   caso o produto esteja lá.
                */

                removerProdutoDoCarrinho(id);


                mostrarProdutos();


                atualizarCarrinho();

            }
        )
        .catch(
            function (err) {

                console.error(err);


                produtos =
                    produtos.filter(
                        p => p.id !== id
                    );


                localStorage.setItem(
                    "produtosJudo",
                    JSON.stringify(produtos)
                );


                removerProdutoDoCarrinho(id);


                mostrarProdutos();


                atualizarCarrinho();


                alert(
                    "Servidor indisponível. " +
                    "Produto excluído localmente."
                );

            }
        );


        return;

    }


    /* =========================================
       LOCAL
    ========================================= */

    produtos =
        produtos.filter(
            function (produto) {

                return produto.id !== id;

            }
        );


    localStorage.setItem(
        "produtosJudo",
        JSON.stringify(produtos)
    );


    removerProdutoDoCarrinho(id);


    mostrarProdutos();


    atualizarCarrinho();

}


/* =====================================================
   ADICIONAR AO CARRINHO
===================================================== */

function adicionarAoCarrinho(id) {

    const produto =
        produtos.find(
            p => p.id === id
        );


    if (!produto) {

        alert(
            "Produto não encontrado."
        );

        return;

    }


    let carrinho = [];


    try {

        carrinho =
            JSON.parse(
                localStorage.getItem(
                    "carrinhoJudo"
                ) || "[]"
            );


        if (!Array.isArray(carrinho)) {

            carrinho = [];

        }

    } catch (error) {

        console.error(
            "Erro ao carregar carrinho:",
            error
        );

        carrinho = [];

    }


    const existente =
        carrinho.find(
            item =>
                item.id === produto.id
        );


    /* =========================================
       JÁ EXISTE
    ========================================= */

    if (existente) {

        existente.quantidade =
            Number(
                existente.quantidade || 1
            ) + 1;

    }


    /* =========================================
       NOVO PRODUTO
    ========================================= */

    else {

        carrinho.push({

            id:
                produto.id,

            backendId:
                produto.backendId || null,

            nome:
                produto.nome,

            categoria:
                produto.categoria ||
                "Produto",

            preco:
                Number(produto.preco),

            icone:
                produto.icone ||
                "🥋",

            descricao:
                produto.descricao ||
                "",

            quantidade:
                1

        });

    }


    localStorage.setItem(
        "carrinhoJudo",
        JSON.stringify(carrinho)
    );


    atualizarCarrinho();


    alert(
        "Produto adicionado ao carrinho!"
    );

}


/* =====================================================
   REMOVER PRODUTO DO CARRINHO
===================================================== */

function removerProdutoDoCarrinho(id) {

    let carrinho = [];


    try {

        carrinho =
            JSON.parse(
                localStorage.getItem(
                    "carrinhoJudo"
                ) || "[]"
            );


        if (!Array.isArray(carrinho)) {

            carrinho = [];

        }

    } catch (error) {

        carrinho = [];

    }


    carrinho =
        carrinho.filter(
            item => item.id !== id
        );


    localStorage.setItem(
        "carrinhoJudo",
        JSON.stringify(carrinho)
    );


    atualizarCarrinho();

}


/* =====================================================
   ATUALIZAR CONTADOR DO CARRINHO
===================================================== */

function atualizarCarrinho() {

    let carrinho = [];


    try {

        carrinho =
            JSON.parse(
                localStorage.getItem(
                    "carrinhoJudo"
                ) || "[]"
            );


        if (!Array.isArray(carrinho)) {

            carrinho = [];

        }

    } catch (error) {

        console.error(
            "Erro ao ler carrinho:",
            error
        );

        carrinho = [];

    }


    const total =
        carrinho.reduce(
            function (soma, item) {

                return (
                    soma +
                    Number(
                        item.quantidade || 1
                    )
                );

            },
            0
        );


    /*
       Só tenta alterar o contador
       se ele realmente existir.
    */

    if (cartCount) {

        cartCount.textContent =
            total;


        cartCount.style.display =
            total > 0
                ? "flex"
                : "none";

    }

}


/* =====================================================
   MODO CLARO / ESCURO
===================================================== */

function carregarTema() {

    const tema =
        localStorage.getItem(
            "tema"
        );


    if (tema === "escuro") {

        document.body.classList.add(
            "dark"
        );


        if (themeButton) {

            themeButton.textContent =
                "☀️";

        }

    }

    else {

        document.body.classList.remove(
            "dark"
        );


        if (themeButton) {

            themeButton.textContent =
                "🌙";

        }

    }

}


/* =====================================================
   BOTÃO TEMA
===================================================== */

if (themeButton) {

    themeButton.addEventListener(
        "click",
        function () {

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

}


/* =====================================================
   CARREGAR DADOS DA API
===================================================== */

async function loadFromApi() {

    try {

        const res =
            await fetch(
                `${API_BASE}/lojas`
            );


        if (!res.ok) {

            return;

        }


        const data =
            await res.json();


        if (
            !data ||
            !Array.isArray(data.lojas) ||
            data.lojas.length === 0
        ) {

            return;

        }


        /*
           Escolher primeira loja
        */

        const loja =
            data.lojas[0];


        if (loja.nome) {

            localStorage.setItem(
                "nomeLoja",
                loja.nome
            );

        }


        localStorage.setItem(
            "descricaoLoja",
            loja.descricao || ""
        );


        atualizarLoja();


        /* =========================================
           PRODUTOS DA LOJA
        ========================================= */

        if (!loja.id) {

            return;

        }


        const resProd =
            await fetch(
                `${API_BASE}/lojas/${loja.id}/produtos`
            );


        if (!resProd.ok) {

            return;

        }


        const pd =
            await resProd.json();


        if (
            pd &&
            Array.isArray(pd.produtos) &&
            pd.produtos.length > 0
        ) {

            produtos =
                pd.produtos.map(
                    function (p, index) {

                        return {

                            /*
                               ID local estável durante
                               esta carga.
                            */

                            id:
                                Number(
                                    p.id
                                ),

                            backendId:
                                p.id,

                            nome:
                                p.nome,

                            categoria:
                                p.categoria ||
                                "",

                            preco:
                                Number(
                                    p.preco
                                ),

                            icone:
                                p.imagem ||
                                "🥋",

                            descricao:
                                p.descricao ||
                                ""

                        };

                    }
                );


            localStorage.setItem(
                "produtosJudo",
                JSON.stringify(produtos)
            );

        }

    }

    catch (err) {

        console.error(
            "Erro ao carregar dados do servidor:",
            err
        );

    }

}


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

async function init() {

    await loadFromApi();


    atualizarLoja();


    carregarTema();


    atualizarCarrinho();


    mostrarProdutos();

}


/* =====================================================
   INICIAR
===================================================== */

init();


/* =====================================================
   DISPONIBILIZAR FUNÇÕES PARA HTML
===================================================== */

window.abrirProduto =
    abrirProduto;


window.adicionarAoCarrinho =
    adicionarAoCarrinho;


window.editarProduto =
    editarProduto;


window.excluirProduto =
    excluirProduto;


window.focarPesquisa =
    focarPesquisa;


window.atualizarCarrinho =
    atualizarCarrinho;