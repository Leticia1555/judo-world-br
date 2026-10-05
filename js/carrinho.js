/* =====================================================
   CONFIGURAÇÃO
===================================================== */

const CHAVE_CARRINHO = "carrinhoJudo";

const CHAVE_PEDIDOS = "pedidosJudo";

const CHAVE_ENDERECO = "enderecoJudo";

const API_BASE =
    typeof API_BASE_URL !== "undefined"
        ? API_BASE_URL
        : "/api";


/* =====================================================
   CONFIGURAÇÃO DE ENTREGA E PAGAMENTO
   (ajuste os valores aqui)
===================================================== */

/* Formas de entrega: nome, prazo e preço do frete */

const OPCOES_ENTREGA = [

    {
        id: "padrao",
        nome: "Entrega padrão",
        prazo: "5 a 8 dias úteis",
        preco: 25
    },

    {
        id: "expressa",
        nome: "Entrega expressa",
        prazo: "2 a 3 dias úteis",
        preco: 45
    },

    {
        id: "retirada",
        nome: "Retirar com o vendedor",
        prazo: "combine o horário com o vendedor",
        preco: 0,
        semEndereco: true
    }

];

/*
   PIX: cada vendedor cadastra a própria chave Pix no painel
   "Minha Loja". A chave abaixo só vale para a loja local
   (a do dono do site) quando ela não tiver chave própria.

   CARTÃO (crédito e débito): o cartão é cobrado por um
   provedor (ex.: Mercado Pago) e NUNCA pelo navegador.
   Em "cartaoEndpoint" coloque o caminho, no seu servidor,
   que cria o pagamento e devolve { "url": "..." }.
   Cada vendedor recebe na conta dele. Veja o arquivo pagamento.js.
   Vazio = cartão desativado.
*/

const CONFIG_PAGAMENTO = {

    pix: {
        chave: "",
        nome: "JUDO WORLD BRASIL",
        cidade: "SAO PAULO"
    },

    cartaoEndpoint: ""      // ex.: "/pagamentos/checkout"

};

let entregaId = OPCOES_ENTREGA[0].id;



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
   PREÇO DO PRODUTO (aceita número ou texto "R$ 89,90")
===================================================== */

function precoProduto(produto) {

    let valor =
        produto.preco ??
        produto.price ??
        0;

    if (typeof valor === "string") {

        valor = valor.replace(/[^\d,.-]/g, "");

        if (valor.includes(",")) {

            valor = valor
                .replace(/\./g, "")
                .replace(",", ".");

        }

    }

    const numero = Number(valor);

    return Number.isFinite(numero) ? numero : 0;

}


