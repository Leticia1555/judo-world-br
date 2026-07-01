const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const db = new sqlite3.Database(path.join(__dirname, 'judo.db'), (err) => {
  if (err) {
    console.error('Erro ao abrir banco de dados:', err.message);
    process.exit(1);
  }
  console.log('Conectado ao banco SQLite');
});

function initDb() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        faixa TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });
}

initDb();

app.post('/api/register', async (req, res) => {
  const { nome, email, senha, faixa } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ success: false, message: 'Preencha nome, email e senha.' });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    db.run(
      'INSERT INTO users (nome, email, senha, faixa) VALUES (?, ?, ?, ?)',
      [nome, email, senhaHash, faixa || null],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ success: false, message: 'Este e-mail já está cadastrado.' });
          }
          console.error(err);
          return res.status(500).json({ success: false, message: 'Erro ao cadastrar usuário.' });
        }

        res.json({ success: true, message: 'Cadastro realizado com sucesso!', user: { id: this.lastID, nome, email, faixa } });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ success: false, message: 'Informe e-mail e senha.' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Erro ao consultar usuário.' });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, user.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
    }

    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        faixa: user.faixa
      }
    });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
