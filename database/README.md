# Rede Nex Database

SQL local versionado para provisionar o banco da plataforma Rede Nex.

## Arquivos

- `local_postgres_schema.sql`: schema PostgreSQL local com tabelas, indices, triggers e dados iniciais.

## Como executar localmente com PostgreSQL

1. Crie o banco:

```bash
createdb rede_nex
```

2. Execute o schema:

```bash
psql -d rede_nex -f database/local_postgres_schema.sql
```

3. Configure uma API local para expor esse banco ao frontend.

O frontend nao deve conectar diretamente no SQL. O navegador conversa com uma API, e a API conversa com PostgreSQL, MySQL ou SQLite.

## Como ligar o app ao PostgreSQL local

1. Copie `.env.example` para `.env`.
2. Ajuste `DATABASE_URL` com a senha do seu PostgreSQL:

```env
DATABASE_URL=postgres://postgres:SUA_SENHA@localhost:5432/rede_nex
PORT=3333
VITE_API_URL=http://localhost:3333/api
```

3. Em um terminal, inicie a API:

```bash
npm run api
```

4. Em outro terminal, inicie o app:

```bash
npm run dev
```

5. Teste a API:

```text
http://localhost:3333/api/health
http://localhost:3333/api/wiki/categories
http://localhost:3333/api/wiki/articles
http://localhost:3333/api/dashboard
http://localhost:3333/api/feed/posts
http://localhost:3333/api/users
http://localhost:3333/api/trainings
```

## Observacoes

- Supabase foi removido do projeto.
- As telas usam a API local em `server/src/server.js` e voltam para `src/lib/localDatabase.ts` se a API estiver desligada.