/* =====================================================
   ESCAPAR HTML (evita quebrar a tela / XSS)
===================================================== */

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
        ? Math.floor(quantidade)
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

            const preco = precoProduto(produto);

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
        calcularFreteCarrinho(carrinho);

    const total =
        subtotal + frete;

    if (itemCount) itemCount.textContent = quantidadeTotal;
    if (shipping) shipping.textContent = formatarPreco(frete);
    if (totalEl) totalEl.textContent = formatarPreco(total);

    const checkoutTotalEl = document.getElementById("checkoutTotal");

    if (checkoutTotalEl) checkoutTotalEl.textContent = formatarPreco(total);

    atualizarAvisoVendedores(carrinho);

    /* =================================================
       PRODUTOS
    ================================================= */

    lista.innerHTML =
        carrinho.map(
            function (produto, indice) {

                const preco = precoProduto(produto);

                const quantidade =
                    quantidadeProduto(produto);

                const subtotalProduto =
                    preco * quantidade;

                const imagem =
                    produto.imagem ||
                    (produto.imagens && produto.imagens[0]);

                const visual =
                    imagem
                        ? `<img src="${escaparHTML(imagem)}" alt="${escaparHTML(produto.nome || "Produto")}">`
                        : `<span>${escaparHTML(produto.icone || "🥋")}</span>`;

                return `
                    <div class="produto" data-indice="${indice}">

                        <div class="produto-imagem">
                            ${visual}
                        </div>

                        <div class="produto-info">

                            <span class="categoria">
                                ${escaparHTML(produto.categoria || "")}
                            </span>

                            <h3>${escaparHTML(produto.nome || "Produto")}</h3>

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

                        <div class="produto-acoes">

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
   ENTREGA
===================================================== */

function opcaoEntrega() {

    return (
        OPCOES_ENTREGA.find(
            function (o) {

                return o.id === entregaId;

            }
        ) || OPCOES_ENTREGA[0]
    );

}


function calcularFrete(subtotal) {

    return subtotal > 0
        ? opcaoEntrega().preco
        : 0;

}


/* =====================================================
   VENDEDORES
   Cada vendedor envia e recebe o pagamento separadamente.
===================================================== */

function lojaSalva(lojaId) {

    try {

        const lista =
            JSON.parse(
                localStorage.getItem("lojasJudo") || "[]"
            );

        return (
            Array.isArray(lista)
                ? lista.find(
                    function (l) {

                        return String(l.id) === String(lojaId);

                    }
                )
                : null
        ) || null;

    } catch (error) {

        return null;

    }

}


function nomeDaLoja(lojaId) {

    if (lojaId === "local") {

        return localStorage.getItem("nomeLoja") || "Judô World Store";

    }

    const loja =
        lojaSalva(lojaId);

    return (loja && loja.nome) || "Loja do vendedor";

}


/* Chave Pix de quem vai receber o pagamento desta loja */

function chavePixDaLoja(lojaId) {

    if (lojaId === "local") {

        return (
            localStorage.getItem("chavePixLoja") ||
            (CONFIG_PAGAMENTO.pix && CONFIG_PAGAMENTO.pix.chave) ||
            ""
        );

    }

    const loja =
        lojaSalva(lojaId);

    return (loja && loja.chavePix) || "";

}


/* Separa o carrinho em um grupo por vendedor */

function agruparPorLoja(carrinho) {

    const grupos = [];

    carrinho.forEach(
        function (item) {

            const lojaId =
                item.lojaId
                    ? String(item.lojaId)
                    : "local";

            let grupo =
                grupos.find(
                    function (g) {

                        return g.lojaId === lojaId;

                    }
                );

            if (!grupo) {

                grupo = {
                    lojaId,
                    nome: nomeDaLoja(lojaId),
                    itens: [],
                    subtotal: 0
                };

                grupos.push(grupo);

            }

            grupo.itens.push(item);

        }
    );

    grupos.forEach(
        function (g) {

            g.subtotal = calcularSubtotal(g.itens);

        }
    );

    return grupos;

}


/* Um frete por vendedor (cada um envia a sua encomenda) */

function calcularFreteCarrinho(carrinho) {

    return (
        agruparPorLoja(carrinho).length *
        opcaoEntrega().preco
    );

}


function atualizarAvisoVendedores(carrinho) {

    const aviso =
        document.getElementById("avisoVendedores");

    if (!aviso) return;

    const quantidade =
        agruparPorLoja(carrinho).length;

    aviso.textContent =
        quantidade > 1
            ? `Seu carrinho tem itens de ${quantidade} vendedores. ` +
              "Cada vendedor envia e recebe o pagamento separadamente " +
              "(o frete é cobrado por vendedor)."
            : "";

}


function renderizarOpcoesEntrega() {

    const area =
        document.getElementById("opcoesEntrega");

    if (!area) return;

    area.innerHTML =
        OPCOES_ENTREGA.map(
            function (o) {

                return `
                    <label class="opcao">
                        <input type="radio" name="entrega" value="${escaparHTML(o.id)}" ${o.id === entregaId ? "checked" : ""}>
                        <span>
                            <strong>${escaparHTML(o.nome)}</strong>
                            <small>${escaparHTML(o.prazo)}</small>
                        </span>
                        <em class="opcao-preco">${o.preco > 0 ? formatarPreco(o.preco) : "Grátis"}</em>
                    </label>
                `;

            }
        ).join("");

    atualizarCamposEndereco();

}


const CAMPOS_ENDERECO_OBRIGATORIOS = [
    "entCep",
    "entRua",
    "entNumero",
    "entBairro",
    "entCidade",
    "entUf"
];


/* Na retirada não precisa de endereço */

function atualizarCamposEndereco() {

    const area =
        document.getElementById("enderecoCampos");

    const semEndereco =
        !!opcaoEntrega().semEndereco;

    if (area) {

        area.style.display =
            semEndereco ? "none" : "grid";

    }

    CAMPOS_ENDERECO_OBRIGATORIOS.forEach(
        function (id) {

            const campo =
                document.getElementById(id);

            if (campo) {

                campo.required = !semEndereco;

            }

        }
    );

}


function valorCampo(id) {

    const campo =
        document.getElementById(id);

    return campo
        ? campo.value.trim()
        : "";

}


function lerEntrega() {

    return {

        destinatario: valorCampo("entNome"),

        telefone: valorCampo("entTelefone"),

        endereco: {

            cep: valorCampo("entCep"),

            rua: valorCampo("entRua"),

            numero: valorCampo("entNumero"),

            complemento: valorCampo("entComplemento"),

            bairro: valorCampo("entBairro"),

            cidade: valorCampo("entCidade"),

            uf: valorCampo("entUf").toUpperCase()

        }

    };

}


/* Preenche com o último endereço usado neste navegador */

function preencherEntregaSalva() {

    try {

        const salvo =
            JSON.parse(
                localStorage.getItem(CHAVE_ENDERECO) || "null"
            );

        if (!salvo || !salvo.endereco) return;

        const valores = {

            entNome: salvo.destinatario,
            entTelefone: salvo.telefone,
            entCep: salvo.endereco.cep,
            entRua: salvo.endereco.rua,
            entNumero: salvo.endereco.numero,
            entComplemento: salvo.endereco.complemento,
            entBairro: salvo.endereco.bairro,
            entCidade: salvo.endereco.cidade,
            entUf: salvo.endereco.uf

        };

        Object.keys(valores).forEach(
            function (id) {

                const campo =
                    document.getElementById(id);

                if (campo && !campo.value && valores[id]) {

                    campo.value = valores[id];

                }

            }
        );

    } catch (error) {

        console.error(
            "Erro ao ler endereço salvo:",
            error
        );

    }

}


function formatarCep(valor) {

    const numeros =
        String(valor).replace(/\D/g, "").slice(0, 8);

    return numeros.length > 5
        ? numeros.slice(0, 5) + "-" + numeros.slice(5)
        : numeros;

}


/* Preenche rua, bairro, cidade e UF pelo CEP (ViaCEP) */

async function buscarCep(cep) {

    const limpo =
        String(cep).replace(/\D/g, "");

    if (limpo.length !== 8) return;

    const status =
        document.getElementById("cepStatus");

    if (status) {

        status.textContent = "Buscando endereço...";

    }

    try {

        const res =
            await fetch(
                `https://viacep.com.br/ws/${limpo}/json/`
            );

        const dados =
            await res.json();

        if (dados.erro) {

            if (status) {

                status.textContent =
                    "CEP não encontrado. Preencha o endereço.";

            }

            return;

        }

        const preencher = function (id, valor) {

            const campo =
                document.getElementById(id);

            if (campo && valor) {

                campo.value = valor;

            }

        };

        preencher("entRua", dados.logradouro);

        preencher("entBairro", dados.bairro);

        preencher("entCidade", dados.localidade);

        preencher("entUf", dados.uf);

        if (status) {

            status.textContent = "";

        }

        const numero =
            document.getElementById("entNumero");

        if (numero) {

            numero.focus();

        }

    } catch (error) {

        console.error("Erro ao buscar CEP:", error);

        if (status) {

            status.textContent =
                "Não foi possível buscar o CEP. Preencha o endereço.";

        }

    }

}


