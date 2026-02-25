import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import './index.css';
import { client } from './lib/apollo';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './ThemeContext';
import { GamificationProvider } from './GamificationContext';
import { ProjectProvider } from './ProjectContext';
import { TimerProvider } from './TimerContext';
import { TemplateProvider } from './contexts/TemplateContext';
import { ErrorBoundary, PageLoader, ProtectedRoute } from './components/common';
import { InstallPrompt, OfflineIndicator } from './components/pwa';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Lazy load page components for code splitting
const ProjectOverview = lazy(() => import('./pages/ProjectOverview'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const AnalyticsDashboard = lazy(() =>
  import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsDashboard }))
);
const LoginPage = lazy(() => import('./pages/LoginPage'));

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <ProjectProvider>
              <GamificationProvider>
                <ThemeProvider>
                  <TimerProvider>
                    <TemplateProvider>
                      <OfflineIndicator />
                      <InstallPrompt />
                      <Suspense fallback={<PageLoader message="Loading TaskFlow..." />}>
                        <Routes>
                          <Route path="/login" element={<LoginPage />} />
                          <Route
                            path="/"
                            element={
                              <ProtectedRoute>
                                <ProjectOverview />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/project/:projectId"
                            element={
                              <ProtectedRoute>
                                <ProjectDetail />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings"
                            element={
                              <ProtectedRoute>
                                <SettingsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/analytics"
                            element={
                              <ProtectedRoute>
                                <AnalyticsDashboard />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/projects" element={<Navigate to="/" replace />} />
                        </Routes>
                      </Suspense>
                    </TemplateProvider>
                  </TimerProvider>
                </ThemeProvider>
              </GamificationProvider>
            </ProjectProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
);

// Register service worker for PWA
serviceWorkerRegistration.register();

reportWebVitals();
