import client from './client'

export interface ApiResponse<T> {
  code: number
  message: string
  data?: T
}

export interface AuthUser {
  id: number
  username: string
  nickname: string
}

export interface UserProfile {
  id: number
  username: string
  nickname: string
  avatar_url: string | null
  gender: number
  height: number | null
  weight: number | null
}

export async function register(data: {
  username: string
  password: string
  nickname: string
}) {
  const res = await client.post<ApiResponse<{ user_id: number; username: string }>>(
    '/auth/register',
    data,
  )
  return res.data
}

export async function login(data: { username: string; password: string }) {
  const res = await client.post<ApiResponse<{ token: string; user: AuthUser }>>(
    '/auth/login',
    data,
  )
  return res.data
}

export async function getProfile() {
  const res = await client.get<ApiResponse<UserProfile>>('/user/profile')
  return res.data
}

export async function updateProfile(data: {
  nickname?: string
  avatar_url?: string | null
  gender?: number
  height?: number | null
  weight?: number | null
}) {
  const res = await client.put<ApiResponse<UserProfile>>('/user/profile', data)
  return res.data
}

export async function changePassword(data: {
  old_password: string
  new_password: string
}) {
  const res = await client.put<ApiResponse<{ message: string }>>('/user/password', data)
  return res.data
}
