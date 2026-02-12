import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import ProjectOverview from './pages/ProjectOverview';
import ProjectDetail from './pages/ProjectDetail';
import { ThemeProvider } from './ThemeContext';
import { GamificationProvider } from './GamificationContext';
import { ProjectProvider } from './ProjectContext';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ProjectProvider>
        <GamificationProvider>
          <ThemeProvider>
            <Routes>
              <Route path="/" element={<ProjectOverview />} />
              <Route path="/project/:projectId" element={<ProjectDetail />} />
              <Route path="/projects" element={<Navigate to="/" replace />} />
            </Routes>
          </ThemeProvider>
        </GamificationProvider>
      </ProjectProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
