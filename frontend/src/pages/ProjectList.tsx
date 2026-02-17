import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../ProjectContext';

export default function ProjectList() {
  const { projects } = useProjects();
  const navigate = useNavigate();

  // Redirect to the overview page which now serves as the main projects page
  useEffect(() => {
    navigate('/');
  }, [projects, navigate]);

  return null;
}
