// loja.js - gerenciamento simples de produtos na loja

const produtosPadrao = [
    {
        id: 1,
        nome: "Kimono Trançado Judo Training Ad Azul",
        precoAntigo: 429.00,
        preco: 386.00,
        desconto: "10% OFF",
        imagem: "imagens/jud1.jpg",
        imagens: ["imagens/jud1.jpg", "imagens/jud2.jpg"],
        avaliacao: "☆☆☆☆☆",
        descricao: "Kimono linha Training importado - acabamento e costuras reforçadas.",
        btnText: "COMPRAR",
        btnShow: true
    },
    {
        id: 2,
        nome: "Kimono Judo Training Branco",
        precoAntigo: 399.00,
        preco: 359.00,
        desconto: "10% OFF",
        imagem: "imagens/jud2.jpg",
        imagens: ["imagens/jud2.jpg", "imagens/jud3.jpg"],
        avaliacao: "☆☆☆☆☆",
        descricao: "Kimono tradicional branco, leve e resistente.",
        btnText: "COMPRAR",
        btnShow: true
    },
    {
        id: 3,
        nome: "Faixa Branca de Judô",
        precoAntigo: 49.90,
        preco: 39.90,
        desconto: "20% OFF",
        imagem: "imagens/jud3.jpg",
        imagens: ["imagens/jud3.jpg", "imagens/jud1.jpg"],
        avaliacao: "☆☆☆☆☆",
        descricao: "Faixa branca em algodão, ideal para iniciantes.",
        btnText: "COMPRAR",
        btnShow: true
    }
];

let produtos = JSON.parse(localStorage.getItem("produtosLoja") || "null") || produtosPadrao;

const container = document.getElementById("produtos");

const toggleVendedorBtn = document.getElementById('toggle-vendedor');
const vendedorBadge = document.getElementById('vendedor-badge');

function getCarrinho() {
    try { return JSON.parse(localStorage.getItem("carrinho") || "[]"); } catch { return []; }
}

function getUsuarioAtual() {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
}

function usuarioEhVendedor() {
    const usuario = getUsuarioAtual();
    return usuario && usuario.role === "vendedor";
}

function setVendedorMode(on) {
    if (on) {
        const user = { name: 'Vendedor', role: 'vendedor' };
        localStorage.setItem('user', JSON.stringify(user));
    } else {
        // remove only if it's a vendedor marker
        try{
            const u = JSON.parse(localStorage.getItem('user') || 'null');
            if (u && u.role === 'vendedor') localStorage.removeItem('user');
        }catch{}
    }
    renderizarFormularioVendedor();
    renderVendedorBadge();
    renderProdutos();
}

function renderVendedorBadge(){
    if (!vendedorBadge) return;
    vendedorBadge.style.display = usuarioEhVendedor() ? 'block' : 'none';
}

if (toggleVendedorBtn) {
    toggleVendedorBtn.addEventListener('click', () => {
        const isVend = usuarioEhVendedor();
        setVendedorMode(!isVend);
        toggleVendedorBtn.textContent = !isVend ? 'Sair vendedor' : 'Vendedor';
    });
}
// ajustar label inicial do toggle
if (toggleVendedorBtn) toggleVendedorBtn.textContent = usuarioEhVendedor() ? 'Sair vendedor' : 'Vendedor';

function salvarProdutosNoStorage() { localStorage.setItem("produtosLoja", JSON.stringify(produtos)); }

function obterImagens(produto) { return produto.imagens && produto.imagens.length ? produto.imagens : [produto.imagem]; }

function alternarImagemProduto(produtoCard) {
    const imagemProduto = produtoCard.querySelector(".imagem-produto");
    const imagens = JSON.parse(produtoCard.dataset.imagens || "[]");
    if (!imagemProduto || imagens.length < 2) return;
    const indiceAtual = Number(imagemProduto.dataset.indice || 0);
    const proximoIndice = indiceAtual === 0 ? 1 : 0;
    imagemProduto.src = imagens[proximoIndice];
    imagemProduto.dataset.indice = String(proximoIndice);
}

function limparFormularioVendedor() {
    document.getElementById("produto-id").value = "";
    document.getElementById("produto-nome").value = "";
    document.getElementById("produto-preco-antigo").value = "";
    document.getElementById("produto-preco").value = "";
    document.getElementById("produto-desconto").value = "";
    document.getElementById("produto-imagem").value = "";
    document.getElementById("produto-imagem-2").value = "";
    const prev1 = document.getElementById('produto-imagem-preview');
    const prev2 = document.getElementById('produto-imagem-2-preview');
    const prevText1 = document.getElementById('produto-imagem-preview-text');
    const prevText2 = document.getElementById('produto-imagem-2-preview-text');
    if (prev1) { prev1.src = ''; prev1.style.display = 'none'; }
    if (prev2) { prev2.src = ''; prev2.style.display = 'none'; }
    if (prevText1) prevText1.style.display = 'inline';
    if (prevText2) prevText2.style.display = 'inline';
    document.getElementById("cancelar-edicao-produto").style.display = "none";
    // limpar novos campos
    const desc = document.getElementById('produto-descricao'); if (desc) desc.value = '';
    const btnText = document.getElementById('produto-btn-text'); if (btnText) btnText.value = '';
    const btnShow = document.getElementById('produto-btn-show'); if (btnShow) btnShow.checked = true;
}

