import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import ProjectOverview from './pages/ProjectOverview';
import ProjectDetail from './pages/ProjectDetail';
import { SettingsPage } from './pages/SettingsPage';
import { AnalyticsDashboard } from './pages/AnalyticsPage';
import { ThemeProvider } from './ThemeContext';
import { GamificationProvider } from './GamificationContext';
import { ProjectProvider } from './ProjectContext';
import { TimerProvider } from './TimerContext';
import { TemplateProvider } from './contexts/TemplateContext';
import { ErrorBoundary } from './components/common';
import { InstallPrompt, OfflineIndicator } from './components/pwa';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ProjectProvider>
          <GamificationProvider>
            <ThemeProvider>
              <TimerProvider>
                <TemplateProvider>
                  <OfflineIndicator />
                  <InstallPrompt />
                  <Routes>
                    <Route path="/" element={<ProjectOverview />} />
                    <Route path="/project/:projectId" element={<ProjectDetail />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/analytics" element={<AnalyticsDashboard />} />
                    <Route path="/projects" element={<Navigate to="/" replace />} />
                  </Routes>
                </TemplateProvider>
              </TimerProvider>
            </ThemeProvider>
          </GamificationProvider>
        </ProjectProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// Register service worker for PWA
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    console.log('New version available! Please refresh.');
  },
  onSuccess: (registration) => {
    console.log('App is ready for offline use!');
  },
});

reportWebVitals();
