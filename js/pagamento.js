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

    salvarProdutos();
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
   FOTOS DOS PRODUTOS
===================================================== */

const MAX_FOTOS = 5;

/*
   Fotos grandes demais podem ser recusadas pelo servidor.
   Acima deste tamanho, a foto fica só neste navegador e o
   servidor recebe apenas o ícone (emoji).
*/

const LIMITE_IMAGEM_SERVIDOR = 90000;

const fotosNovoProduto = [];

const fotosEdicao = [];

let produtoEditandoId = null;


function salvarProdutos() {

    try {

        localStorage.setItem(
            "produtosJudo",
            JSON.stringify(produtos)
        );

        return true;

    } catch (error) {

        console.error(
            "Erro ao salvar produtos:",
            error
        );

        alert(
            "Não foi possível salvar: o navegador ficou sem espaço. " +
            "Use menos fotos ou fotos menores."
        );

        return false;

    }

}


function escaparHTML(texto) {

    return String(texto ?? "").replace(
        /[&<>"']/g,
        function (c) {

            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[c];

        }
    );

}


/* Lista de fotos do produto (imagem principal + imagens) */

function listaImagens(produto) {

    const lista = [];

    if (produto && Array.isArray(produto.imagens)) {

        lista.push(...produto.imagens);

    }

    if (produto && produto.imagem) {

        lista.unshift(produto.imagem);

    }

    return Array.from(
        new Set(
            lista.filter(
                function (src) {

                    return (
                        typeof src === "string" &&
                        src.trim() !== ""
                    );

                }
            )
        )
    );

}


function aplicarFotos(produto, fotos) {

    if (fotos && fotos.length) {

        produto.imagens = fotos.slice();

        produto.imagem = fotos[0];

    } else {

        delete produto.imagens;

        delete produto.imagem;

    }

}


function imagemParaServidor(fotos, icone) {

    if (
        fotos &&
        fotos[0] &&
        fotos[0].length <= LIMITE_IMAGEM_SERVIDOR
    ) {

        return fotos[0];

    }

    return icone;

}


function ehImagem(valor) {

    return /^(data:image\/|https?:\/\/|\/)/.test(
        String(valor || "")
    );

}


/*
   O servidor guarda só um campo "imagem" (emoji ou foto).
   Ao carregar do servidor, junta com as fotos já salvas
   neste navegador para não perder as outras fotos.
*/

function mesclarImagemServidor(p) {

    const local =
        produtos.find(
            function (item) {

                return (
                    item.backendId &&
                    String(item.backendId) === String(p.id)
                );

            }
        );

    const doServidor =
        String(p.imagem || "");

    const servidorTemFoto =
        ehImagem(doServidor);

    const imagens =
        local && Array.isArray(local.imagens)
            ? local.imagens.slice()
            : [];

    if (
        servidorTemFoto &&
        !imagens.includes(doServidor)
    ) {

        imagens.unshift(doServidor);

    }

    return {

        icone:
            servidorTemFoto
                ? ((local && local.icone) || "🥋")
                : (doServidor || "🥋"),

        imagem:
            imagens[0] || "",

        imagens:
            imagens

    };

}


/* Visual do card: foto (se houver) ou emoji */

function visualProduto(produto) {

    const foto =
        listaImagens(produto)[0];

    if (foto) {

        return `<img src="${escaparHTML(foto)}" alt="${escaparHTML(produto.nome || "Produto")}" loading="lazy">`;

    }

    return escaparHTML(produto.icone || "🥋");

}


/* Miniaturas com "×" para remover e clique para tornar principal */

function renderizarFotos(container, lista) {

    if (!container) return;

    container.innerHTML = "";

    lista.forEach(
        function (src, i) {

            const item =
                document.createElement("div");

            item.className =
                "photo-item" +
                (i === 0 ? " principal" : "");

            const img =
                document.createElement("img");

            img.src = src;

            img.alt = "Foto " + (i + 1);

            img.title =
                i === 0
                    ? "Foto principal"
                    : "Clique para tornar principal";

            img.addEventListener(
                "click",
                function () {

                    if (i === 0) return;

                    lista.unshift(
                        lista.splice(i, 1)[0]
                    );

                    renderizarFotos(container, lista);

                }
            );

            const remover =
                document.createElement("button");

            remover.type = "button";

            remover.className = "photo-remove";

            remover.textContent = "×";

            remover.setAttribute(
                "aria-label",
                "Remover foto"
            );

            remover.addEventListener(
                "click",
                function () {

                    lista.splice(i, 1);

                    renderizarFotos(container, lista);

                }
            );

            item.appendChild(img);

            item.appendChild(remover);

            if (i === 0) {

                const selo =
                    document.createElement("span");

                selo.className = "photo-badge";

                selo.textContent = "Principal";

                item.appendChild(selo);

            }

            container.appendChild(item);

        }
    );

}


async function adicionarFotos(input, lista, container) {

    const arquivos =
        Array.from(input.files || []);

    /* permite escolher o mesmo arquivo de novo depois */
    input.value = "";

    if (arquivos.length === 0) return;

    const vagas =
        MAX_FOTOS - lista.length;

    if (vagas <= 0) {

        alert(
            "Máximo de " + MAX_FOTOS +
            " fotos por produto."
        );

        return;

    }

    if (arquivos.length > vagas) {

        alert(
            "Só cabem mais " + vagas +
            " foto(s). As demais foram ignoradas."
        );

    }

    try {

        const novas =
            await prepararImagens(arquivos, vagas);

        lista.push(...novas);

    } catch (error) {

        alert(
            error && error.message
                ? error.message
                : "Não foi possível usar essa imagem."
        );

    }

    renderizarFotos(container, lista);

}


function limparFotosNovoProduto() {

    fotosNovoProduto.length = 0;

    renderizarFotos(
        document.getElementById("productPhotosPreview"),
        fotosNovoProduto
    );

}


function configurarFotos() {

    const inputNovo =
        document.getElementById("productPhotos");

    const previewNovo =
        document.getElementById("productPhotosPreview");

    if (inputNovo) {

        inputNovo.addEventListener(
            "change",
            function () {

                adicionarFotos(
                    inputNovo,
                    fotosNovoProduto,
                    previewNovo
                );

            }
        );

    }

    const inputEdicao =
        document.getElementById("editProdutoFotos");

    const previewEdicao =
        document.getElementById("editProdutoFotosPreview");

    if (inputEdicao) {

        inputEdicao.addEventListener(
            "change",
            function () {

                adicionarFotos(
                    inputEdicao,
                    fotosEdicao,
                    previewEdicao
                );

            }
        );

    }

    /* fechar a janela clicando fora ou com Esc */

    const modal =
        document.getElementById("editModal");

    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (event.target === modal) {

                    fecharModalEdicao();

                }

            }
        );

    }

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                fecharModalEdicao();

            }

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

    if (!lojaAtual) return;


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

                if (!ehProdutoDaLoja(produto, lojaAtual)) {

                    return false;

                }


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
                    aria-label="Ver ${escaparHTML(produto.nome)}">

                    <div class="product-image">

                        ${visualProduto(produto)}

                    </div>

                </button>


                <div class="product-info">


                    <div class="product-category">

                        ${escaparHTML(produto.categoria || "Produto")}

                    </div>


                    <h2 class="product-name">

                        ${escaparHTML(produto.nome || "Produto")}

                    </h2>


                    <p class="product-description">

                        ${escaparHTML(produto.descricao || "")}

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
                        ehMinhaLoja(lojaAtual)
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


            const storePixKey =
                document.getElementById("storePixKey");

            const chavePix =
                storePixKey
                    ? storePixKey.value.trim()
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
                                        descricao,
                                        chave_pix: chavePix
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


                    const idMinhaLoja =
                        data.id ??
                        (data.loja && data.loja.id);

                    if (idMinhaLoja != null) {

                        localStorage.setItem(
                            "minhaLojaId",
                            String(idMinhaLoja)
                        );

                    }


                    localStorage.setItem(
                        "nomeLoja",
                        nome
                    );


                    localStorage.setItem(
                        "descricaoLoja",
                        descricao
                    );


                    localStorage.setItem(
                        "chavePixLoja",
                        chavePix
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


                    localStorage.setItem(
                        "chavePixLoja",
                        chavePix
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


                    localStorage.setItem(
                        "chavePixLoja",
                        chavePix
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
   (preenche o formulário do vendedor e, se a loja aberta
   for a dele, atualiza o nome e a descrição na tela)
===================================================== */

function atualizarLoja() {

    const nome =
        localStorage.getItem("nomeLoja");

    const descricao =
        localStorage.getItem("descricaoLoja");

    const storeName =
        document.getElementById("storeName");

    const storeDescription =
        document.getElementById("storeDescription");

    if (nome && storeName) {

        storeName.value = nome;

    }

    if (descricao !== null && storeDescription) {

        storeDescription.value = descricao;

    }

    const storePixKey =
        document.getElementById("storePixKey");

    const chavePixSalva =
        localStorage.getItem("chavePixLoja");

    if (chavePixSalva && storePixKey) {

        storePixKey.value = chavePixSalva;

    }

    if (lojaAtual && ehMinhaLoja(lojaAtual)) {

        if (nome) {

            lojaAtual.nome = nome;

        }

        if (descricao !== null) {

            lojaAtual.descricao = descricao;

        }

        mostrarInfoLoja(lojaAtual);

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


            const fotos =
                fotosNovoProduto.slice();


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
                                        imagem: imagemParaServidor(fotos, icone),
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


                    aplicarFotos(novoProduto, fotos);

            novoProduto.lojaId = idLojaParaNovoProduto();

            produtos.push(novoProduto);


                    salvarProdutos();


                    productForm.reset();

            limparFotosNovoProduto();


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


                    aplicarFotos(novoProduto, fotos);

            novoProduto.lojaId = idLojaParaNovoProduto();

            produtos.push(novoProduto);


                    salvarProdutos();


                    productForm.reset();

            limparFotosNovoProduto();


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


            aplicarFotos(novoProduto, fotos);

            novoProduto.lojaId = idLojaParaNovoProduto();

            produtos.push(novoProduto);


            salvarProdutos();


            productForm.reset();

            limparFotosNovoProduto();


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
   EDITAR PRODUTO (janela com nome, preço, descrição,
   ícone e fotos)
===================================================== */

function editarProduto(id) {

    const produto =
        produtos.find(
            function (item) {

                return item.id === id;

            }
        );

    if (!produto) {

        alert("Produto não encontrado.");

        return;

    }

    produtoEditandoId = id;

    document.getElementById("editProdutoNome").value =
        produto.nome || "";

    document.getElementById("editProdutoPreco").value =
        produto.preco;

    document.getElementById("editProdutoDescricao").value =
        produto.descricao || "";

    document.getElementById("editProdutoIcone").value =
        produto.icone || "🥋";

    fotosEdicao.length = 0;

    fotosEdicao.push(...listaImagens(produto));

    renderizarFotos(
        document.getElementById("editProdutoFotosPreview"),
        fotosEdicao
    );

    document.getElementById("editModal").style.display =
        "flex";

}


function fecharModalEdicao() {

    const modal =
        document.getElementById("editModal");

    if (modal) {

        modal.style.display = "none";

    }

    produtoEditandoId = null;

    fotosEdicao.length = 0;

}


function salvarEdicaoProduto() {

    const produto =
        produtos.find(
            function (item) {

                return item.id === produtoEditandoId;

            }
        );

    if (!produto) {

        alert("Produto não encontrado.");

        fecharModalEdicao();

        return;

    }

    const nome =
        document.getElementById("editProdutoNome")
            .value.trim();

    const preco =
        Number(
            String(
                document.getElementById("editProdutoPreco").value
            ).replace(",", ".")
        );

    const descricao =
        document.getElementById("editProdutoDescricao")
            .value.trim();

    const icone =
        document.getElementById("editProdutoIcone")
            .value.trim() || "🥋";

    if (
        !nome ||
        !isFinite(preco) ||
        preco <= 0
    ) {

        alert(
            "Dados inválidos. Preencha o nome e um preço válido."
        );

        return;

    }

    const fotos =
        fotosEdicao.slice();

    function aplicarLocal() {

        produto.nome = nome;

        produto.preco = preco;

        produto.descricao = descricao;

        produto.icone = icone;

        aplicarFotos(produto, fotos);

        salvarProdutos();

        mostrarProdutos();

        fecharModalEdicao();

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
                        nome,
                        descricao,
                        preco,
                        imagem:
                            imagemParaServidor(fotos, icone)
                    })
            }
        )
        .then(
            async function (res) {

                let data = {};

                try {

                    data = await res.json();

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

                aplicarLocal();

            }
        )
        .catch(
            function (err) {

                console.error(err);

                aplicarLocal();

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

    aplicarLocal();

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


                salvarProdutos();


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


                salvarProdutos();


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


    salvarProdutos();


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

            imagem:
                listaImagens(produto)[0] ||
                "",

            lojaId:
                produto.lojaId || null,

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
   LOJAS DOS VENDEDORES
   loja.html            -> lista de lojas
   loja.html?loja=ID    -> loja de um vendedor
===================================================== */

const LOJA_LOCAL_ID = "local";

let lojas = [];

let lojaAtual = null;


/* Loja usada quando não há servidor */

function lojaLocal() {

    const descricao =
        localStorage.getItem("descricaoLoja");

    return {

        id: LOJA_LOCAL_ID,

        chavePix:
            localStorage.getItem("chavePixLoja") || "",

        nome:
            localStorage.getItem("nomeLoja") ||
            "Judô World Store",

        descricao:
            descricao !== null
                ? descricao
                : "Produtos para praticantes de judô."

    };

}


/* Id da loja do vendedor logado (se o sistema informar) */

function minhaLojaId() {

    const usuario =
        usuarioLogado || {};

    return (
        usuario.lojaId ??
        usuario.loja_id ??
        localStorage.getItem("minhaLojaId") ??
        null
    );

}


/* Só o dono da loja vê Editar / Excluir */

function ehMinhaLoja(loja) {

    if (
        tipoUsuario !== "vendedor" ||
        !loja
    ) {

        return false;

    }

    if (String(loja.id) === LOJA_LOCAL_ID) {

        return true;

    }

    const meuId =
        minhaLojaId();

    if (
        meuId !== null &&
        String(meuId) === String(loja.id)
    ) {

        return true;

    }

    const nomeMinhaLoja =
        localStorage.getItem("nomeLoja");

    return (
        !!nomeMinhaLoja &&
        String(loja.nome || "").trim().toLowerCase() ===
        nomeMinhaLoja.trim().toLowerCase()
    );

}


function ehProdutoDaLoja(produto, loja) {

    if (!loja) {

        return false;

    }

    if (String(loja.id) === LOJA_LOCAL_ID) {

        return (
            !produto.lojaId ||
            String(produto.lojaId) === LOJA_LOCAL_ID
        );

    }

    return String(produto.lojaId) === String(loja.id);

}


/* Loja onde um produto novo será guardado */

function idLojaParaNovoProduto() {

    const meuId =
        minhaLojaId();

    if (meuId !== null) {

        return meuId;

    }

    if (
        lojaAtual &&
        ehMinhaLoja(lojaAtual)
    ) {

        return lojaAtual.id;

    }

    return LOJA_LOCAL_ID;

}


/* Busca a lista de lojas no servidor */

async function carregarLojas() {

    let falhou = false;

    try {

        const res =
            await fetch(`${API_BASE}/lojas`);

        if (res.ok) {

            const data =
                await res.json();

            if (
                data &&
                Array.isArray(data.lojas) &&
                data.lojas.length > 0
            ) {

                lojas =
                    data.lojas.map(
                        function (l) {

                            return {
                                id: l.id,
                                nome: l.nome || "Loja",
                                descricao: l.descricao || "",
                                chavePix: l.chave_pix ?? l.chavePix ?? ""
                            };

                        }
                    );

                try {

                    localStorage.setItem(
                        "lojasJudo",
                        JSON.stringify(lojas)
                    );

                } catch (e) {}

                return;

            }

        } else {

            falhou = true;

        }

    } catch (err) {

        console.error(
            "Erro ao carregar lojas:",
            err
        );

        falhou = true;

    }

    /* servidor fora do ar: usa as lojas vistas da última vez */

    if (falhou) {

        try {

            const salvas =
                JSON.parse(
                    localStorage.getItem("lojasJudo") || "[]"
                );

            if (
                Array.isArray(salvas) &&
                salvas.length > 0
            ) {

                lojas = salvas;

                return;

            }

        } catch (e) {}

    }

    lojas = [lojaLocal()];

}


/* Busca os produtos de uma loja e junta com os já guardados */

async function carregarProdutosDaLoja(loja) {

    try {

        const res =
            await fetch(
                `${API_BASE}/lojas/${loja.id}/produtos`
            );

        if (!res.ok) {

            return;

        }

        const pd =
            await res.json();

        if (
            !pd ||
            !Array.isArray(pd.produtos)
        ) {

            return;

        }

        const doServidor =
            pd.produtos.map(
                function (p) {

                    const dadosImagem =
                        mesclarImagemServidor(p);

                    return {

                        id: Number(p.id),

                        backendId: p.id,

                        lojaId: loja.id,

                        nome: p.nome,

                        categoria: p.categoria || "",

                        preco: Number(p.preco),

                        icone: dadosImagem.icone,

                        imagem: dadosImagem.imagem,

                        imagens: dadosImagem.imagens,

                        descricao: p.descricao || ""

                    };

                }
            );

        const idsServidor =
            new Set(
                doServidor.map(
                    function (p) {

                        return String(p.backendId);

                    }
                )
            );

        /*
           Troca os produtos desta loja que vieram do servidor.
           Produtos criados só neste navegador continuam.
        */

        produtos =
            produtos
                .filter(
                    function (p) {

                        if (!p.backendId) {

                            return true;

                        }

                        return !(
                            idsServidor.has(String(p.backendId)) ||
                            String(p.lojaId) === String(loja.id)
                        );

                    }
                )
                .concat(doServidor);

        salvarProdutos();

    } catch (err) {

        console.error(
            "Erro ao carregar produtos da loja:",
            err
        );

    }

}


/* Lista de lojas (cards com "Entrar na loja") */

function mostrarLojas() {

    const grid =
        document.getElementById("storesGrid");

    if (!grid) return;

    grid.innerHTML = "";

    lojas.forEach(
        function (loja) {

            const card =
                document.createElement("a");

            card.className = "store-card";

            card.href =
                "loja.html?loja=" +
                encodeURIComponent(loja.id);

            card.innerHTML = `

                <div class="store-card-logo">🥋</div>

                <div class="store-card-text">

                    ${
                        ehMinhaLoja(loja)
                            ? '<span class="store-card-mine">SUA LOJA</span>'
                            : ""
                    }

                    <h3>${escaparHTML(loja.nome || "Loja")}</h3>

                    <p>${escaparHTML(loja.descricao || "Sem descrição.")}</p>

                    <span class="store-card-cta">Entrar na loja →</span>

                </div>

            `;

            grid.appendChild(card);

        }
    );

}


/* Alterna entre a lista de lojas e a loja aberta */

function mostrarTela(tela) {

    const naLoja =
        tela === "loja";

    const secaoLojas =
        document.getElementById("storesSection");

    const info =
        document.getElementById("storeInfo");

    const ferramentas =
        document.getElementById("shopTools");

    if (secaoLojas) {

        secaoLojas.style.display =
            naLoja ? "none" : "block";

    }

    if (info) {

        info.style.display =
            naLoja ? "flex" : "none";

    }

    if (ferramentas) {

        ferramentas.style.display =
            naLoja ? "grid" : "none";

    }

    if (products) {

        products.style.display =
            naLoja ? "" : "none";

    }

    if (empty && !naLoja) {

        empty.style.display = "none";

    }

}


function mostrarInfoLoja(loja) {

    const nome =
        document.getElementById("displayStoreName");

    const descricao =
        document.getElementById("displayStoreDescription");

    const link =
        document.getElementById("allStoresLink");

    if (nome) {

        nome.textContent =
            loja.nome || "Loja";

    }

    if (descricao) {

        descricao.textContent =
            loja.descricao || "";

    }

    if (link) {

        link.style.display =
            lojas.length > 1
                ? "inline-block"
                : "none";

    }

}


async function abrirLoja(loja) {

    lojaAtual = loja;

    mostrarInfoLoja(loja);

    mostrarTela("loja");

    const jaTemProdutos =
        produtos.some(
            function (p) {

                return ehProdutoDaLoja(p, loja);

            }
        );

    if (jaTemProdutos) {

        mostrarProdutos();

    }

    if (String(loja.id) !== LOJA_LOCAL_ID) {

        await carregarProdutosDaLoja(loja);

    }

    mostrarProdutos();

}


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

async function init() {

    carregarTema();

    atualizarCarrinho();

    await carregarLojas();

    atualizarLoja();

    const idPedido =
        new URLSearchParams(
            window.location.search
        ).get("loja");

    let loja = null;

    if (idPedido) {

        loja =
            lojas.find(
                function (l) {

                    return String(l.id) === idPedido;

                }
            ) || null;

    }

    /* só existe uma loja: já entra nela */

    if (!loja && lojas.length === 1) {

        loja = lojas[0];

    }

    if (loja) {

        await abrirLoja(loja);

    } else {

        mostrarLojas();

        mostrarTela("lojas");

    }

}


/* =====================================================
   INICIAR
===================================================== */

configurarFotos();


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


window.fecharModalEdicao =
    fecharModalEdicao;


window.salvarEdicaoProduto =
    salvarEdicaoProduto;


window.focarPesquisa =
    focarPesquisa;


window.atualizarCarrinho =
    atualizarCarrinho;