function popularFormularioVendedor(produto) {
    document.getElementById("produto-id").value = produto.id;
    document.getElementById("produto-nome").value = produto.nome;
    document.getElementById("produto-preco-antigo").value = produto.precoAntigo;
    document.getElementById("produto-preco").value = produto.preco;
    document.getElementById("produto-desconto").value = produto.desconto;
    document.getElementById("produto-imagem").value = produto.imagem || "";
    document.getElementById("produto-imagem-2").value = produto.imagens?.[1] || "";
    const prev1 = document.getElementById('produto-imagem-preview');
    const prev2 = document.getElementById('produto-imagem-2-preview');
    const prevText1 = document.getElementById('produto-imagem-preview-text');
    const prevText2 = document.getElementById('produto-imagem-2-preview-text');
    if (prev1) { prev1.src = produto.imagens?.[0] || produto.imagem || ''; prev1.style.display = prev1.src ? 'inline-block' : 'none'; }
    if (prev2) { prev2.src = produto.imagens?.[1] || ''; prev2.style.display = prev2.src ? 'inline-block' : 'none'; }
    if (prevText1) prevText1.style.display = prev1 && prev1.src ? 'none' : 'inline';
    if (prevText2) prevText2.style.display = prev2 && prev2.src ? 'none' : 'inline';
    document.getElementById("cancelar-edicao-produto").style.display = "inline-block";
    // novos campos
    const desc = document.getElementById('produto-descricao'); if (desc) desc.value = produto.descricao || '';
    const btnText = document.getElementById('produto-btn-text'); if (btnText) btnText.value = produto.btnText || '';
    const btnShow = document.getElementById('produto-btn-show'); if (btnShow) btnShow.checked = produto.btnShow !== false;
}

function renderizarFormularioVendedor() {
    const panel = document.getElementById("vendedor-panel"); if (!panel) return;
    panel.style.display = usuarioEhVendedor() ? "block" : "none";
}

// inicial
renderVendedorBadge();

function renderProdutos() {
    if (!container) return; container.innerHTML = '';
    produtos.forEach(produto => {
        const imagens = obterImagens(produto);
        const card = document.createElement('article'); card.className = 'produto'; card.dataset.imagens = JSON.stringify(imagens); card.dataset.id = produto.id;
        const buyLabel = produto.btnText || 'COMPRAR';
        const botoesHtml = usuarioEhVendedor()
            ? `<button type="button" class="editar-produto" data-id="${produto.id}" style="flex:1; border:none; background:#1a1a1a; color:white; height:36px; border-radius:20px; cursor:pointer;">EDITAR</button><button type="button" class="remover-produto" data-id="${produto.id}" style="width:40px; border:none; background:#c9362b; color:white; border-radius:50%; cursor:pointer;">🗑</button>`
            : `${produto.btnShow === false ? '' : `<button class="comprar" onclick="comprar(${produto.id})">${buyLabel}</button>`}<button class="carrinho-produto" onclick="adicionarCarrinho(${produto.id})">🛒</button>`;
        card.innerHTML = `
            <span class="desconto">${produto.desconto}</span>
            <img class="imagem-produto" src="${imagens[0]}" alt="${produto.nome}" data-indice="0">
            <div class="info">
                <h3 class="nome">${produto.nome}</h3>
                <div class="preco-antigo">R$ ${Number(produto.precoAntigo || produto.preco).toFixed(2).replace('.', ',')}</div>
                <div class="preco">R$ ${Number(produto.preco).toFixed(2).replace('.', ',')}</div>
                <div class="parcelamento">6x de R$ ${(Number(produto.preco) / 6).toFixed(2).replace('.', ',')} sem juros</div>
                <div class="avaliacao">${produto.avaliacao || '☆☆☆☆☆'}</div>
                <div class="botoes">${botoesHtml}</div>
            </div>`;

        card.addEventListener('click', (event) => {
            const botaoEditar = event.target.closest('.editar-produto');
            if (botaoEditar) { const produtoSelecionado = produtos.find(p => p.id === Number(botaoEditar.dataset.id)); if (produtoSelecionado) { popularFormularioVendedor(produtoSelecionado); window.scrollTo({ top: 0, behavior: 'smooth' }); } return; }
            const botaoRemover = event.target.closest('.remover-produto'); if (botaoRemover) { removerProdutoVendedor(botaoRemover.dataset.id); return; }
            const botao = event.target.closest('button'); if (botao) return;
            openProductModal(Number(card.dataset.id));
        });

        container.appendChild(card);
    });
}

