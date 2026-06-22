# Rede Nex Database

SQL versionado para provisionar o banco da plataforma Rede Nex.

## Arquivos

- `rede_nex_full_setup.sql`: script consolidado para Supabase/PostgreSQL com extensoes, tabelas, indices, triggers, RLS, storage buckets e dados iniciais.

## Como executar no Supabase

1. Abra o projeto no Supabase.
2. Acesse `SQL Editor`.
3. Cole e execute o conteudo de `rede_nex_full_setup.sql`.
4. Configure no `.env` local:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

O script foi escrito para ser idempotente: pode ser executado novamente para reparar estrutura, policies e seeds principais sem duplicar os registros com chave unica.

## Observacoes

- As migrations originais continuam em `supabase/migrations`.
- O arquivo consolidado e a referencia mais simples para hospedar, revisar e recriar o banco pelo GitHub.
- As policies atuais liberam CRUD para usuarios autenticados, mantendo a mesma regra usada pela aplicacao neste estagio.