/* =====================================================
   PIX (código "copia e cola")
===================================================== */

function pixConfigurado() {

    return !!(
        CONFIG_PAGAMENTO.pix &&
        CONFIG_PAGAMENTO.pix.chave
    );

}


function crc16(texto) {

    let crc = 0xFFFF;

    for (let i = 0; i < texto.length; i++) {

        crc ^= texto.charCodeAt(i) << 8;

        for (let b = 0; b < 8; b++) {

            crc =
                (crc & 0x8000)
                    ? ((crc << 1) ^ 0x1021)
                    : (crc << 1);

            crc &= 0xFFFF;

        }

    }

    return crc.toString(16).toUpperCase().padStart(4, "0");

}


function campoPix(id, valor) {

    return (
        id +
        String(valor.length).padStart(2, "0") +
        valor
    );

}


function semAcento(texto) {

    return String(texto)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Za-z0-9 ]/g, "")
        .toUpperCase();

}


function gerarPixCopiaECola(valor, idPedido, destino) {

    const base =
        CONFIG_PAGAMENTO.pix || {};

    const pix = {

        chave:
            (destino && destino.chave) || base.chave,

        nome:
            (destino && destino.nome) || base.nome || "LOJA",

        cidade:
            (destino && destino.cidade) || base.cidade || "BRASIL"

    };

    const conta =
        campoPix("00", "br.gov.bcb.pix") +
        campoPix("01", pix.chave);

    const txid =
        String(idPedido)
            .replace(/[^A-Za-z0-9]/g, "")
            .slice(0, 25) || "***";

    const payload =
        campoPix("00", "01") +
        campoPix("01", "11") +
        campoPix("26", conta) +
        campoPix("52", "0000") +
        campoPix("53", "986") +
        campoPix("54", Number(valor).toFixed(2)) +
        campoPix("58", "BR") +
        campoPix("59", (semAcento(pix.nome).slice(0, 25) || "LOJA")) +
        campoPix("60", (semAcento(pix.cidade).slice(0, 15) || "BRASIL")) +
        campoPix("62", campoPix("05", txid)) +
        "6304";

    return payload + crc16(payload);

}


