/* =====================================================
   DADOS DOS PRODUTOS
===================================================== */

let produtos = JSON.parse(
    localStorage.getItem("produtosJudo")
) || [

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


/* =====================================================
   ELEMENTOS
===================================================== */

const products = document.getElementById("products");
const empty = document.getElementById("empty");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sellerPanel = document.getElementById("sellerPanel");
const sellerButton = document.getElementById("sellerButton");
const themeButton = document.getElementById("themeButton");
const cartCount = document.getElementById("cartCount");

const API_BASE = '/api';

function getToken() {
    return localStorage.getItem('token');
}


/* =====================================================
   TIPO DE USUÁRIO
===================================================== */

const tipoUsuario =
    localStorage.getItem("tipoUsuario") || "aluno";


/* =====================================================
   MOSTRAR ÁREA DO VENDEDOR
===================================================== */

if (tipoUsuario === "vendedor" && sellerButton) {
    sellerButton.style.display = "flex";
}


/* =====================================================
   BOTÃO MINHA LOJA
===================================================== */

if (sellerButton) {
    sellerButton.addEventListener('click', () => {
        sellerPanel.classList.toggle('show');
        if (sellerPanel.classList.contains('show')) {
            sellerPanel.scrollIntoView({ behavior: 'smooth' });
        }
    });
}


/* =====================================================
   FORMATAR PREÇO
===================================================== */

function formatarPreco(valor) {

    return Number(valor).toLocaleString(
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
        "produto.html?id=" + id;

}


/* =====================================================
   RENDERIZAR PRODUTOS
===================================================== */

function mostrarProdutos() {

    if (!products) return;

    const pesquisa = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const categoria = categoryFilter ? categoryFilter.value : 'todos';


    products.innerHTML = "";


    const filtrados =
        produtos.filter(function(produto) {

            const nome =
                produto.nome
                    .toLowerCase();

            const descricao =
                (produto.descricao || "")
                    .toLowerCase();


            const pesquisaOK =
                nome.includes(pesquisa) ||
                descricao.includes(pesquisa);


            const categoriaOK =
                categoria === "todos" ||
                produto.categoria === categoria;


            return pesquisaOK &&
                   categoriaOK;

        });


    if (filtrados.length === 0) {

        if (empty) empty.style.display = 'block';
        return;

    }


    if (empty) empty.style.display = 'none';


    filtrados.forEach(function(produto) {

        const card =
            document.createElement("article");


        card.className =
            "product-card";


        card.innerHTML = `

            <button
                class="product-click"
                onclick="abrirProduto(${produto.id})"
                aria-label="Ver ${produto.nome}">

                <div class="product-image">

                    ${produto.icone || "🥋"}

                </div>

            </button>


            <div class="product-info">

                <div class="product-category">

                    ${produto.categoria}

                </div>


                <h2 class="product-name">

                    ${produto.nome}

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
                        onclick="abrirProduto(${produto.id})">

                        Ver produto

                    </button>

                </div>


                ${
                    tipoUsuario === "vendedor"
                    ? `

                        <div class="seller-actions">

                            <button
                                class="edit-button"
                                onclick="editarProduto(${produto.id})">

                                ✏️ Editar

                            </button>


                            <button
                                class="delete-button"
                                onclick="excluirProduto(${produto.id})">

                                🗑️ Excluir

                            </button>

                        </div>

                    `
                    : ""
                }

            </div>

        `;


        products.appendChild(card);

    });

}


/* =====================================================
   PESQUISA
===================================================== */

if (searchInput) searchInput.addEventListener('input', mostrarProdutos);


/* =====================================================
   FILTRO
===================================================== */

if (categoryFilter) categoryFilter.addEventListener('change', mostrarProdutos);


/* =====================================================
   BOTÃO DE PESQUISA
===================================================== */

function focarPesquisa() {

    searchInput.focus();

    searchInput.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =====================================================
   SALVAR LOJA
===================================================== */

const storeForm = document.getElementById('storeForm');
if (storeForm) {
    storeForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const nome = document.getElementById('storeName').value.trim();
        const descricao = document.getElementById('storeDescription').value.trim();

        const token = getToken();
        if (token) {
            try {
                const res = await fetch(`${API_BASE}/minha-loja`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ nome, descricao })
                });

                const data = await res.json();
                if (!res.ok) {
                    alert(data.erro || 'Erro ao salvar loja.');
                    return;
                }

                // opcionalmente guardar nome/descricao localmente para exibir rápido
                localStorage.setItem('nomeLoja', nome);
                localStorage.setItem('descricaoLoja', descricao);
                atualizarLoja();
                alert('Loja salva com sucesso!');

            } catch (err) {
                console.error(err);
                alert('Erro de rede ao salvar loja.');
            }

        } else {
            // fallback local
            localStorage.setItem('nomeLoja', nome);
            localStorage.setItem('descricaoLoja', descricao);
            atualizarLoja();
            alert('Loja salva localmente. Faça login para salvar no servidor.');
        }
    });
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


    if (nome) {

        document.getElementById(
            "displayStoreName"
        ).textContent = nome;

        document.getElementById(
            "storeName"
        ).value = nome;

    }


    if (descricao) {

        document.getElementById(
            "displayStoreDescription"
        ).textContent = descricao;

        document.getElementById(
            "storeDescription"
        ).value = descricao;

    }

}


