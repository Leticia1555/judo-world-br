-- Schema para cadastro de contas (duas variantes: PostgreSQL e SQLite)

-- === PostgreSQL ===
-- Use este bloco se estiver usando PostgreSQL
CREATE TABLE IF NOT EXISTS accounts (
		id SERIAL PRIMARY KEY,
		nome VARCHAR(255) NOT NULL,
		email VARCHAR(255) NOT NULL UNIQUE,
		senha VARCHAR(255) NOT NULL,
		telefone VARCHAR(50),
		endereco TEXT,
		tipo VARCHAR(50) DEFAULT 'cliente',
		ativo BOOLEAN DEFAULT TRUE,
		saldo NUMERIC(12,2) DEFAULT 0.00,
		criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- === SQLite ===
-- Use este bloco se estiver usando SQLite (ex: local, testes)
CREATE TABLE IF NOT EXISTS accounts_sqlite (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		nome TEXT NOT NULL,
		email TEXT NOT NULL UNIQUE,
		senha TEXT NOT NULL,
		telefone TEXT,
		endereco TEXT,
		tipo TEXT DEFAULT 'cliente',
		ativo INTEGER DEFAULT 1,
		saldo REAL DEFAULT 0.0,
		criado_em DATETIME DEFAULT (datetime('now'))
);

-- Exemplo de seed (ajuste senhas para hashes na prática)
INSERT INTO accounts (nome, email, senha, telefone, endereco, tipo, saldo)
VALUES
	('João Silva', 'joao@example.com', 'senha_exemplo_hash', '+5511999999999', 'Rua A, 123', 'cliente', 0.00)
ON CONFLICT (email) DO NOTHING;

-- Para SQLite use:
-- INSERT OR IGNORE INTO accounts_sqlite (nome, email, senha, telefone, endereco, tipo, saldo)
-- VALUES ('João Silva', 'joao@example.com', 'senha_exemplo_hash', '+5511999999999', 'Rua A, 123', 'cliente', 0.0);