function copiarPix(botao) {

    const campo =
        document.getElementById(
            botao && botao.dataset
                ? botao.dataset.alvo
                : "pixCodigo"
        );

    if (!campo) return;

    const avisar = function () {

        if (botao) {

            botao.textContent = "Código copiado!";

        }

    };

    if (navigator.clipboard && navigator.clipboard.writeText) {

        navigator.clipboard.writeText(campo.value).then(avisar);

        return;

    }

    campo.select();

    document.execCommand("copy");

    avisar();

}


/* =====================================================
   PAGAMENTO
===================================================== */

function configurarFormasDePagamento() {

    const opcao =
        document.querySelector("#opcaoCartao input");

    const info =
        document.getElementById("cartaoInfo");

    const ativo =
        !!CONFIG_PAGAMENTO.cartaoEndpoint;

    if (opcao) {

        opcao.disabled = !ativo;

    }

    if (info) {

        info.textContent =
            ativo
                ? "Pagamento seguro"
                : "Em breve";

    }

}


/* =====================================================
   ABRIR / FECHAR CHECKOUT
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

    if (!checkout) return;

    const checkoutTotal =
        document.getElementById("checkoutTotal");

    const subtotal =
        calcularSubtotal(carrinho);

    if (checkoutTotal) {

        checkoutTotal.textContent =
            formatarPreco(subtotal + calcularFreteCarrinho(carrinho));

    }

    const confirmado =
        document.getElementById("pedidoConfirmado");

    if (confirmado) {

        confirmado.hidden = true;

    }

    renderizarOpcoesEntrega();

    configurarFormasDePagamento();

    preencherEntregaSalva();

    checkout.hidden = false;

    checkout.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


function fecharCheckout() {

    const checkout =
        document.getElementById("checkout");

    if (checkout) {

        checkout.hidden = true;

    }

    const mensagem =
        document.getElementById("paymentMessage");

    if (mensagem) {

        mensagem.textContent = "";

        mensagem.classList.remove("aviso");

    }

}


/* =====================================================
   CARTÃO: cria o pagamento no servidor e devolve o link
   do pagamento seguro do provedor
===================================================== */

async function iniciarPagamentoCartao(pedido) {

    const endpoint =
        CONFIG_PAGAMENTO.cartaoEndpoint;

    if (!endpoint) {

        return { erro: "Pagamento por cartão indisponível no momento." };

    }

    const url =
        /^https?:\/\//.test(endpoint)
            ? endpoint
            : `${API_BASE}${endpoint}`;

    try {

        const token =
            localStorage.getItem("token");

        const headers = {
            "Content-Type": "application/json"
        };

        if (token) {

            headers["Authorization"] = `Bearer ${token}`;

        }

        const res =
            await fetch(
                url,
                {
                    method: "POST",
                    headers,
                    body: JSON.stringify({ pedido })
                }
            );

        let dados = {};

        try {

            dados = await res.json();

        } catch (e) {

            dados = {};

        }

        if (!res.ok) {

            return { erro: (dados && dados.erro) || null };

        }

        if (
            dados &&
            typeof dados.url === "string" &&
            /^https:\/\//.test(dados.url)
        ) {

            return { url: dados.url };

        }

        return { erro: null };

    } catch (error) {

        console.error(
            "Erro ao iniciar pagamento com cartão:",
            error
        );

        return { erro: null };

    }

}


