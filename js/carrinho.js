function getCarrinho() {
    try {
        return JSON.parse(localStorage.getItem("carrinho") || "[]");
    } catch (error) {
        return [];
    }
}

function salvarCarrinho(carrinho) {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function formatarPreco(valor) {
    return `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`;
}

function atualizarContador() {
    const contador = document.getElementById("contador");
    if (!contador) return;

    contador.textContent = getCarrinho().length;
}

function renderizarCarrinho() {
    const lista = document.getElementById("lista-carrinho");
    const resumo = document.getElementById("resumo-carrinho");

    if (!lista || !resumo) {
        return;
    }

    const carrinho = getCarrinho();

    if (!carrinho.length) {
        lista.innerHTML = '<div class="carrinho-vazio">Seu carrinho está vazio.</div>';
        resumo.innerHTML = `
            <p>Itens: 0</p>
            <p>Frete: R$ 0,00</p>
            <div class="total">Total: R$ 0,00</div>
        `;
        atualizarContador();
        return;
    }

    let total = 0;

    lista.innerHTML = carrinho.map((produto, indice) => {
        total += Number(produto.preco || 0);

        const imagem = produto.imagem || (produto.imagens && produto.imagens[0]) || 'judo.png';

        return `
            <div class="item-carrinho">
                <img src="${imagem}" alt="${produto.nome}">
                <div class="item-carrinho-info">
                    <h3>${produto.nome}</h3>
                    <p>${formatarPreco(produto.preco)}</p>
                </div>
                <button class="remover-item" data-indice="${indice}">Remover</button>
            </div>
        `;
    }).join('');

    const valorFrete = total > 0 ? 25 : 0;
    const valorTotal = total + valorFrete;

    resumo.innerHTML = `
        <p>Itens: ${carrinho.length}</p>
        <p>Subtotal: ${formatarPreco(total)}</p>
        <p>Frete: ${formatarPreco(valorFrete)}</p>
        <div class="total">Total: ${formatarPreco(valorTotal)}</div>
    `;

    atualizarContador();
}

document.addEventListener("click", (event) => {
    const botaoRemover = event.target.closest(".remover-item");

    if (!botaoRemover) {
        return;
    }

    const carrinho = getCarrinho();
    const indice = Number(botaoRemover.dataset.indice);

    carrinho.splice(indice, 1);
    salvarCarrinho(carrinho);
    renderizarCarrinho();
});

renderizarCarrinho();
