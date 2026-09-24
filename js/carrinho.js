/* =====================================================
   CONFIGURAÇÃO
===================================================== */

const CHAVE_CARRINHO = "carrinhoJudo";


/* =====================================================
   PEGAR CARRINHO
===================================================== */

function getCarrinho() {

    try {

        const dados =
            localStorage.getItem(
                CHAVE_CARRINHO
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
        CHAVE_CARRINHO,
        JSON.stringify(carrinho)
    );

}


/* =====================================================
   FORMATAR PREÇO
===================================================== */

function formatarPreco(valor) {

    const numero =
        Number(valor) || 0;

    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* =====================================================
   NORMALIZAR QUANTIDADE
===================================================== */

function quantidadeProduto(produto) {

    const quantidade =
        Number(
            produto.quantidade
        );

    return (
        Number.isFinite(quantidade) &&
        quantidade > 0
    )
        ? quantidade
        : 1;

}


/* =====================================================
   ATUALIZAR CONTADOR (ícone do carrinho no topo)
===================================================== */

function atualizarContador() {

    const carrinho =
        getCarrinho();

    const total =
        carrinho.reduce(
            function (soma, produto) {

                return (
                    soma +
                    quantidadeProduto(produto)
                );

            },
            0
        );

    const contador =
        document.getElementById("cartCount") ||
        document.getElementById("contador");

    if (!contador) {

        return;

    }

    contador.textContent = total;

    contador.style.display =
        total > 0 ? "flex" : "none";

}


/* =====================================================
   CALCULAR SUBTOTAL
===================================================== */

function calcularSubtotal(carrinho) {

    return carrinho.reduce(
        function (total, produto) {

            const preco =
                Number(
                    produto.preco ||
                    produto.price ||
                    0
                );

            const quantidade =
                quantidadeProduto(produto);

            return (
                total +
                (preco * quantidade)
            );

        },
        0
    );

}


/* =====================================================
   RENDERIZAR CARRINHO
===================================================== */

function renderizarCarrinho() {

    const lista =
        document.getElementById("cartItems");

    const vazio =
        document.getElementById("emptyCart");

    const itemCount =
        document.getElementById("itemCount");

    const shipping =
        document.getElementById("shipping");

    const totalEl =
        document.getElementById("total");

    const checkoutBtn =
        document.getElementById("checkoutBtn");

    atualizarContador();

    if (!lista) {

        console.error(
            "Não encontrei #cartItems no carrinho.html"
        );

        return;

    }

    const carrinho =
        getCarrinho();

    /* =================================================
       CARRINHO VAZIO
    ================================================= */

    if (carrinho.length === 0) {

        lista.innerHTML = "";

        if (vazio) {

            vazio.hidden = false;

        }

        if (itemCount) itemCount.textContent = "0";
        if (shipping) shipping.textContent = formatarPreco(0);
        if (totalEl) totalEl.textContent = formatarPreco(0);

        if (checkoutBtn) {

            checkoutBtn.disabled = true;

        }

        fecharCheckout();

        return;

    }

    if (vazio) {

        vazio.hidden = true;

    }

    if (checkoutBtn) {

        checkoutBtn.disabled = false;

    }

    /* =================================================
       CALCULAR VALORES
    ================================================= */

    const subtotal =
        calcularSubtotal(carrinho);

    const quantidadeTotal =
        carrinho.reduce(
            function (soma, produto) {

                return (
                    soma +
                    quantidadeProduto(produto)
                );

            },
            0
        );

    const frete =
        subtotal > 0 ? 25 : 0;

    const total =
        subtotal + frete;

    if (itemCount) itemCount.textContent = quantidadeTotal;
    if (shipping) shipping.textContent = formatarPreco(frete);
    if (totalEl) totalEl.textContent = formatarPreco(total);

    /* =================================================
       PRODUTOS
    ================================================= */

    lista.innerHTML =
        carrinho.map(
            function (produto, indice) {

                const preco =
                    Number(
                        produto.preco ||
                        produto.price ||
                        0
                    );

                const quantidade =
                    quantidadeProduto(produto);

                const subtotalProduto =
                    preco * quantidade;

                const imagem =
                    produto.imagem ||
                    (produto.imagens && produto.imagens[0]);

                const visual =
                    imagem
                        ? `<img src="${imagem}" alt="${produto.nome || "Produto"}">`
                        : `<span>${produto.icone || "🥋"}</span>`;

                return `
                    <div class="produto" data-indice="${indice}">

                        <div class="produto-imagem">
                            ${visual}
                        </div>

                        <div class="produto-info">

                            <span class="categoria">
                                ${produto.categoria || ""}
                            </span>

                            <h3>${produto.nome || "Produto"}</h3>

                            <strong>
                                ${formatarPreco(preco)} cada
                            </strong>

                            <div class="quantidade">

                                <button
                                    type="button"
                                    class="diminuir-quantidade"
                                    data-indice="${indice}">
                                    −
                                </button>

                                <span>${quantidade}</span>

                                <button
                                    type="button"
                                    class="aumentar-quantidade"
                                    data-indice="${indice}">
                                    +
                                </button>

                            </div>

                        </div>

                        <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:10px;">

                            <strong>${formatarPreco(subtotalProduto)}</strong>

                            <button
                                type="button"
                                class="remover remover-item"
                                data-indice="${indice}">
                                🗑️ Remover
                            </button>

                        </div>

                    </div>
                `;

            }
        ).join("");

}


/* =====================================================
   AUMENTAR QUANTIDADE
===================================================== */

function aumentarQuantidade(indice) {

    const carrinho =
        getCarrinho();

    if (!carrinho[indice]) {

        return;

    }

    carrinho[indice].quantidade =
        quantidadeProduto(carrinho[indice]) + 1;

    salvarCarrinho(carrinho);

    renderizarCarrinho();

}


/* =====================================================
   DIMINUIR QUANTIDADE
===================================================== */

function diminuirQuantidade(indice) {

    const carrinho =
        getCarrinho();

    if (!carrinho[indice]) {

        return;

    }

    const quantidadeAtual =
        quantidadeProduto(carrinho[indice]);

    if (quantidadeAtual <= 1) {

        carrinho.splice(indice, 1);

    } else {

        carrinho[indice].quantidade =
            quantidadeAtual - 1;

    }

    salvarCarrinho(carrinho);

    renderizarCarrinho();

}


/* =====================================================
   REMOVER PRODUTO
===================================================== */

function removerProduto(indice) {

    const carrinho =
        getCarrinho();

    if (!carrinho[indice]) {

        return;

    }

    carrinho.splice(indice, 1);

    salvarCarrinho(carrinho);

    renderizarCarrinho();

}


/* =====================================================
   ABRIR / FECHAR PAGAMENTO
===================================================== */

function abrirCheckout() {

    const carrinho =
        getCarrinho();

    if (!carrinho || carrinho.length === 0) {

        alert("Seu carrinho está vazio.");

        return;

    }

    const checkout =
        document.getElementById("checkout");

    const checkoutTotal =
        document.getElementById("checkoutTotal");

    if (!checkout) {

        return;

    }

    const subtotal =
        calcularSubtotal(carrinho);

    const frete =
        subtotal > 0 ? 25 : 0;

    const total =
        subtotal + frete;

    if (checkoutTotal) {

        checkoutTotal.textContent =
            formatarPreco(total);

    }

    checkout.hidden = false;

    checkout.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


function fecharCheckout() {

    const checkout =
        document.getElementById("checkout");

    const mensagem =
        document.getElementById("paymentMessage");

    if (checkout) {

        checkout.hidden = true;

    }

    if (mensagem) {

        mensagem.textContent = "";

    }

}


/* =====================================================
   PROCESSAR PAGAMENTO
===================================================== */

function processarPagamento() {

    const forma =
        document.querySelector(
            'input[name="payment"]:checked'
        )?.value;

    const mensagem =
        document.getElementById("paymentMessage");

    if (!mensagem) {

        return;

    }

    if (forma === "pix") {

        mensagem.textContent =
            "Pix selecionado. Para gerar um QR Code e receber o pagamento real, é necessário conectar um provedor de pagamento.";

    } else if (forma === "card") {

        mensagem.textContent =
            "Cartão selecionado. Para realizar uma cobrança real, é necessário conectar um checkout seguro.";

    } else {

        mensagem.textContent =
            "Selecione uma forma de pagamento.";

    }

}


/* =====================================================
   MODO CLARO / ESCURO
===================================================== */

function carregarTema() {

    const tema =
        localStorage.getItem("tema");

    const themeToggle =
        document.getElementById("themeToggle");

    if (tema === "escuro") {

        document.body.classList.add("dark");

        if (themeToggle) themeToggle.textContent = "☀️";

    } else {

        document.body.classList.remove("dark");

        if (themeToggle) themeToggle.textContent = "🌙";

    }

}

const themeToggle =
    document.getElementById("themeToggle");

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        function () {

            document.body.classList.toggle("dark");

            const escuro =
                document.body.classList.contains("dark");

            localStorage.setItem(
                "tema",
                escuro ? "escuro" : "claro"
            );

            themeToggle.textContent =
                escuro ? "☀️" : "🌙";

        }
    );

}


/* =====================================================
   EVENTOS DE CLIQUE (delegação)
===================================================== */

document.addEventListener(
    "click",
    function (event) {

        const botaoAumentar =
            event.target.closest(".aumentar-quantidade");

        if (botaoAumentar) {

            aumentarQuantidade(
                Number(botaoAumentar.dataset.indice)
            );

            return;

        }

        const botaoDiminuir =
            event.target.closest(".diminuir-quantidade");

        if (botaoDiminuir) {

            diminuirQuantidade(
                Number(botaoDiminuir.dataset.indice)
            );

            return;

        }

        const botaoRemover =
            event.target.closest(".remover-item");

        if (botaoRemover) {

            removerProduto(
                Number(botaoRemover.dataset.indice)
            );

            return;

        }

        if (event.target.id === "checkoutBtn") {

            abrirCheckout();

            return;

        }

        if (event.target.id === "closeCheckout") {

            fecharCheckout();

            return;

        }

        if (event.target.id === "payBtn") {

            processarPagamento();

            return;

        }

    }
);


/* =====================================================
   ATUALIZAR SE OUTRA PÁGINA ALTERAR O CARRINHO
===================================================== */

window.addEventListener(
    "storage",
    function (event) {

        if (event.key === CHAVE_CARRINHO) {

            renderizarCarrinho();

        }

    }
);


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        carregarTema();

        renderizarCarrinho();

        /*
           Marcador visível só para confirmar,
           sem precisar abrir o DevTools, que
           ESTE arquivo (a versão corrigida)
           é o que está realmente rodando.
           Pode remover esta div quando tudo
           estiver funcionando.
        */

        const marcador =
            document.createElement("div");

        marcador.textContent =
            "carrinho.js CORRIGIDO ok";

        marcador.style.cssText =
            "position:fixed;bottom:8px;right:8px;" +
            "background:#111;color:#0f0;font:12px monospace;" +
            "padding:4px 8px;border-radius:6px;z-index:99999;" +
            "opacity:.85;";

        document.body.appendChild(marcador);

    }
);


/* =====================================================
   DISPONIBILIZAR FUNÇÕES
===================================================== */

window.getCarrinho = getCarrinho;
window.salvarCarrinho = salvarCarrinho;
window.renderizarCarrinho = renderizarCarrinho;
window.atualizarContador = atualizarContador;
window.aumentarQuantidade = aumentarQuantidade;
window.diminuirQuantidade = diminuirQuantidade;
window.removerProduto = removerProduto;
window.abrirCheckout = abrirCheckout;
window.processarPagamento = processarPagamento;