/*
   Quando o cliente volta do provedor, a página abre com
   ?pagamento=sucesso|pendente|falha&pedido=ID.
   Isso só informa o cliente: quem confirma o pagamento de
   verdade é o servidor (webhook), pois o endereço pode ser
   digitado por qualquer pessoa.
*/

function pedidoSalvo(idPedido) {

    try {

        const lista =
            JSON.parse(
                localStorage.getItem(CHAVE_PEDIDOS) || "[]"
            );

        return (
            Array.isArray(lista)
                ? lista.find(
                    function (p) {

                        return p.id === idPedido;

                    }
                )
                : null
        ) || null;

    } catch (error) {

        return null;

    }

}


function tratarRetornoPagamento() {

    const parametros =
        new URLSearchParams(window.location.search);

    const resultado =
        parametros.get("pagamento");

    const idPedido =
        parametros.get("pedido") || "";

    if (!resultado) return;

    const area =
        document.getElementById("pedidoConfirmado");

    const textos = {

        sucesso:
            "✅ Pagamento enviado ao provedor. " +
            "Você será avisado quando for confirmado.",

        pendente:
            "⏳ Pagamento pendente. " +
            "Ele será confirmado assim que o provedor processar.",

        falha:
            "❌ O pagamento não foi concluído. " +
            "Seu carrinho foi mantido, é só tentar de novo."

    };

    if (!textos[resultado] || !area) return;

    if (resultado !== "falha") {

        const carrinho =
            getCarrinho();

        const pedido =
            pedidoSalvo(idPedido);

        if (pedido) {

            /* tira do carrinho só os itens do vendedor que foi pago */

            const lojaPaga =
                String(pedido.lojaId || "local");

            salvarCarrinho(
                carrinho.filter(
                    function (item) {

                        return (
                            String(item.lojaId || "local") !== lojaPaga
                        );

                    }
                )
            );

        } else if (agruparPorLoja(carrinho).length <= 1) {

            salvarCarrinho([]);

        }

        renderizarCarrinho();

    }

    area.innerHTML = `

        <h2>Pedido ${escaparHTML(idPedido)}</h2>

        <p class="mensagem aviso">${textos[resultado]}</p>

        <a class="continuar" href="loja.html">Continuar comprando</a>

    `;

    area.hidden = false;

    if (window.history && window.history.replaceState) {

        window.history.replaceState(
            null,
            "",
            window.location.pathname
        );

    }

}


/* =====================================================
   PEDIDO
===================================================== */

function salvarPedido(pedido) {

    try {

        const lista =
            JSON.parse(
                localStorage.getItem(CHAVE_PEDIDOS) || "[]"
            );

        const pedidos =
            Array.isArray(lista) ? lista : [];

        pedidos.unshift(pedido);

        localStorage.setItem(
            CHAVE_PEDIDOS,
            JSON.stringify(pedidos.slice(0, 20))
        );

    } catch (error) {

        console.error("Erro ao salvar pedido:", error);

    }

}


/* Tenta registrar o pedido no servidor (se o vendedor estiver logado) */

async function enviarPedidoAoServidor(pedido) {

    const token =
        localStorage.getItem("token");

    if (!token) return false;

    try {

        const res =
            await fetch(
                `${API_BASE}/pedidos`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify(pedido)
                }
            );

        return res.ok;

    } catch (error) {

        return false;

    }

}


