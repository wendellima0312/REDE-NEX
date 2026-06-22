import { createServer } from 'node:http';
import { URL } from 'node:url';
import './env.js';
import { pool } from './db.js';
import { fetchBitrixUsers } from './bitrix.client.js';
import { importBitrixUsers, listBitrixImports, listBitrixUsers } from './bitrix.repository.js';
import {
  createFeedPost,
  getDashboardData,
  getTrainingData,
  listDepartments,
  listFeedPosts,
  listUsers,
} from './app.repository.js';
import {
  archiveArticle,
  createArticle,
  createCategory,
  deleteCategory,
  getArticleById,
  getArticleBySlug,
  listArticles,
  listCategories,
  listVersions,
  restoreVersion,
  searchArticles,
  updateArticle,
  updateArticleStatus,
  updateCategory,
} from './wiki.repository.js';

const port = Number(process.env.PORT || 3333);

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(payload));
}

function sendEmpty(res, status = 204) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end();
}

function sendError(res, status, code, message, details) {
  sendJson(res, status, { error: { code, message, details } });
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

function validateRequired(payload, fields) {
  const missing = fields.filter(field => !payload[field]);
  return missing.length ? `Campos obrigatorios: ${missing.join(', ')}` : null;
}

async function route(req, res) {
  if (req.method === 'OPTIONS') return sendEmpty(res);

  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const segments = path.split('/').filter(Boolean);

  try {
    if (req.method === 'GET' && path === '/api/health') {
      await pool.query('select 1');
      return sendJson(res, 200, { status: 'ok', service: 'rede-nex-api' });
    }

    if (req.method === 'GET' && path === '/api/dashboard') {
      return sendJson(res, 200, { data: await getDashboardData() });
    }

    if (req.method === 'GET' && path === '/api/users') {
      return sendJson(res, 200, { data: await listUsers() });
    }

    if (req.method === 'GET' && path === '/api/integrations/bitrix/users') {
      return sendJson(res, 200, { data: await listBitrixUsers() });
    }

    if (req.method === 'GET' && path === '/api/integrations/bitrix/imports') {
      return sendJson(res, 200, { data: await listBitrixImports() });
    }

    if (path === '/api/integrations/bitrix/users/import' && req.method === 'POST') {
      const payload = await readJson(req);
      const users = Array.isArray(payload) ? payload : payload.users;
      if (!Array.isArray(users)) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Envie um array de usuarios ou { "users": [...] }');
      }
      return sendJson(res, 201, { data: await importBitrixUsers(users, payload.source || 'manual') });
    }

    if (path === '/api/integrations/bitrix/users/sync' && req.method === 'POST') {
      const users = await fetchBitrixUsers();
      return sendJson(res, 201, { data: await importBitrixUsers(users, 'webhook') });
    }

    if (req.method === 'GET' && path === '/api/departments') {
      return sendJson(res, 200, { data: await listDepartments() });
    }

    if (req.method === 'GET' && path === '/api/trainings') {
      return sendJson(res, 200, { data: await getTrainingData() });
    }

    if (path === '/api/feed/posts') {
      if (req.method === 'GET') return sendJson(res, 200, { data: await listFeedPosts() });
      if (req.method === 'POST') {
        const payload = await readJson(req);
        const error = validateRequired(payload, ['content']);
        if (error) return sendError(res, 400, 'VALIDATION_ERROR', error);
        return sendJson(res, 201, { data: await createFeedPost(payload) });
      }
    }

    if (path === '/api/wiki/categories') {
      if (req.method === 'GET') return sendJson(res, 200, { data: await listCategories() });
      if (req.method === 'POST') {
        const payload = await readJson(req);
        const error = validateRequired(payload, ['name']);
        if (error) return sendError(res, 400, 'VALIDATION_ERROR', error);
        return sendJson(res, 201, { data: await createCategory(payload) });
      }
    }

    if (segments[0] === 'api' && segments[1] === 'wiki' && segments[2] === 'categories' && segments[3]) {
      const id = segments[3];
      if (req.method === 'PUT') {
        const payload = await readJson(req);
        const error = validateRequired(payload, ['name']);
        if (error) return sendError(res, 400, 'VALIDATION_ERROR', error);
        const category = await updateCategory(id, payload);
        return category ? sendJson(res, 200, { data: category }) : sendError(res, 404, 'NOT_FOUND', 'Categoria nao encontrada');
      }
      if (req.method === 'DELETE') {
        const removed = await deleteCategory(id);
        return removed ? sendEmpty(res) : sendError(res, 404, 'NOT_FOUND', 'Categoria nao encontrada');
      }
    }

    if (req.method === 'GET' && path === '/api/wiki/search') {
      const q = url.searchParams.get('q');
      if (!q) return sendError(res, 400, 'VALIDATION_ERROR', 'Parametro q e obrigatorio');
      return sendJson(res, 200, await searchArticles(q));
    }

    if (path === '/api/wiki/articles') {
      if (req.method === 'GET') {
        return sendJson(res, 200, await listArticles({
          categoryId: url.searchParams.get('categoryId'),
          status: url.searchParams.get('status') || 'published',
          search: url.searchParams.get('search'),
          page: url.searchParams.get('page'),
          pageSize: url.searchParams.get('pageSize'),
        }));
      }
      if (req.method === 'POST') {
        const payload = await readJson(req);
        const error = validateRequired(payload, ['title', 'slug']);
        if (error) return sendError(res, 400, 'VALIDATION_ERROR', error);
        return sendJson(res, 201, { data: await createArticle(payload) });
      }
    }

    if (req.method === 'GET' && segments[0] === 'api' && segments[1] === 'wiki' && segments[2] === 'articles' && segments[3] === 'slug' && segments[4]) {
      const article = await getArticleBySlug(segments[4]);
      return article ? sendJson(res, 200, { data: article }) : sendError(res, 404, 'NOT_FOUND', 'Artigo nao encontrado');
    }

    if (segments[0] === 'api' && segments[1] === 'wiki' && segments[2] === 'articles' && segments[3]) {
      const id = segments[3];

      if (segments[4] === 'status' && req.method === 'PATCH') {
        const payload = await readJson(req);
        const error = validateRequired(payload, ['status']);
        if (error) return sendError(res, 400, 'VALIDATION_ERROR', error);
        const article = await updateArticleStatus(id, payload.status, payload.editor_id);
        return article ? sendJson(res, 200, { data: article }) : sendError(res, 404, 'NOT_FOUND', 'Artigo nao encontrado');
      }

      if (segments[4] === 'versions' && !segments[5] && req.method === 'GET') {
        return sendJson(res, 200, { data: await listVersions(id) });
      }

      if (segments[4] === 'versions' && segments[5] && segments[6] === 'restore' && req.method === 'POST') {
        const payload = await readJson(req);
        const article = await restoreVersion(id, segments[5], payload.editor_id);
        return article ? sendJson(res, 200, { data: article }) : sendError(res, 404, 'NOT_FOUND', 'Versao nao encontrada');
      }

      if (req.method === 'GET') {
        const article = await getArticleById(id);
        return article ? sendJson(res, 200, { data: article }) : sendError(res, 404, 'NOT_FOUND', 'Artigo nao encontrado');
      }

      if (req.method === 'PUT') {
        const article = await updateArticle(id, await readJson(req));
        return article ? sendJson(res, 200, { data: article }) : sendError(res, 404, 'NOT_FOUND', 'Artigo nao encontrado');
      }

      if (req.method === 'DELETE') {
        const archived = await archiveArticle(id);
        return archived ? sendEmpty(res) : sendError(res, 404, 'NOT_FOUND', 'Artigo nao encontrado');
      }
    }

    return sendError(res, 404, 'NOT_FOUND', 'Rota nao encontrada');
  } catch (error) {
    if (error?.code === '23505') {
      return sendError(res, 409, 'CONFLICT', 'Registro duplicado', { constraint: error.constraint });
    }
    if (error instanceof SyntaxError) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'JSON invalido');
    }
    console.error(error);
    return sendError(res, 500, 'DATABASE_ERROR', 'Erro inesperado na API', { message: error.message });
  }
}

createServer(route).listen(port, () => {
  console.log(`Rede Nex API running at http://localhost:${port}/api`);
});
