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
   MOSTRAR PRODUTO
===================================================== */

if (produto) {

    console.log(
        "✓ Produto encontrado:",
        produto.nome
    );


    if (productImage) {

        productImage.textContent =
            produto.icone || "🥋";

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