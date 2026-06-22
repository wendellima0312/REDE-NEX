import type { Category, Post, Training, User } from '../types';
import { apiGet, apiPost } from './apiClient';
import { localDatabase } from './localDatabase';

type ApiResponse<T> = {
  data?: T;
};

type DashboardData = Awaited<ReturnType<typeof localDatabase.getDashboardData>>;
type TrainingData = {
  trainings: Training[];
  categories: Category[];
};

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const response = await apiGet<ApiResponse<DashboardData>>('/dashboard');
    if (response.data) return response.data;
    throw new Error('Dashboard payload vazio');
  } catch {
    return localDatabase.getDashboardData();
  }
}

export async function getFeedPosts(): Promise<Post[]> {
  try {
    const response = await apiGet<ApiResponse<Post[]>>('/feed/posts');
    return response.data?.length ? response.data : localDatabase.getFeedPosts();
  } catch {
    return localDatabase.getFeedPosts();
  }
}

export async function createPost(content: string, type: Post['type']) {
  try {
    const response = await apiPost<ApiResponse<Post>>('/feed/posts', { content, type });
    return response.data ?? localDatabase.createPost(content, type);
  } catch {
    return localDatabase.createPost(content, type);
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const response = await apiGet<ApiResponse<User[]>>('/users');
    return response.data?.length ? response.data : localDatabase.getUsers() as unknown as Promise<User[]>;
  } catch {
    return localDatabase.getUsers() as unknown as Promise<User[]>;
  }
}

export async function getDepartments() {
  try {
    const response = await apiGet<ApiResponse<Array<{ id: string; name: string }>>>('/departments');
    return response.data?.length ? response.data : localDatabase.getDepartments();
  } catch {
    return localDatabase.getDepartments();
  }
}

export async function getTrainingData(): Promise<TrainingData> {
  try {
    const response = await apiGet<ApiResponse<TrainingData>>('/trainings');
    if (response.data) return response.data;
    throw new Error('Training payload vazio');
  } catch {
    return localDatabase.getTrainingData();
  }
}
