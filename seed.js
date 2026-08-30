const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'judo-world.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  const senhaHash = bcrypt.hashSync('123456', 10);

  db.get('SELECT id FROM usuarios WHERE email = ?', ['vendedor@exemplo.com'], (err, row) => {
    if (err) return console.error(err);

    if (row) {
      console.log('Vendedor já existe (id=' + row.id + ')');
      inserirLojaEProdutos(row.id);
    } else {
      db.run(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['Loja Exemplo', 'vendedor@exemplo.com', senhaHash, 'vendedor'],
        function (err) {
          if (err) return console.error(err);
          console.log('Vendedor criado (id=' + this.lastID + ')');
          inserirLojaEProdutos(this.lastID);
        }
      );
    }
  });

  function inserirLojaEProdutos(vendedorId) {
    db.get('SELECT id FROM lojas WHERE vendedor_id = ?', [vendedorId], (err, loja) => {
      if (err) return console.error(err);

      if (loja) {
        console.log('Loja já existe (id=' + loja.id + ')');
        inserirProdutos(loja.id);
      } else {
        db.run(
          'INSERT INTO lojas (vendedor_id, nome, descricao) VALUES (?, ?, ?)',
          [vendedorId, 'Judô Store', 'Loja exemplo de equipamentos de judô.'],
          function (err) {
            if (err) return console.error(err);
            console.log('Loja criada (id=' + this.lastID + ')');
            inserirProdutos(this.lastID);
          }
        );
      }
    });
  }

  function inserirProdutos(lojaId) {
    const produtos = [
      ['Kimono Básico', 'Kimono de treino leve', 149.9, '', 10],
      ['Faixa Preta', 'Faixa oficial', 49.9, '', 20],
      ['Protetor Bucal', 'Proteção para treinos', 29.9, '', 50]
    ];

    produtos.forEach(p => {
      db.get('SELECT id FROM produtos WHERE loja_id = ? AND nome = ?', [lojaId, p[0]], (err, row) => {
        if (err) return console.error(err);
        if (row) return console.log('Produto já existe:', p[0]);

        db.run(
          'INSERT INTO produtos (loja_id, nome, descricao, preco, imagem, estoque) VALUES (?, ?, ?, ?, ?, ?)',
          [lojaId, p[0], p[1], p[2], p[3], p[4]],
          function (err) {
            if (err) return console.error(err);
            console.log('Produto criado (id=' + this.lastID + '):', p[0]);
          }
        );
      });
    });
  }
});

db.on('close', () => console.log('Conexão com DB fechada.'));

// Fecha após 1s para garantir inserts concluídos
setTimeout(() => db.close(), 1000);
