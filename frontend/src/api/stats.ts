import client from './client'
import type { ApiResponse } from './auth'

export type StatsPeriod = 'day' | 'week' | 'month' | 'all'
export type RankingDimension = 'count' | 'duration' | 'distance'
export type RankingPeriod = 'week' | 'month' | 'all'

export interface PersonalStatsSummary {
  total_count: number
  total_duration: number
  total_distance: number
  total_calories: number
}

export interface SportTypeStat {
  sport_type_id: number
  name: string
  count: number
  percent: number
}

export interface TrendPoint {
  date: string
  duration: number
  distance: number
}

export interface PersonalStatsData {
  summary: PersonalStatsSummary
  by_period: Array<{
    label: string
    count: number
    duration: number
    distance: number
    calories: number
  }>
  by_sport_type: SportTypeStat[]
  trend: TrendPoint[]
}

export interface RankingEntry {
  rank: number
  user_id: number
  nickname: string
  value: number
}

export interface RankingData {
  rankings: RankingEntry[]
  my_rank: {
    rank: number
    value: number
  }
}

export async function getPersonalStats(period: StatsPeriod = 'month') {
  const res = await client.get<ApiResponse<PersonalStatsData>>('/stats/personal', {
    params: { period },
  })
  return res.data
}

export async function getRanking(
  dimension: RankingDimension = 'count',
  period: RankingPeriod = 'month',
) {
  const res = await client.get<ApiResponse<RankingData>>('/stats/ranking', {
    params: { dimension, period },
  })
  return res.data
}
