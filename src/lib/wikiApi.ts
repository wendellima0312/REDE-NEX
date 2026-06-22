import type { Category, WikiArticle } from '../types';
import { localDatabase } from './localDatabase';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3333/api').replace(/\/$/, '');

type CategoriesResponse = {
  data?: Category[];
};

type ArticlesResponse = {
  data?: WikiArticle[];
};

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function getWikiData() {
  try {
    const [categoriesResponse, articlesResponse] = await Promise.all([
      request<CategoriesResponse>('/wiki/categories'),
      request<ArticlesResponse>('/wiki/articles?status=published&pageSize=100'),
    ]);

    return {
      categories: categoriesResponse.data ?? [],
      articles: articlesResponse.data ?? [],
      source: 'api' as const,
    };
  } catch {
    const fallback = await localDatabase.getWikiData();
    return {
      ...fallback,
      source: 'local' as const,
    };
  }
}
