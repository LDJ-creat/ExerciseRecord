import client from './client'
import type { ApiResponse } from './auth'

export interface SportType {
  id: number
  code: string
  name: string
  need_distance: number
  need_calories: number
}

export interface CheckInRecord {
  id: number
  sport_type_id: number
  check_date: string
  duration: number
  distance: number | null
  calories: number | null
  remark: string | null
  is_makeup: number
}

export interface CheckInListData {
  items: CheckInRecord[]
  total: number
  page: number
  page_size: number
}

export interface CreateCheckInPayload {
  sport_type_id: number
  check_date: string
  duration: number
  distance?: number
  calories?: number
  remark?: string
}

export interface UpdateCheckInPayload {
  sport_type_id?: number
  check_date?: string
  duration?: number
  distance?: number | null
  calories?: number | null
  remark?: string | null
}

export interface ListCheckInsParams {
  start_date?: string
  end_date?: string
  sport_type_id?: number
  page?: number
  page_size?: number
}

export async function getSportTypes() {
  const res = await client.get<ApiResponse<SportType[]>>('/sport-types')
  return res.data
}

export async function createCheckIn(data: CreateCheckInPayload) {
  const res = await client.post<ApiResponse<CheckInRecord>>('/checkin', data)
  return res.data
}

export async function listCheckIns(params: ListCheckInsParams = {}) {
  const res = await client.get<ApiResponse<CheckInListData>>('/checkin/list', { params })
  return res.data
}

export async function getCheckIn(id: number) {
  const res = await client.get<ApiResponse<CheckInRecord>>(`/checkin/${id}`)
  return res.data
}

export async function updateCheckIn(id: number, data: UpdateCheckInPayload) {
  const res = await client.put<ApiResponse<CheckInRecord>>(`/checkin/${id}`, data)
  return res.data
}

export async function deleteCheckIn(id: number) {
  const res = await client.delete<ApiResponse<{ message: string }>>(`/checkin/${id}`)
  return res.data
}
