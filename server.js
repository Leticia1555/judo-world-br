/*
=====================================================
  JUDÔ WORLD - SERVIDOR
  Login + cadastro + lojas + produtos
  Banco: SQLite
=====================================================
*/

const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

/* =====================================================
   BANCO DE DADOS
===================================================== */

const db = new sqlite3.Database(path.join(__dirname, "judo-world.db"));

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL,
            tipo TEXT NOT NULL CHECK(tipo IN ('aluno','vendedor')),
            criado_em TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS lojas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vendedor_id INTEGER NOT NULL UNIQUE,
            nome TEXT NOT NULL,
            descricao TEXT DEFAULT '',
            logo TEXT DEFAULT '',
            criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
            atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(vendedor_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            loja_id INTEGER NOT NULL,
            nome TEXT NOT NULL,
            descricao TEXT DEFAULT '',
            preco REAL NOT NULL DEFAULT 0,
            imagem TEXT DEFAULT '',
            estoque INTEGER NOT NULL DEFAULT 0,
            ativo INTEGER NOT NULL DEFAULT 1,
            criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
            atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(loja_id) REFERENCES lojas(id) ON DELETE CASCADE
        )
    `);
});

/* =====================================================
   "SESSÃO" SIMPLES PARA DEMONSTRAÇÃO
   Em produção, troque por JWT ou sessão com cookie.
===================================================== */

const sessoes = new Map();

function gerarToken() {
    return require("crypto").randomBytes(32).toString("hex");
}

function usuarioLogado(req) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return null;
    return sessoes.get(token) || null;
}

function exigirLogin(req, res, next) {
    const usuario = usuarioLogado(req);

    if (!usuario) {
        return res.status(401).json({
            erro: "Faça login para continuar."
        });
    }

    req.usuario = usuario;
    next();
}

function exigirVendedor(req, res, next) {
    if (req.usuario.tipo !== "vendedor") {
        return res.status(403).json({
            erro: "Apenas vendedores podem acessar esta área."
        });
    }

    next();
}

/* =====================================================
   CADASTRO
===================================================== */

app.post("/api/cadastro", async (req, res) => {
    try {
        const { nome, email, senha, tipo } = req.body;

        if (!nome || !email || !senha || !tipo) {
            return res.status(400).json({
                erro: "Preencha todos os campos."
            });
        }

        if (!["aluno", "vendedor"].includes(tipo)) {
            return res.status(400).json({
                erro: "Tipo de conta inválido."
            });
        }

        if (senha.length < 6) {
            return res.status(400).json({
                erro: "A senha precisa ter pelo menos 6 caracteres."
            });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        db.run(
            `
            INSERT INTO usuarios (nome, email, senha, tipo)
            VALUES (?, ?, ?, ?)
            `,
            [nome.trim(), email.trim().toLowerCase(), senhaHash, tipo],
            function (erro) {
                if (erro) {
                    if (erro.message.includes("UNIQUE")) {
                        return res.status(409).json({
                            erro: "Este e-mail já está cadastrado."
                        });
                    }

                    console.error(erro);
                    return res.status(500).json({
                        erro: "Erro ao criar a conta."
                    });
                }

                return res.json({
                    sucesso: true,
                    mensagem: "Cadastro realizado com sucesso."
                });
            }
        );
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro interno." });
    }
});

/* =====================================================
   LOGIN
===================================================== */

app.post("/api/login", (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            erro: "Informe e-mail e senha."
        });
    }

    db.get(
        `
        SELECT id, nome, email, senha, tipo
        FROM usuarios
        WHERE email = ?
        `,
        [email.trim().toLowerCase()],
        async (erro, usuario) => {
            if (erro) {
                console.error(erro);
                return res.status(500).json({
                    erro: "Erro ao fazer login."
                });
            }

            if (!usuario) {
                return res.status(401).json({
                    erro: "E-mail ou senha incorretos."
                });
            }

            const senhaCorreta = await bcrypt.compare(
                senha,
                usuario.senha
            );

            if (!senhaCorreta) {
                return res.status(401).json({
                    erro: "E-mail ou senha incorretos."
                });
            }

            const token = gerarToken();

            const usuarioSeguro = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo
            };

            sessoes.set(token, usuarioSeguro);

            res.json({
                sucesso: true,
                token,
                usuario: usuarioSeguro
            });
        }
    );
});

/* =====================================================
   LOGOUT
===================================================== */

app.post("/api/logout", exigirLogin, (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    sessoes.delete(token);

    res.json({
        sucesso: true
    });
});

/* =====================================================
   USUÁRIO LOGADO
===================================================== */

app.get("/api/me", exigirLogin, (req, res) => {
    res.json({
        usuario: req.usuario
    });
});

/* =====================================================
   LISTAR LOJAS
   Aluno e visitante logado podem visualizar.
===================================================== */

app.get("/api/lojas", (req, res) => {
    db.all(
        `
        SELECT
            l.id,
            l.nome,
            l.descricao,
            l.logo,
            l.vendedor_id,
            u.nome AS vendedor_nome
        FROM lojas l
        JOIN usuarios u ON u.id = l.vendedor_id
        ORDER BY l.id DESC
        `,
        [],
        (erro, lojas) => {
            if (erro) {
                console.error(erro);
                return res.status(500).json({
                    erro: "Erro ao carregar lojas."
                });
            }

            res.json({ lojas });
        }
    );
});

/* =====================================================
   CRIAR OU ATUALIZAR LOJA
===================================================== */

app.post(
    "/api/minha-loja",
    exigirLogin,
    exigirVendedor,
    (req, res) => {
        const { nome, descricao, logo } = req.body;

        if (!nome?.trim()) {
            return res.status(400).json({
                erro: "Informe o nome da loja."
            });
        }

        db.get(
            `
            SELECT id
            FROM lojas
            WHERE vendedor_id = ?
            `,
            [req.usuario.id],
            (erro, loja) => {
                if (erro) {
                    return res.status(500).json({
                        erro: "Erro ao consultar loja."
                    });
                }

                if (loja) {
                    db.run(
                        `
                        UPDATE lojas
                        SET nome = ?,
                            descricao = ?,
                            logo = ?,
                            atualizado_em = CURRENT_TIMESTAMP
                        WHERE vendedor_id = ?
                        `,
                        [
                            nome.trim(),
                            descricao || "",
                            logo || "",
                            req.usuario.id
                        ],
                        (erroUpdate) => {
                            if (erroUpdate) {
                                return res.status(500).json({
                                    erro: "Erro ao atualizar loja."
                                });
                            }

                            res.json({
                                sucesso: true,
                                mensagem: "Loja atualizada."
                            });
                        }
                    );
                } else {
                    db.run(
                        `
                        INSERT INTO lojas
                            (vendedor_id, nome, descricao, logo)
                        VALUES (?, ?, ?, ?)
                        `,
                        [
                            req.usuario.id,
                            nome.trim(),
                            descricao || "",
                            logo || ""
                        ],
                        function (erroInsert) {
                            if (erroInsert) {
                                return res.status(500).json({
                                    erro: "Erro ao criar loja."
                                });
                            }

                            res.json({
                                sucesso: true,
                                id: this.lastID,
                                mensagem: "Loja criada."
                            });
                        }
                    );
                }
            }
        );
    }
);

/* =====================================================
   MINHA LOJA
===================================================== */

app.get(
    "/api/minha-loja",
    exigirLogin,
    exigirVendedor,
    (req, res) => {
        db.get(
            `
            SELECT *
            FROM lojas
            WHERE vendedor_id = ?
            `,
            [req.usuario.id],
            (erro, loja) => {
                if (erro) {
                    return res.status(500).json({
                        erro: "Erro ao carregar loja."
                    });
                }

                res.json({
                    loja: loja || null
                });
            }
        );
    }
);

/* =====================================================
   LISTAR PRODUTOS DA LOJA
===================================================== */

app.get("/api/lojas/:lojaId/produtos", (req, res) => {
    db.all(
        `
        SELECT *
        FROM produtos
        WHERE loja_id = ?
          AND ativo = 1
        ORDER BY id DESC
        `,
        [req.params.lojaId],
        (erro, produtos) => {
            if (erro) {
                return res.status(500).json({
                    erro: "Erro ao carregar produtos."
                });
            }

            res.json({ produtos });
        }
    );
});

/* =====================================================
   CRIAR PRODUTO
===================================================== */

app.post(
    "/api/produtos",
    exigirLogin,
    exigirVendedor,
    (req, res) => {
        const {
            nome,
            descricao,
            preco,
            imagem,
            estoque
        } = req.body;

        if (!nome?.trim()) {
            return res.status(400).json({
                erro: "Informe o nome do produto."
            });
        }

        const precoNumero = Number(preco);
        const estoqueNumero = Number(estoque);

        if (!Number.isFinite(precoNumero) || precoNumero < 0) {
            return res.status(400).json({
                erro: "Preço inválido."
            });
        }

        if (!Number.isInteger(estoqueNumero) || estoqueNumero < 0) {
            return res.status(400).json({
                erro: "Estoque inválido."
            });
        }

        db.get(
            `
            SELECT id
            FROM lojas
            WHERE vendedor_id = ?
            `,
            [req.usuario.id],
            (erro, loja) => {
                if (erro) {
                    return res.status(500).json({
                        erro: "Erro ao consultar loja."
                    });
                }

                if (!loja) {
                    return res.status(400).json({
                        erro: "Crie sua loja antes de cadastrar produtos."
                    });
                }

                db.run(
                    `
                    INSERT INTO produtos
                        (loja_id, nome, descricao, preco, imagem, estoque)
                    VALUES (?, ?, ?, ?, ?, ?)
                    `,
                    [
                        loja.id,
                        nome.trim(),
                        descricao || "",
                        precoNumero,
                        imagem || "",
                        estoqueNumero
                    ],
                    function (erroInsert) {
                        if (erroInsert) {
                            return res.status(500).json({
                                erro: "Erro ao criar produto."
                            });
                        }

                        res.json({
                            sucesso: true,
                            id: this.lastID
                        });
                    }
                );
            }
        );
    }
);

/* =====================================================
   EDITAR PRODUTO
   O vendedor só consegue alterar produto da própria loja.
===================================================== */

app.put(
    "/api/produtos/:id",
    exigirLogin,
    exigirVendedor,
    (req, res) => {
        const {
            nome,
            descricao,
            preco,
            imagem,
            estoque,
            ativo
        } = req.body;

        db.run(
            `
            UPDATE produtos
            SET nome = ?,
                descricao = ?,
                preco = ?,
                imagem = ?,
                estoque = ?,
                ativo = ?,
                atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
              AND loja_id IN (
                  SELECT id
                  FROM lojas
                  WHERE vendedor_id = ?
              )
            `,
            [
                String(nome || "").trim(),
                descricao || "",
                Number(preco),
                imagem || "",
                Number(estoque),
                ativo === false ? 0 : 1,
                req.params.id,
                req.usuario.id
            ],
            function (erro) {
                if (erro) {
                    return res.status(500).json({
                        erro: "Erro ao editar produto."
                    });
                }

                if (this.changes === 0) {
                    return res.status(404).json({
                        erro: "Produto não encontrado."
                    });
                }

                res.json({
                    sucesso: true,
                    mensagem: "Produto atualizado."
                });
            }
        );
    }
);

/* =====================================================
   EXCLUIR PRODUTO
===================================================== */

app.delete(
    "/api/produtos/:id",
    exigirLogin,
    exigirVendedor,
    (req, res) => {
        db.run(
            `
            DELETE FROM produtos
            WHERE id = ?
              AND loja_id IN (
                  SELECT id
                  FROM lojas
                  WHERE vendedor_id = ?
              )
            `,
            [req.params.id, req.usuario.id],
            function (erro) {
                if (erro) {
                    return res.status(500).json({
                        erro: "Erro ao excluir produto."
                    });
                }

                if (this.changes === 0) {
                    return res.status(404).json({
                        erro: "Produto não encontrado."
                    });
                }

                res.json({
                    sucesso: true,
                    mensagem: "Produto excluído."
                });
            }
        );
    }
);

/* =====================================================
   PÁGINA
===================================================== */

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "loja.html"));
});

/* =====================================================
   INICIAR
===================================================== */

app.listen(PORT, () => {
    console.log(`Judô World rodando em http://localhost:${PORT}`);
});
