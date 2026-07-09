import client from './client'
import type { ApiResponse } from './auth'

export interface Goal {
  id: number
  period_type: number
  target_type: number
  target_value: number
  period_start: string
  period_end: string
  status: number
}

export interface GoalProgress extends Goal {
  actual_value: number
  progress_percent: number
}

export interface GoalListData {
  goals: Goal[]
}

export interface GoalProgressData {
  goals: GoalProgress[]
}

export interface CreateGoalPayload {
  period_type: number
  target_type: number
  target_value: number
  period_start: string
  period_end: string
}

export interface UpdateGoalPayload {
  target_value: number
}

export async function createGoal(data: CreateGoalPayload) {
  const res = await client.post<ApiResponse<Goal>>('/goal', data)
  return res.data
}

export async function listGoals(history = false) {
  const res = await client.get<ApiResponse<GoalListData>>('/goal', {
    params: history ? { history: 1 } : undefined,
  })
  return res.data
}

export async function updateGoal(id: number, data: UpdateGoalPayload) {
  const res = await client.put<ApiResponse<Goal>>(`/goal/${id}`, data)
  return res.data
}

export async function getGoalProgress() {
  const res = await client.get<ApiResponse<GoalProgressData>>('/goal/progress')
  return res.data
}
