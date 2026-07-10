import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { isAuthenticated } from '../store/auth'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import CalendarPage from '../pages/calendar/CalendarPage'
import CheckInPage from '../pages/checkin/CheckInPage'
import InsightsPage from '../pages/insights/InsightsPage'
import GoalsPage from '../pages/goals/GoalsPage'
import Profile from '../pages/profile/Profile'
import RankingPage from '../pages/ranking/RankingPage'
import ReminderHistoryPage from '../pages/settings/ReminderHistoryPage'
import ReminderSettingsPage from '../pages/settings/ReminderSettingsPage'
import SettingsPage from '../pages/settings/SettingsPage'
import StatsPage from '../pages/stats/StatsPage'

function RootRedirect() {
  return <Navigate to={isAuthenticated() ? '/checkin' : '/login'} replace />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/checkin" element={<CheckInPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/profile" element={<Profile />} />
        <Route path="/settings/reminder" element={<ReminderSettingsPage />} />
        <Route path="/settings/reminder-history" element={<ReminderHistoryPage />} />
        {/* 兼容 T01-05 旧路径 */}
        <Route path="/profile" element={<Navigate to="/settings/profile" replace />} />
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}