function salvarProdutoVendedor(event) {
    event.preventDefault();
    const id = document.getElementById('produto-id').value;
    const nome = document.getElementById('produto-nome').value.trim();
    const precoAntigo = Number(document.getElementById('produto-preco-antigo').value || 0);
    const preco = Number(document.getElementById('produto-preco').value || 0);
    const desconto = document.getElementById('produto-desconto').value.trim() || '10% OFF';
    const imagem = document.getElementById('produto-imagem').value.trim();
    const imagem2 = document.getElementById('produto-imagem-2').value.trim();
    const descricao = document.getElementById('produto-descricao').value.trim();
    const btnText = document.getElementById('produto-btn-text').value.trim();
    const btnShow = !!document.getElementById('produto-btn-show').checked;
    if (!nome || !preco) { alert('Preencha ao menos o nome e o preço do produto.'); return; }
    const dadosProduto = { id: id ? Number(id) : Date.now(), nome, precoAntigo: precoAntigo || preco, preco, desconto, imagem: imagem || 'imagens/jud1.jpg', imagens: [imagem || 'imagens/jud1.jpg', imagem2 || imagem || 'imagens/jud2.jpg'], avaliacao: '☆☆☆☆☆', descricao: descricao || '', btnText: btnText || 'COMPRAR', btnShow };
    if (id) produtos = produtos.map(p => p.id === Number(id) ? dadosProduto : p); else produtos.push(dadosProduto);
    salvarProdutosNoStorage(); renderProdutos(); limparFormularioVendedor(); alert(id ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!');
}

function removerProdutoVendedor(id) { produtos = produtos.filter(p => p.id !== Number(id)); salvarProdutosNoStorage(); renderProdutos(); }

function adicionarCarrinho(id) { const carrinho = getCarrinho(); const produto = produtos.find(p => p.id === id); if (!produto) return; carrinho.push(produto); localStorage.setItem('carrinho', JSON.stringify(carrinho)); atualizarContador(); alert('Produto adicionado ao carrinho!'); }

function atualizarContador() { const carrinho = getCarrinho(); const contador = document.getElementById('contador'); if (contador) contador.textContent = carrinho.length; }

function comprar(id) { adicionarCarrinho(id); window.location.href = 'carrinho.html'; }

const botaoCarrinho = document.getElementById('carrinho'); if (botaoCarrinho) botaoCarrinho.addEventListener('click', () => window.location.href = 'carrinho.html');
const formProdutoVendedor = document.getElementById('form-produto-vendedor'); if (formProdutoVendedor) formProdutoVendedor.addEventListener('submit', salvarProdutoVendedor);
const cancelarEdicaoProduto = document.getElementById('cancelar-edicao-produto'); if (cancelarEdicaoProduto) cancelarEdicaoProduto.addEventListener('click', limparFormularioVendedor);

// setup: handlers para upload e previews no formulário do vendedor
function setupVendedorImageInputs() {
    const file1 = document.getElementById('produto-imagem-file');
    const file2 = document.getElementById('produto-imagem-2-file');
    const input1 = document.getElementById('produto-imagem');
    const input2 = document.getElementById('produto-imagem-2');
    const prev1 = document.getElementById('produto-imagem-preview');
    const prev2 = document.getElementById('produto-imagem-2-preview');
    const prevText1 = document.getElementById('produto-imagem-preview-text');
    const prevText2 = document.getElementById('produto-imagem-2-preview-text');

    if (file1) {
        file1.addEventListener('change', (e) => {
            const f = e.target.files[0]; if (!f) return; const fr = new FileReader(); fr.onload = () => { if (input1) input1.value = fr.result; if (prev1) { prev1.src = fr.result; prev1.style.display = 'inline-block'; } if (prevText1) prevText1.style.display = 'none'; }; fr.readAsDataURL(f);
        });
    }
    if (file2) {
        file2.addEventListener('change', (e) => {
            const f = e.target.files[0]; if (!f) return; const fr = new FileReader(); fr.onload = () => { if (input2) input2.value = fr.result; if (prev2) { prev2.src = fr.result; prev2.style.display = 'inline-block'; } if (prevText2) prevText2.style.display = 'none'; }; fr.readAsDataURL(f);
        });
    }
    if (input1) input1.addEventListener('input', () => { if (prev1) { prev1.src = input1.value || ''; prev1.style.display = input1.value ? 'inline-block' : 'none'; } if (prevText1) prevText1.style.display = input1.value ? 'none' : 'inline'; });
    if (input2) input2.addEventListener('input', () => { if (prev2) { prev2.src = input2.value || ''; prev2.style.display = input2.value ? 'inline-block' : 'none'; } if (prevText2) prevText2.style.display = input2.value ? 'none' : 'inline'; });
}

setupVendedorImageInputs(); renderizarFormularioVendedor(); renderProdutos(); atualizarContador();

// Modal de produto - abrir/fechar e popular dados
function openProductModal(id) {
    const produto = produtos.find(p => p.id === id);
    if (!produto) return;

    const modal = document.getElementById('produto-modal');
    const mainImage = document.getElementById('produto-modal-main-image');
    const thumbs = document.getElementById('produto-modal-thumbs');
    const nome = document.getElementById('produto-modal-nome');
    const preco = document.getElementById('produto-modal-preco');
    const desconto = document.getElementById('produto-modal-desconto');
    const descricao = document.getElementById('produto-modal-descricao');
    const btnEditar = document.getElementById('produto-modal-editar');
    const btnComprar = document.getElementById('produto-modal-comprar');

    const imagens = obterImagens(produto);
    mainImage.src = imagens[0] || produto.imagem || '';
    mainImage.alt = produto.nome;
    nome.textContent = produto.nome;
    preco.textContent = `R$ ${Number(produto.preco).toFixed(2).replace('.', ',')}`;
    desconto.textContent = produto.desconto || '';
    descricao.textContent = produto.descricao || (produto.avaliacao ? `Avaliação: ${produto.avaliacao}` : 'Descrição do produto.');

    // thumbs
    thumbs.innerHTML = '';
    imagens.forEach((src, idx) => {
        const t = document.createElement('img');
        t.src = src; t.alt = `${produto.nome} ${idx+1}`; t.style.width = '56px'; t.style.height = '56px'; t.style.objectFit = 'cover'; t.style.border = '1px solid #eee'; t.style.borderRadius = '6px'; t.style.cursor = 'pointer';
        t.addEventListener('click', () => { mainImage.src = src; });
        thumbs.appendChild(t);
    });

    // sizes
    const sizesContainer = document.getElementById('produto-modal-sizes');
    sizesContainer.innerHTML = '';
    const defaultSizes = produto.sizes || ['A0 - 155 cm', 'A1 - 160 cm', 'A2 - 170 cm', 'A3 - 185 cm'];
    let selectedSize = defaultSizes[1];
    defaultSizes.forEach(sz => {
        const chip = document.createElement('div'); chip.className = 'size-chip'; chip.textContent = sz;
        if (sz === selectedSize) chip.classList.add('active');
        chip.addEventListener('click', () => {
            const prev = sizesContainer.querySelector('.active'); if (prev) prev.classList.remove('active');
            chip.classList.add('active'); selectedSize = sz;
        });
        sizesContainer.appendChild(chip);
    });

    // quantity controls
    const qtyEl = document.getElementById('qty');
    const qtyDecr = document.getElementById('qty-decr');
    const qtyIncr = document.getElementById('qty-incr');
    let qty = 1;
    if (qtyEl) qtyEl.textContent = qty;
    if (qtyDecr) qtyDecr.onclick = () => { if (qty>1) { qty--; qtyEl.textContent = qty; } };
    if (qtyIncr) qtyIncr.onclick = () => { qty++; qtyEl.textContent = qty; };

    // editar visível apenas para vendedor
    if (usuarioEhVendedor()) {
        btnEditar.style.display = 'inline-block';
        btnEditar.onclick = () => { popularFormularioVendedor(produto); closeProductModal(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    } else {
        btnEditar.style.display = 'none';
        btnEditar.onclick = null;
    }

    btnComprar.onclick = () => { comprar(produto.id); };
    // ajustar label e visibilidade do botão comprar conforme produto
    btnComprar.textContent = produto.btnText || 'COMPRAR';
    btnComprar.style.display = produto.btnShow === false ? 'none' : 'inline-block';
    // small accessibility: focus first thumb
    const firstThumb = thumbs.querySelector('img'); if (firstThumb) firstThumb.tabIndex = 0;

    modal.style.display = 'flex';
    // close handlers
    const closeBtn = document.getElementById('produto-modal-close');
    if (closeBtn) closeBtn.onclick = closeProductModal;
    modal.onclick = (e) => { if (e.target === modal) closeProductModal(); };
    document.addEventListener('keydown', escModalHandler);
}

function closeProductModal() {
    const modal = document.getElementById('produto-modal');
    if (!modal) return;
    modal.style.display = 'none';
    document.removeEventListener('keydown', escModalHandler);
}

function escModalHandler(e) { if (e.key === 'Escape') closeProductModal(); }