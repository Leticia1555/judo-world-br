/* =====================================================
   PRODUTO.JS
   Página de detalhes do produto
===================================================== */


/* =====================================================
   ELEMENTOS DA PÁGINA
===================================================== */

const productImage = document.getElementById("productImage");
const productCategory = document.getElementById("productCategory");
const productName = document.getElementById("productName");
const productDescription = document.getElementById("productDescription");
const productPrice = document.getElementById("productPrice");

const quantityInput = document.getElementById("quantity");

const decreaseButton = document.getElementById("decreaseQuantity");
const increaseButton = document.getElementById("increaseQuantity");

const addCartButton = document.getElementById("addCartButton");
const buyButton = document.getElementById("buyButton");

const themeButton = document.getElementById("themeButton");


/* =====================================================
   PEGAR ID DO PRODUTO NA URL
===================================================== */

const parametros = new URLSearchParams(window.location.search);

const produtoId = Number(parametros.get("id"));


/* =====================================================
   CARREGAR PRODUTOS DO LOCALSTORAGE
===================================================== */

let produtos = JSON.parse(
    localStorage.getItem("produtosJudo")
) || [];


/* =====================================================
   ENCONTRAR PRODUTO
===================================================== */

const produto = produtos.find(function(item) {
    const localId = Number(item.id);
    const backendId = item.backendId ? Number(item.backendId) : null;
    return localId === produtoId || backendId === produtoId;
});


/* =====================================================
   FORMATAR PREÇO
===================================================== */

function formatarPreco(valor) {

    return Number(valor).toLocaleString("pt-BR", {

        style: "currency",

        currency: "BRL"

    });

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
                    Este produto não existe ou foi removido.
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

    productImage.textContent = produto.icone || "🥋";

    productCategory.textContent =
        produto.categoria || "Produto";

    productName.textContent =
        produto.nome || "Produto";

    productDescription.textContent =
        produto.descricao || "Sem descrição.";

    productPrice.textContent =
        formatarPreco(produto.preco);

}


/* =====================================================
   QUANTIDADE
===================================================== */

function atualizarQuantidade(valor) {

    valor = Number(valor);

    if (isNaN(valor) || valor < 1) {

        valor = 1;

    }

    if (valor > 99) {

        valor = 99;

    }

    quantityInput.value = valor;

}


/* =====================================================
   DIMINUIR QUANTIDADE
===================================================== */

if (decreaseButton) {

    decreaseButton.addEventListener(
        "click",
        function() {

            const quantidade =
                Number(quantityInput.value);

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
                Number(quantityInput.value);

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

    return JSON.parse(
        localStorage.getItem("carrinhoJudo")
    ) || [];

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

    if (!produto) return;


    const quantidade =
        Number(quantityInput.value) || 1;


    let carrinho =
        pegarCarrinho();


    const produtoExistente =
        carrinho.find(function(item) {

            return Number(item.id) === Number(produto.id);

        });


    if (produtoExistente) {

        produtoExistente.quantidade += quantidade;

    } else {

        carrinho.push({

            id: produto.id,

            nome: produto.nome,

            categoria: produto.categoria,

            preco: Number(produto.preco),

            icone: produto.icone || "🥋",

            descricao: produto.descricao || "",

            quantidade: quantidade

        });

    }


    salvarCarrinho(carrinho);


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
        document.getElementById("cartCount");

    if (!contador) return;


    const carrinho =
        pegarCarrinho();


    const quantidadeTotal =
        carrinho.reduce(
            function(total, item) {

                return total +
                    Number(item.quantidade || 1);

            },
            0
        );


    contador.textContent =
        quantidadeTotal;


    if (quantidadeTotal > 0) {

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
        localStorage.getItem("tema");


    if (tema === "escuro") {

        document.body.classList.add("dark");


        if (themeButton) {

            themeButton.textContent =
                "☀️";

        }

    } else {

        document.body.classList.remove("dark");


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