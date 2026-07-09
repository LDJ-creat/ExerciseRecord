import client from './client'
import type { ApiResponse } from './auth'

export interface ReminderSettings {
  is_enabled: number
  remind_time: string
}

export interface ReminderLog {
  id: number
  remind_date: string
  sent_at: string | null
  status: number
}

export interface ReminderLogListData {
  items: ReminderLog[]
  total: number
  page: number
  page_size: number
}

export interface UpdateReminderPayload {
  is_enabled: number
  remind_time: string
}

export interface CreateReminderLogPayload {
  status: number
  remind_date?: string
}

export async function getReminderSettings() {
  const res = await client.get<ApiResponse<ReminderSettings>>('/reminder')
  return res.data
}

export async function updateReminderSettings(data: UpdateReminderPayload) {
  const res = await client.put<ApiResponse<ReminderSettings>>('/reminder', data)
  return res.data
}

export async function listReminderLogs(params: { page?: number; page_size?: number } = {}) {
  const res = await client.get<ApiResponse<ReminderLogListData>>('/reminder/logs', { params })
  return res.data
}

export async function createReminderLog(data: CreateReminderLogPayload) {
  const res = await client.post<ApiResponse<ReminderLog>>('/reminder/logs', data)
  return res.data
}
