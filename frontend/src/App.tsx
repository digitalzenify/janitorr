import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { RulesPage } from './pages/RulesPage'
import { RuleEditorPage } from './pages/RuleEditorPage'
import { MediaPage } from './pages/MediaPage'
import { LogsPage } from './pages/LogsPage'
import { HistoryPage } from './pages/HistoryPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/rules/new" element={<RuleEditorPage />} />
          <Route path="/rules/:id" element={<RuleEditorPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
