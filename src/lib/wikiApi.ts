import type { Category, WikiArticle } from '../types';
import { apiGet } from './apiClient';
import { localDatabase } from './localDatabase';

type CategoriesResponse = {
  data?: Category[];
};

type ArticlesResponse = {
  data?: WikiArticle[];
};

export async function getWikiData() {
  try {
    const [categoriesResponse, articlesResponse] = await Promise.all([
      apiGet<CategoriesResponse>('/wiki/categories'),
      apiGet<ArticlesResponse>('/wiki/articles?status=published&pageSize=100'),
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
