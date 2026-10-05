/* =====================================================
   PRODUTO.JS
   Página de detalhes do produto
===================================================== */


/* =====================================================
   VERIFICAR AUTENTICAÇÃO
===================================================== */

let usuarioLogado = null;

const usuarioJson =
    localStorage.getItem("usuario");

if (usuarioJson) {

    try {

        usuarioLogado =
            JSON.parse(usuarioJson);

        console.log(
            "✓ Usuário logado:",
            usuarioLogado.nome
        );

    } catch (error) {

        console.error(
            "Erro ao parsear usuário:",
            error
        );

    }

}


/* =====================================================
   ELEMENTOS DA PÁGINA
===================================================== */

const productImage =
    document.getElementById("productImage");

const productCategory =
    document.getElementById("productCategory");

const productName =
    document.getElementById("productName");

const productDescription =
    document.getElementById("productDescription");

const productPrice =
    document.getElementById("productPrice");

const quantityInput =
    document.getElementById("quantity");

const decreaseButton =
    document.getElementById("decreaseQuantity");

const increaseButton =
    document.getElementById("increaseQuantity");

const addCartButton =
    document.getElementById("addCartButton");

const buyButton =
    document.getElementById("buyButton");

const themeButton =
    document.getElementById("themeButton");

const productThumbs =
    document.getElementById("productThumbs");


/* =====================================================
   API
===================================================== */

const API_BASE =
    typeof API_BASE_URL !== "undefined"
        ? API_BASE_URL
        : "/api";


/* =====================================================
   PEGAR ID DO PRODUTO NA URL
===================================================== */

const parametros =
    new URLSearchParams(
        window.location.search
    );

const produtoId =
    Number(
        parametros.get("id")
    );

console.log(
    "Produto ID:",
    produtoId
);


/* =====================================================
   CARREGAR PRODUTOS DO LOCALSTORAGE
===================================================== */

let produtos = [];

