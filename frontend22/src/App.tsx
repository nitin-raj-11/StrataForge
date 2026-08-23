import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import StrategyBuilderPage from './pages/StrategyBuilderPage'
import ResultsPage from './pages/ResultsPage'
import SweepResultsPage from './pages/SweepResultsPage'
import HistoryPage from './pages/HistoryPage'
import ComparePage from './pages/ComparePage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/build" replace />} />
          <Route path="/build" element={<StrategyBuilderPage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
          <Route path="/sweeps/:id" element={<SweepResultsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
