import { query } from './db.js';

const userSelect = `
  select
    u.id,
    u.name,
    u.email,
    u.photo_url,
    u.cover_url,
    u.bio,
    u.department_id,
    u.position,
    u.phone,
    u.status,
    u.role_id,
    u.admission_date,
    u.last_seen_at,
    u.created_at,
    u.updated_at,
    case
      when d.id is null then null
      else json_build_object('id', d.id, 'name', d.name, 'description', d.description, 'created_at', d.created_at)
    end as departments,
    case
      when r.id is null then null
      else json_build_object('id', r.id, 'name', r.name, 'description', r.description, 'created_at', r.created_at)
    end as roles
  from users u
  left join departments d on d.id = u.department_id
  left join roles r on r.id = u.role_id
`;

const postSelect = `
  select
    p.id,
    p.author_id,
    p.title,
    p.content,
    p.type,
    p.image_url,
    p.video_url,
    p.pinned,
    p.visibility,
    p.community_id,
    p.created_at,
    p.updated_at,
    case
      when u.id is null then null
      else json_build_object(
        'id', u.id,
        'name', u.name,
        'email', u.email,
        'photo_url', u.photo_url,
        'position', u.position,
        'status', u.status,
        'created_at', u.created_at,
        'updated_at', u.updated_at,
        'departments', case
          when d.id is null then null
          else json_build_object('id', d.id, 'name', d.name, 'created_at', d.created_at)
        end
      )
    end as users,
    coalesce(
      (
        select json_agg(json_build_object('id', pr.id, 'user_id', pr.user_id, 'reaction', pr.reaction, 'created_at', pr.created_at))
        from post_reactions pr
        where pr.post_id = p.id
      ),
      '[]'::json
    ) as likes,
    coalesce(
      (
        select json_agg(json_build_object(
          'id', c.id,
          'content', c.content,
          'created_at', c.created_at,
          'users', case
            when cu.id is null then null
            else json_build_object('name', cu.name, 'photo_url', cu.photo_url)
          end
        ) order by c.created_at)
        from comments c
        left join users cu on cu.id = c.author_id
        where c.post_id = p.id
      ),
      '[]'::json
    ) as comments
  from posts p
  left join users u on u.id = p.author_id
  left join departments d on d.id = u.department_id
`;

const trainingSelect = `
  select
    t.id,
    t.title,
    t.description,
    t.category_id,
    t.thumbnail_url,
    t.video_url,
    t.pdf_url,
    t.duration_minutes,
    t.level,
    t.status,
    t.created_by,
    t.created_at,
    t.updated_at,
    case
      when c.id is null then null
      else json_build_object('id', c.id, 'name', c.name, 'color', c.color, 'type', c.type, 'created_at', c.created_at)
    end as categories,
    case
      when u.id is null then null
      else json_build_object('id', u.id, 'name', u.name, 'photo_url', u.photo_url)
    end as users
  from trainings t
  left join categories c on c.id = t.category_id
  left join users u on u.id = t.created_by
`;

export async function getDashboardData() {
  const [usersCount, trainingsCount, articlesCount, postsCount, recentPosts] = await Promise.all([
    query('select count(*)::int as count from users'),
    query("select count(*)::int as count from trainings where status = 'published'"),
    query("select count(*)::int as count from wiki_articles where status = 'published'"),
    query('select count(*)::int as count from posts'),
    query(`${postSelect} order by p.created_at desc limit 5`),
  ]);

  return {
    stats: {
      users: usersCount.rows[0]?.count ?? 0,
      trainings: trainingsCount.rows[0]?.count ?? 0,
      articles: articlesCount.rows[0]?.count ?? 0,
      posts: postsCount.rows[0]?.count ?? 0,
    },
    recentPosts: recentPosts.rows,
  };
}

export async function listUsers() {
  const { rows } = await query(`${userSelect} order by u.name`);
  return rows;
}

export async function listDepartments() {
  const { rows } = await query('select id, name, description, created_at from departments order by name');
  return rows;
}

export async function listTrainingCategories() {
  const { rows } = await query("select * from categories where type = 'training' order by name");
  return rows;
}

export async function listTrainings() {
  const { rows } = await query(`${trainingSelect} where t.status = 'published' order by t.created_at desc`);
  return rows;
}

export async function getTrainingData() {
  const [trainings, categories] = await Promise.all([listTrainings(), listTrainingCategories()]);
  return { trainings, categories };
}

export async function listFeedPosts() {
  const { rows } = await query(`${postSelect} order by p.pinned desc, p.created_at desc`);
  return rows;
}

export async function createFeedPost(input) {
  const authorResult = await query('select id from users order by created_at limit 1');
  const authorId = input.author_id ?? authorResult.rows[0]?.id ?? null;
  const { rows } = await query(
    `
      insert into posts (author_id, title, content, type, pinned)
      values ($1, $2, $3, $4, false)
      returning id
    `,
    [authorId, input.title ?? null, input.content, input.type ?? 'message']
  );
  const post = await query(`${postSelect} where p.id = $1 limit 1`, [rows[0].id]);
  return post.rows[0];
}
