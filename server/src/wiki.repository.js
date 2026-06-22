import { query } from './db.js';

const articleSelect = `
  select
    a.id,
    a.title,
    a.slug,
    a.content,
    a.status,
    a.tags,
    a.category_id,
    a.author_id,
    a.created_at,
    a.updated_at,
    json_build_object(
      'id', c.id,
      'name', c.name,
      'color', c.color,
      'description', c.description,
      'icon', c.icon
    ) as categories,
    case
      when u.id is null then null
      else json_build_object(
        'id', u.id,
        'name', u.name,
        'photo_url', u.photo_url,
        'position', u.position
      )
    end as users
  from wiki_articles a
  left join categories c on c.id = a.category_id
  left join users u on u.id = a.author_id
`;

export async function listCategories() {
  const { rows } = await query(`
    select
      c.id,
      c.name,
      c.description,
      c.icon,
      c.color,
      c.parent_id,
      c.type,
      c.created_at,
      count(a.id)::int as article_count
    from categories c
    left join wiki_articles a on a.category_id = c.id and a.status <> 'archived'
    where c.type = 'wiki'
    group by c.id
    order by c.name
  `);
  return rows;
}

export async function createCategory(input) {
  const { rows } = await query(
    `
      insert into categories (name, description, icon, color, type)
      values ($1, $2, $3, $4, 'wiki')
      returning *
    `,
    [input.name, input.description ?? null, input.icon ?? null, input.color ?? '#0057b8']
  );
  return rows[0];
}

export async function updateCategory(id, input) {
  const { rows } = await query(
    `
      update categories
      set name = $2, description = $3, icon = $4, color = $5
      where id = $1 and type = 'wiki'
      returning *
    `,
    [id, input.name, input.description ?? null, input.icon ?? null, input.color ?? '#0057b8']
  );
  return rows[0] ?? null;
}

export async function deleteCategory(id) {
  const { rowCount } = await query('delete from categories where id = $1 and type = $2', [id, 'wiki']);
  return rowCount > 0;
}

export async function listArticles(filters) {
  const page = Math.max(Number(filters.page ?? 1), 1);
  const pageSize = Math.min(Math.max(Number(filters.pageSize ?? 50), 1), 100);
  const offset = (page - 1) * pageSize;
  const params = [
    filters.status ?? 'published',
    filters.categoryId || null,
    filters.search || null,
    pageSize,
    offset,
  ];
  const where = `
    where ($1::text is null or a.status = $1)
      and ($2::uuid is null or a.category_id = $2)
      and (
        $3::text is null
        or a.title ilike '%' || $3 || '%'
        or a.content ilike '%' || $3 || '%'
        or exists (
          select 1 from unnest(coalesce(a.tags, array[]::text[])) tag
          where tag ilike '%' || $3 || '%'
        )
      )
  `;

  const [{ rows }, countResult] = await Promise.all([
    query(`${articleSelect} ${where} order by a.updated_at desc limit $4 offset $5`, params),
    query(`select count(*)::int as total from wiki_articles a ${where}`, params.slice(0, 3)),
  ]);

  return {
    data: rows,
    meta: {
      page,
      pageSize,
      total: countResult.rows[0]?.total ?? 0,
    },
  };
}

export function searchArticles(term) {
  return listArticles({ search: term, status: 'published', page: 1, pageSize: 20 });
}

export async function getArticleById(id) {
  const { rows } = await query(`${articleSelect} where a.id = $1 limit 1`, [id]);
  return rows[0] ?? null;
}

export async function getArticleBySlug(slug) {
  const { rows } = await query(`${articleSelect} where a.slug = $1 limit 1`, [slug]);
  return rows[0] ?? null;
}

export async function createArticle(input) {
  const { rows } = await query(
    `
      with inserted as (
        insert into wiki_articles (title, slug, content, category_id, author_id, status, tags)
        values ($1, $2, $3, $4, $5, coalesce($6, 'draft'), $7)
        returning *
      ),
      version as (
        insert into wiki_versions (article_id, content, editor_id, version_number)
        select id, content, author_id, 1 from inserted
      )
      select * from inserted
    `,
    [
      input.title,
      input.slug,
      input.content ?? '',
      input.category_id ?? null,
      input.author_id ?? null,
      input.status ?? 'draft',
      input.tags ?? [],
    ]
  );
  return getArticleById(rows[0].id);
}

export async function updateArticle(id, input) {
  const { rows } = await query(
    `
      with next_version as (
        select coalesce(max(version_number), 0) + 1 as value
        from wiki_versions
        where article_id = $1
      ),
      updated as (
        update wiki_articles
        set
          title = coalesce($2, title),
          slug = coalesce($3, slug),
          content = coalesce($4, content),
          category_id = coalesce($5::uuid, category_id),
          status = coalesce($6, status),
          tags = coalesce($7::text[], tags),
          updated_at = now()
        where id = $1
        returning *
      ),
      version as (
        insert into wiki_versions (article_id, content, editor_id, version_number)
        select updated.id, updated.content, $8, next_version.value
        from updated, next_version
      )
      select * from updated
    `,
    [
      id,
      input.title ?? null,
      input.slug ?? null,
      input.content ?? null,
      input.category_id ?? null,
      input.status ?? null,
      input.tags ?? null,
      input.editor_id ?? input.author_id ?? null,
    ]
  );
  return rows[0] ? getArticleById(rows[0].id) : null;
}

export function updateArticleStatus(id, status, editorId) {
  return updateArticle(id, { status, editor_id: editorId });
}

export async function archiveArticle(id) {
  const { rowCount } = await query(
    `update wiki_articles set status = 'archived', updated_at = now() where id = $1`,
    [id]
  );
  return rowCount > 0;
}

export async function listVersions(articleId) {
  const { rows } = await query(
    `
      select
        v.id,
        v.article_id,
        v.version_number,
        v.created_at,
        case
          when u.id is null then null
          else json_build_object('id', u.id, 'name', u.name, 'photo_url', u.photo_url)
        end as editor
      from wiki_versions v
      left join users u on u.id = v.editor_id
      where v.article_id = $1
      order by v.version_number desc
    `,
    [articleId]
  );
  return rows;
}

export async function restoreVersion(articleId, versionId, editorId) {
  const { rows } = await query('select content from wiki_versions where id = $1 and article_id = $2', [versionId, articleId]);
  if (!rows[0]) return null;
  return updateArticle(articleId, { content: rows[0].content, editor_id: editorId });
}
