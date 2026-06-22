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

## Observacoes

- Supabase foi removido do projeto.
- O app agora usa `src/lib/localDatabase.ts` como fonte local temporaria de dados.
- O proximo passo recomendado e criar uma API Node/Express ou Fastify usando este schema.