/* =====================================================
   ADICIONAR PRODUTO
===================================================== */

const productForm = document.getElementById('productForm');
if (productForm) {
    productForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const nome = document.getElementById('productName').value.trim();
        const categoria = document.getElementById('productCategory').value;
        const preco = Number(document.getElementById('productPrice').value);
        const icone = document.getElementById('productIcon').value.trim() || '🥋';
        const descricao = document.getElementById('productDescription').value.trim();

        if (!nome || preco <= 0) {
            alert('Preencha o nome e um preço válido.');
            return;
        }

        const token = getToken();
        if (token) {
            try {
                const res = await fetch(`${API_BASE}/produtos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ nome, descricao, preco, imagem: icone, estoque: 10 })
                });

                const data = await res.json();
                if (!res.ok) {
                    alert(data.erro || 'Erro ao criar produto.');
                    return;
                }

                // adicionar produto retornado pelo servidor
                const novoProduto = {
                    id: Date.now(),
                    backendId: data.id,
                    nome,
                    categoria,
                    preco,
                    icone,
                    descricao
                };

                produtos.push(novoProduto);
                localStorage.setItem('produtosJudo', JSON.stringify(produtos));
                this.reset();
                document.getElementById('productIcon').value = '🥋';
                mostrarProdutos();
                alert('Produto adicionado com sucesso!');

            } catch (err) {
                console.error(err);
                alert('Erro de rede ao criar produto.');
            }

        } else {
            // fallback local
            const novoProduto = { id: Date.now(), nome, categoria, preco, icone, descricao };
            produtos.push(novoProduto);
            localStorage.setItem('produtosJudo', JSON.stringify(produtos));
            this.reset();
            document.getElementById('productIcon').value = '🥋';
            mostrarProdutos();
            alert('Produto adicionado localmente. Faça login para salvar no servidor.');
        }
    });
}


/* =====================================================
   EDITAR PRODUTO
===================================================== */

function editarProduto(id) {

    const produto =
        produtos.find(
            function(item) {

                return item.id === id;

            }
        );


    if (!produto) return;


    const novoNome = prompt('Nome do produto:', produto.nome);
    if (novoNome === null) return;

    const novoPrecoStr = prompt('Preço:', produto.preco);
    if (novoPrecoStr === null) return;

    const preco = Number(String(novoPrecoStr).replace(',', '.'));

    if (!novoNome.trim() || isNaN(preco) || preco <= 0) {
        alert('Dados inválidos.');
        return;
    }

    const token = getToken();
    if (token && produto.backendId) {
        fetch(`${API_BASE}/produtos/${produto.backendId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nome: novoNome.trim(), preco })
        }).then(async res => {
            if (!res.ok) return alert((await res.json()).erro || 'Erro ao editar produto.');
            produto.nome = novoNome.trim();
            produto.preco = preco;
            localStorage.setItem('produtosJudo', JSON.stringify(produtos));
            mostrarProdutos();
        }).catch(err => { console.error(err); alert('Erro de rede ao editar produto.'); });
        return;
    }

    produto.nome = novoNome.trim();
    produto.preco = preco;
    localStorage.setItem('produtosJudo', JSON.stringify(produtos));
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


    if (!confirmar) return;


    const produto = produtos.find(p => p.id === id);
    const token = getToken();
    if (token && produto && produto.backendId) {
        fetch(`${API_BASE}/produtos/${produto.backendId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(async res => {
            if (!res.ok) return alert((await res.json()).erro || 'Erro ao excluir produto.');
            produtos = produtos.filter(p => p.id !== id);
            localStorage.setItem('produtosJudo', JSON.stringify(produtos));
            mostrarProdutos();
        }).catch(err => { console.error(err); alert('Erro de rede ao excluir produto.'); });
        return;
    }

    produtos = produtos.filter(function(produto) { return produto.id !== id; });
    localStorage.setItem('produtosJudo', JSON.stringify(produtos));
    mostrarProdutos();

}


/* =====================================================
   CARRINHO
===================================================== */

function atualizarCarrinho() {

    const carrinho =
        JSON.parse(
            localStorage.getItem(
                "carrinhoJudo"
            )
        ) || [];


    const total =
        carrinho.reduce(
            function(soma, item) {

                return soma +
                    Number(
                        item.quantidade || 1
                    );

            },
            0
        );


    cartCount.textContent =
        total;

    if (cartCount) {
        cartCount.textContent = total;
        cartCount.style.display = total > 0 ? 'flex' : 'none';
    }

}


/* =====================================================
   MODO CLARO / ESCURO
===================================================== */

function carregarTema() {

    const tema =
        localStorage.getItem("tema");


    if (tema === "escuro") {

        document.body.classList.add(
            "dark"
        );

        if (themeButton) themeButton.textContent = "☀️";

    } else {

        document.body.classList.remove(
            "dark"
        );

        if (themeButton) themeButton.textContent = "🌙";

    }

}


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
   INICIAR
===================================================== */

async function loadFromApi() {
    try {
        const res = await fetch(`${API_BASE}/lojas`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.lojas || data.lojas.length === 0) return;

        // escolher primeira loja para exibir
        const loja = data.lojas[0];
        localStorage.setItem('nomeLoja', loja.nome);
        localStorage.setItem('descricaoLoja', loja.descricao || '');
        atualizarLoja();

        // buscar produtos da loja
        const resProd = await fetch(`${API_BASE}/lojas/${loja.id}/produtos`);
        if (!resProd.ok) return;
        const pd = await resProd.json();
        if (pd.produtos && pd.produtos.length > 0) {
            // mapear produtos do servidor para o formato local e substituir
            produtos = pd.produtos.map(p => ({
                id: Date.now() + Math.floor(Math.random()*10000),
                backendId: p.id,
                nome: p.nome,
                categoria: '',
                preco: Number(p.preco),
                icone: p.imagem || '🥋',
                descricao: p.descricao || ''
            }));

            localStorage.setItem('produtosJudo', JSON.stringify(produtos));
        }

    } catch (err) {
        console.error('Erro ao carregar dados do servidor', err);
    }
}

async function init() {
    await loadFromApi();
    atualizarLoja();
    carregarTema();
    atualizarCarrinho();
    mostrarProdutos();
}

init();