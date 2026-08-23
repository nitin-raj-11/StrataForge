import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StrategyBuilderPage } from './pages/StrategyBuilderPage';
import { ResultsPage } from './pages/ResultsPage';
import { SweepResultsPage } from './pages/SweepResultsPage';
import { AppShell } from './components/layout/AppShell';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/build" replace />} />
        <Route path="/build" element={<StrategyBuilderPage />} />
        <Route path="/results/:id" element={<ResultsPage />} />
        <Route path="/sweeps/:id" element={<SweepResultsPage />} />
        <Route path="*" element={
          <AppShell>
            <div className="text-center py-20">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-slate-400 mb-8">Page not found</p>
              <a href="/build" className="text-blue-400 hover:text-blue-300">Back to Builder</a>
            </div>
          </AppShell>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
