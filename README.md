# Judô World - Loja

Esta versão usa o mesmo tipo de stack que já aparece no projeto:
Node.js + Express + SQLite + bcryptjs.

O backend cria automaticamente o banco `judo-world.db`.

## 1. Instalar

Abra o terminal dentro desta pasta:

```bash
npm install
```

## 2. Iniciar

```bash
npm start
```

Abra:

```text
http://localhost:3000
```

## 3. Cadastro

O formulário de cadastro do seu site pode enviar:

POST /api/cadastro

JSON:

```json
{
  "nome": "João",
  "email": "joao@email.com",
  "senha": "123456",
  "tipo": "vendedor"
}
```

Para aluno:

```json
{
  "nome": "Maria",
  "email": "maria@email.com",
  "senha": "123456",
  "tipo": "aluno"
}
```

## 4. Login

POST `/api/login`

JSON:

```json
{
  "email": "joao@email.com",
  "senha": "123456"
}
```

A resposta fornece um token. O frontend guarda o token em:

```text
localStorage
```

e envia:

```text
Authorization: Bearer SEU_TOKEN
```

## 5. Regras da loja

Aluno:
- vê as lojas;
- vê os produtos;
- não recebe o painel de vendedor.

Vendedor:
- cria a própria loja;
- edita a própria loja;
- cria produtos;
- edita produtos;
- exclui produtos.

O backend também verifica o proprietário da loja antes de permitir edição/exclusão.

## 6. Importante para produção

O exemplo usa um Map em memória para sessões, suficiente para desenvolvimento local.

Antes de publicar o sistema, use:
- JWT ou sessões persistentes;
- HTTPS;
- variáveis de ambiente;
- validação mais rígida;
- banco PostgreSQL/Supabase se desejar hospedagem escalável;
- armazenamento próprio para imagens.

As URLs de imagens neste exemplo são apenas links. Não há upload de arquivos implementado.