try {

    produtos =
        JSON.parse(
            localStorage.getItem(
                "produtosJudo"
            )
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

if (!produtos.length) {

    produtos = [

        {
            id: 1,
            nome: "Kimono Judo",
            categoria: "Kimonos",
            preco: 199.90,
            icone: "🥋",
            descricao:
                "Kimono resistente para treino."
        },

        {
            id: 2,
            nome: "Faixa Preta",
            categoria: "Faixas",
            preco: 49.90,
            icone: "🥋",
            descricao:
                "Faixa para graduação."
        },

        {
            id: 3,
            nome: "Saco de Treino",
            categoria: "Equipamentos",
            preco: 129.90,
            icone: "🥊",
            descricao:
                "Equipamento para treinamento."
        },

        {
            id: 4,
            nome: "Camiseta Judô",
            categoria: "Roupas",
            preco: 69.90,
            icone: "👕",
            descricao:
                "Camiseta oficial Judô World."
        }

    ];

}

console.log(
    "Produtos carregados:",
    produtos.length
);


/* =====================================================
   ENCONTRAR PRODUTO
===================================================== */

const produto =
    produtos.find(
        function(item) {

            const localId =
                Number(item.id);

            const backendId =
                item.backendId
                    ? Number(item.backendId)
                    : null;

            return (
                localId === produtoId ||
                backendId === produtoId
            );

        }
    );


/* =====================================================
   FORMATAR PREÇO
===================================================== */

function formatarPreco(valor) {

    return Number(
        valor || 0
    ).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* =====================================================
   VERIFICAR SE O PRODUTO EXISTE
===================================================== */

if (!produto) {

    document.body.innerHTML = `

        <main class="produto-erro">

            <div>

                <div class="erro-icon">
                    😕
                </div>

                <h1>
                    Produto não encontrado
                </h1>

                <p>
                    Este produto não existe
                    ou foi removido.
                </p>

                <a
                    href="loja.html"
                    class="back-button">

                    ← Voltar para a loja

                </a>

            </div>

        </main>

    `;

}


/* =====================================================
   IMAGENS DO PRODUTO
   Aceita produto.imagens (lista) e/ou produto.imagem
   (foto enviada pelo vendedor). Sem foto, usa o emoji.
===================================================== */

function listaImagens(item) {

    const lista = [];

    if (item && Array.isArray(item.imagens)) {

        lista.push(...item.imagens);

    }

    if (item && item.imagem) {

        lista.unshift(item.imagem);

    }

    return Array.from(
        new Set(
            lista.filter(
                function(src) {

                    return (
                        typeof src === "string" &&
                        src.trim() !== ""
                    );

                }
            )
        )
    );

}


function mostrarImagemPrincipal(src, iconeFallback) {

    if (!productImage) {

        return;

    }

    productImage.textContent = "";

    const img =
        document.createElement("img");

    img.src = src;

    img.alt =
        (produto && produto.nome) || "Produto";

    /* se a foto não carregar, volta para o emoji */

    img.addEventListener(
        "error",
        function() {

            productImage.textContent =
                iconeFallback;

        }
    );

    productImage.appendChild(img);

}


function mostrarGaleria(imagens, iconeFallback) {

    mostrarImagemPrincipal(
        imagens[0],
        iconeFallback
    );

    if (
        !productThumbs ||
        imagens.length < 2
    ) {

        return;

    }

    productThumbs.innerHTML = "";

    imagens.forEach(
        function(src, indice) {

            const botao =
                document.createElement("button");

            botao.type = "button";

            botao.setAttribute(
                "aria-label",
                "Ver foto " + (indice + 1)
            );

            if (indice === 0) {

                botao.classList.add("ativa");

            }

            const mini =
                document.createElement("img");

            mini.src = src;

            mini.alt = "";

            botao.appendChild(mini);

            botao.addEventListener(
                "click",
                function() {

                    mostrarImagemPrincipal(
                        src,
                        iconeFallback
                    );

                    productThumbs
                        .querySelectorAll("button")
                        .forEach(
                            function(b) {

                                b.classList.remove("ativa");

                            }
                        );

                    botao.classList.add("ativa");

                }
            );

            productThumbs.appendChild(botao);

        }
    );

}


/* =====================================================
   MOSTRAR PRODUTO
===================================================== */

if (produto) {

    console.log(
        "✓ Produto encontrado:",
        produto.nome
    );


    if (productImage) {

        const iconeProduto =
            produto.icone || "🥋";

        const imagens =
            listaImagens(produto);

        if (imagens.length) {

            mostrarGaleria(
                imagens,
                iconeProduto
            );

        } else {

            productImage.textContent =
                iconeProduto;

        }

    }


    if (productCategory) {

        productCategory.textContent =
            produto.categoria ||
            "Produto";

    }


    if (productName) {

        productName.textContent =
            produto.nome ||
            "Produto";

    }


    if (productDescription) {

        productDescription.textContent =
            produto.descricao ||
            "Sem descrição.";

    }


    if (productPrice) {

        productPrice.textContent =
            formatarPreco(
                produto.preco
            );

    }

} else {

    console.error(
        "❌ Produto não encontrado! ID:",
        produtoId
    );

}


/* =====================================================
   LINK PARA A LOJA DO VENDEDOR
===================================================== */

if (
    produto &&
    produto.lojaId &&
    String(produto.lojaId) !== "local"
) {

    const linkLoja =
        "loja.html?loja=" +
        encodeURIComponent(produto.lojaId);

    let nomeDaLoja = "";

    try {

        const lojasSalvas =
            JSON.parse(
                localStorage.getItem("lojasJudo") || "[]"
            );

        const achada =
            lojasSalvas.find(
                function (l) {

                    return String(l.id) === String(produto.lojaId);

                }
            );

        if (achada) {

            nomeDaLoja = achada.nome;

        }

    } catch (error) {}

    const productStoreLink =
        document.getElementById("productStoreLink");

    if (productStoreLink) {

        productStoreLink.href = linkLoja;

        productStoreLink.textContent =
            "🏪 " + (nomeDaLoja || "Ver loja do vendedor");

        productStoreLink.style.display = "inline-block";

    }

    /* "Voltar" leva para a loja de onde o produto veio */

    document
        .querySelectorAll(".back-button, .mobile-back")
        .forEach(
            function (a) {

                a.href = linkLoja;

            }
        );

}


/* =====================================================
   QUANTIDADE
===================================================== */

function atualizarQuantidade(valor) {

    valor =
        Number(valor);


    if (
        isNaN(valor) ||
        valor < 1
    ) {

        valor = 1;

    }


    if (valor > 99) {

        valor = 99;

    }


    if (quantityInput) {

        quantityInput.value =
            valor;

    }

}


/* =====================================================
   DIMINUIR QUANTIDADE
===================================================== */

if (decreaseButton) {

    decreaseButton.addEventListener(
        "click",
        function() {

            const quantidade =
                Number(
                    quantityInput.value
                );

            atualizarQuantidade(
                quantidade - 1
            );

        }
    );

}


/* =====================================================
   AUMENTAR QUANTIDADE
===================================================== */

if (increaseButton) {

    increaseButton.addEventListener(
        "click",
        function() {

            const quantidade =
                Number(
                    quantityInput.value
                );

            atualizarQuantidade(
                quantidade + 1
            );

        }
    );

}


/* =====================================================
   ALTERAR QUANTIDADE MANUALMENTE
===================================================== */

if (quantityInput) {

    quantityInput.addEventListener(
        "input",
        function() {

            atualizarQuantidade(
                this.value
            );

        }
    );

}


/* =====================================================
   PEGAR CARRINHO
===================================================== */

function pegarCarrinho() {

    try {

        const dados =
            localStorage.getItem(
                "carrinhoJudo"
            );

        const carrinho =
            JSON.parse(
                dados || "[]"
            );

        return Array.isArray(carrinho)
            ? carrinho
            : [];

    } catch (error) {

        console.error(
            "Erro ao carregar carrinho:",
            error
        );

        return [];

    }

}


/* =====================================================
   SALVAR CARRINHO
===================================================== */

function salvarCarrinho(carrinho) {

    localStorage.setItem(
        "carrinhoJudo",
        JSON.stringify(carrinho)
    );

}


/* =====================================================
   ADICIONAR AO CARRINHO
===================================================== */

function adicionarCarrinho() {

    if (!produto) {

        alert(
            "Produto não encontrado!"
        );

        return;

    }


    const quantidade =
        Number(
            quantityInput?.value
        ) || 1;


    console.log(
        "Adicionando ao carrinho:",
        produto.nome,
        "x",
        quantidade
    );


    let carrinho =
        pegarCarrinho();


    const produtoExistente =
        carrinho.find(
            function(item) {

                return (
                    Number(item.id) ===
                    Number(produto.id)
                );

            }
        );


    if (produtoExistente) {

        produtoExistente.quantidade =
            Number(
                produtoExistente.quantidade || 1
            ) + quantidade;

        if (!produtoExistente.imagem) {

            produtoExistente.imagem =
                listaImagens(produto)[0] || "";

        }


        console.log(
            "✓ Quantidade atualizada"
        );

    } else {

        carrinho.push({

            id:
                produto.id,

            nome:
                produto.nome,

            categoria:
                produto.categoria,

            preco:
                Number(
                    produto.preco
                ),

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
                quantidade

        });


        console.log(
            "✓ Produto adicionado ao carrinho"
        );

    }


    salvarCarrinho(
        carrinho
    );


    alert(
        produto.nome +
        " foi adicionado ao carrinho!"
    );


    atualizarContadorCarrinho();

}


/* =====================================================
   BOTÃO ADICIONAR AO CARRINHO
===================================================== */

if (addCartButton) {

    addCartButton.addEventListener(
        "click",
        adicionarCarrinho
    );

}


/* =====================================================
   COMPRAR AGORA
===================================================== */

if (buyButton) {

    buyButton.addEventListener(
        "click",
        function() {

            adicionarCarrinho();

            window.location.href =
                "carrinho.html";

        }
    );

}


/* =====================================================
   CONTADOR DO CARRINHO
===================================================== */

function atualizarContadorCarrinho() {

    const contador =
        document.getElementById(
            "cartCount"
        );


    if (!contador) {

        return;

    }


    const carrinho =
        pegarCarrinho();


    const quantidadeTotal =
        carrinho.reduce(
            function(
                total,
                item
            ) {

                return (
                    total +
                    Number(
                        item.quantidade || 1
                    )
                );

            },
            0
        );


    contador.textContent =
        quantidadeTotal;


    if (
        quantidadeTotal > 0
    ) {

        contador.style.display =
            "flex";

    } else {

        contador.style.display =
            "none";

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


    if (
        tema === "escuro"
    ) {

        document.body.classList.add(
            "dark"
        );


        if (themeButton) {

            themeButton.textContent =
                "☀️";

        }

    } else {

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
   BOTÃO DO TEMA
===================================================== */

if (themeButton) {

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


            if (escuro) {

                localStorage.setItem(
                    "tema",
                    "escuro"
                );


                themeButton.textContent =
                    "☀️";

            } else {

                localStorage.setItem(
                    "tema",
                    "claro"
                );


                themeButton.textContent =
                    "🌙";

            }

        }
    );

}


/* =====================================================
   INICIAR
===================================================== */

carregarTema();

atualizarContadorCarrinho();