function mostrarConfirmacao(pedidos, noServidor) {

    const area =
        document.getElementById("pedidoConfirmado");

    if (!area) return;

    const totalGeral =
        pedidos.reduce(
            function (soma, p) {

                return soma + p.total;

            },
            0
        );

    const blocos =
        pedidos.map(
            function (p, i) {

                const ent = p.entrega;

                const end = ent.endereco;

                const destino =
                    ent.retirada
                        ? "Retirada com o vendedor"
                        : `${end.rua}, ${end.numero}` +
                          (end.complemento ? ` - ${end.complemento}` : "") +
                          ` · ${end.bairro} · ${end.cidade}/${end.uf} · CEP ${end.cep}`;

                let pagamento = "";

                if (p.pagamento.pix) {

                    pagamento = `
                        <p>Copie o código e cole no app do seu banco (Pix copia e cola).</p>
                        <textarea id="pixCodigo${i}" class="pix-codigo" readonly rows="4">${escaparHTML(p.pagamento.pix)}</textarea>
                        <button class="pagar copiar-pix" type="button" data-alvo="pixCodigo${i}">Copiar código Pix</button>
                    `;

                } else if (p.pagamento.url) {

                    pagamento = `
                        <a class="pagar" href="${escaparHTML(p.pagamento.url)}" rel="noopener">Pagar com cartão</a>
                    `;

                }

                return `
                    <div class="pedido-loja">

                        <h3 class="etapa">🏪 ${escaparHTML(p.lojaNome)}</h3>

                        <p class="pedido-numero">Pedido ${escaparHTML(p.id)}</p>

                        <div class="linha">
                            <span>Entrega</span>
                            <span class="linha-texto">${escaparHTML(ent.nome)} (${escaparHTML(ent.prazo)})</span>
                        </div>

                        <div class="linha">
                            <span>Destino</span>
                            <span class="linha-texto">${escaparHTML(destino)}</span>
                        </div>

                        <div class="linha total">
                            <span>Total</span>
                            <strong>${formatarPreco(p.total)}</strong>
                        </div>

                        ${pagamento}

                    </div>
                `;

            }
        ).join("");

    area.innerHTML = `

        <h2>✅ Pedido recebido</h2>

        ${
            pedidos.length > 1
                ? `<p>Seu carrinho tinha itens de ${pedidos.length} vendedores. Cada um recebe o próprio pagamento: pague cada pedido abaixo.</p>`
                : ""
        }

        ${blocos}

        ${
            pedidos.length > 1
                ? `<div class="linha total"><span>Total geral</span><strong>${formatarPreco(totalGeral)}</strong></div>`
                : ""
        }

        <p class="mensagem">
            Status: aguardando pagamento.${noServidor ? "" : " Pedido registrado neste dispositivo."}
        </p>

        <a class="continuar" href="loja.html">Continuar comprando</a>

    `;

    area.hidden = false;

    area.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


async function finalizarPedido(event) {

    event.preventDefault();

    const carrinho =
        getCarrinho();

    const mensagem =
        document.getElementById("paymentMessage");

    const botao =
        document.getElementById("payBtn");

    const avisar = function (texto) {

        if (mensagem) {

            mensagem.textContent = texto;

            mensagem.classList.add("aviso");

        }

    };

    if (!carrinho || carrinho.length === 0) {

        avisar("Seu carrinho está vazio.");

        return;

    }

    const selecionado =
        document.querySelector('input[name="payment"]:checked');

    const forma =
        selecionado ? selecionado.value : "";

    if (!forma) {

        avisar("Escolha uma forma de pagamento.");

        return;

    }

    const grupos =
        agruparPorLoja(carrinho);

    /* Pix: cada vendedor precisa ter cadastrado a chave dele */

    if (forma === "pix") {

        const semPix =
            grupos.filter(
                function (g) {

                    return !chavePixDaLoja(g.lojaId);

                }
            );

        if (semPix.length > 0) {

            avisar(
                semPix.length === 1
                    ? `A loja ${semPix[0].nome} ainda não aceita Pix.`
                    : "Algumas lojas ainda não aceitam Pix: " +
                      semPix.map(function (g) { return g.nome; }).join(", ") + "."
            );

            return;

        }

    }

    if (forma === "card" && !CONFIG_PAGAMENTO.cartaoEndpoint) {

        avisar("Pagamento por cartão indisponível no momento.");

        return;

    }

    if (botao) {

        botao.disabled = true;

    }

    const opcao =
        opcaoEntrega();

    const dadosEntrega =
        lerEntrega();

    const baseId =
        "JW" + Date.now().toString(36).toUpperCase();

    /* um pedido por vendedor */

    const pedidos =
        grupos.map(
            function (g, i) {

                const frete =
                    calcularFrete(g.subtotal);

                return {

                    id:
                        grupos.length > 1
                            ? `${baseId}-${i + 1}`
                            : baseId,

                    criadoEm: new Date().toISOString(),

                    lojaId:
                        g.lojaId === "local"
                            ? null
                            : g.lojaId,

                    lojaNome: g.nome,

                    itens:
                        g.itens.map(
                            function (item) {

                                return {
                                    id: item.id,
                                    backendId: item.backendId || null,
                                    nome: item.nome,
                                    preco: precoProduto(item),
                                    quantidade: Number(item.quantidade) || 1
                                };

                            }
                        ),

                    subtotal: g.subtotal,

                    frete,

                    total: g.subtotal + frete,

                    entrega: {
                        opcao: opcao.id,
                        nome: opcao.nome,
                        prazo: opcao.prazo,
                        retirada: !!opcao.semEndereco,
                        destinatario: dadosEntrega.destinatario,
                        telefone: dadosEntrega.telefone,
                        endereco: opcao.semEndereco ? null : dadosEntrega.endereco
                    },

                    pagamento: {
                        forma,
                        status: "aguardando_pagamento"
                    }

                };

            }
        );

    if (!opcao.semEndereco) {

        try {

            localStorage.setItem(
                CHAVE_ENDERECO,
                JSON.stringify(dadosEntrega)
            );

        } catch (e) {}

    }

    /* =========================================
       CARTÃO: cada vendedor recebe na conta dele
       (o servidor cria um pagamento por vendedor)
    ========================================= */

    if (forma === "card") {

        const resultados =
            await Promise.all(
                pedidos.map(iniciarPagamentoCartao)
            );

        const falha =
            resultados.find(
                function (r) {

                    return !r.url;

                }
            );

        if (falha) {

            avisar(
                falha.erro ||
                "Não foi possível iniciar o pagamento com cartão. " +
                "Tente de novo ou pague com Pix."
            );

            if (botao) {

                botao.disabled = false;

            }

            return;

        }

        pedidos.forEach(
            function (p, i) {

                p.pagamento.url = resultados[i].url;

                salvarPedido(p);

            }
        );

        /* o carrinho só é esvaziado quando o cliente volta do pagamento */

        if (pedidos.length === 1) {

            window.location.href = resultados[0].url;

            return;

        }

        fecharCheckout();

        mostrarConfirmacao(pedidos, true);

        if (botao) {

            botao.disabled = false;

        }

        return;

    }

    /* =========================================
       PIX: um código para a chave de cada vendedor
    ========================================= */

    pedidos.forEach(
        function (p) {

            p.pagamento.pix =
                gerarPixCopiaECola(
                    p.total,
                    p.id,
                    {
                        chave: chavePixDaLoja(p.lojaId || "local"),
                        nome: p.lojaNome,
                        cidade: "BRASIL"
                    }
                );

            salvarPedido(p);

        }
    );

    const enviados =
        await Promise.all(
            pedidos.map(enviarPedidoAoServidor)
        );

    salvarCarrinho([]);

    renderizarCarrinho();

    mostrarConfirmacao(
        pedidos,
        enviados.every(Boolean)
    );

    if (botao) {

        botao.disabled = false;

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

        if (event.target.closest("#checkoutBtn")) {

            abrirCheckout();

            return;

        }

        if (event.target.closest("#closeCheckout")) {

            fecharCheckout();

            return;

        }

        const botaoCopiar =
            event.target.closest(".copiar-pix");

        if (botaoCopiar) {

            copiarPix(botaoCopiar);

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

        tratarRetornoPagamento();

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
window.finalizarPedido = finalizarPedido;


/* =====================================================
   FORMULÁRIO DE ENTREGA E PAGAMENTO
===================================================== */

document.addEventListener(
    "submit",
    function (event) {

        if (event.target.id === "checkoutForm") {

            finalizarPedido(event);

        }

    }
);

document.addEventListener(
    "change",
    function (event) {

        if (event.target.name === "entrega") {

            entregaId = event.target.value;

            atualizarCamposEndereco();

            renderizarCarrinho();

        }

    }
);

document.addEventListener(
    "input",
    function (event) {

        if (event.target.id === "entCep") {

            event.target.value =
                formatarCep(event.target.value);

            if (event.target.value.length === 9) {

                buscarCep(event.target.value);

            }

        }

    }
);