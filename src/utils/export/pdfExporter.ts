/**
 * PDF Exporter - Export tasks to PDF format (via printable HTML)
 * This generates a printable HTML that browsers can save as PDF
 */

import { Task } from '../../types/task.types';
import { ExportOptions } from '../../types/importExport.types';

interface PDFStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
}

function calculateStats(tasks: Task[]): PDFStats {
  return {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed && (!t.status || t.status === 'pending')).length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    highPriority: tasks.filter(t => t.priority === 'high').length,
    mediumPriority: tasks.filter(t => t.priority === 'medium').length,
    lowPriority: tasks.filter(t => t.priority === 'low').length,
  };
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Generate printable HTML report
 */
export function exportToPDF(tasks: Task[], options: ExportOptions): string {
  // Filter tasks
  let filteredTasks = [...tasks];

  if (!options.includeCompleted) {
    filteredTasks = filteredTasks.filter(t => !t.completed);
  }

  if (options.dateRange) {
    const startDate = new Date(options.dateRange.start).getTime();
    const endDate = new Date(options.dateRange.end).getTime();
    filteredTasks = filteredTasks.filter(t => t.createdAt >= startDate && t.createdAt <= endDate);
  }

  // Sort by priority (high first) then by due date
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  filteredTasks.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return b.createdAt - a.createdAt;
  });

  const stats = calculateStats(filteredTasks);
  const reportDate = formatDate(Date.now());

  // Group by status
  const completedTasks = filteredTasks.filter(t => t.completed);
  const pendingTasks = filteredTasks.filter(t => !t.completed);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TaskFlow Report - ${reportDate}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none !important; }
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e2e8f0;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #6366f1;
      margin-bottom: 8px;
    }
    .report-date {
      color: #64748b;
      font-size: 14px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 40px;
    }
    .stat-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #1e293b;
    }
    .stat-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .section {
      margin-bottom: 32px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .task-list {
      list-style: none;
    }
    .task-item {
      padding: 12px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 8px;
      background: white;
      page-break-inside: avoid;
    }
    .task-item.completed {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }
    .task-item.high {
      border-left: 4px solid #ef4444;
    }
    .task-item.medium {
      border-left: 4px solid #f59e0b;
    }
    .task-item.low {
      border-left: 4px solid #10b981;
    }
    .task-title {
      font-weight: 500;
      margin-bottom: 4px;
    }
    .task-item.completed .task-title {
      text-decoration: line-through;
      color: #94a3b8;
    }
    .task-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #64748b;
    }
    .priority-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
    }
    .priority-high { background: #fee2e2; color: #dc2626; }
    .priority-medium { background: #fef3c7; color: #d97706; }
    .priority-low { background: #d1fae5; color: #059669; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
    }
    .empty-state {
      text-align: center;
      padding: 24px;
      color: #94a3b8;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">TaskFlow Report</div>
    <div class="report-date">Generated on ${reportDate}</div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">${stats.total}</div>
      <div class="stat-label">Total Tasks</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.completed}</div>
      <div class="stat-label">Completed</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.pending}</div>
      <div class="stat-label">Pending</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.highPriority}</div>
      <div class="stat-label">High Priority</div>
    </div>
  </div>

  ${pendingTasks.length > 0 ? `
  <div class="section">
    <h2 class="section-title">
      <span>Pending Tasks</span>
      <span style="font-size: 14px; color: #64748b; font-weight: normal;">(${pendingTasks.length})</span>
    </h2>
    <ul class="task-list">
      ${pendingTasks.map(task => `
        <li class="task-item ${task.priority}">
          <div class="task-title">${escapeHtml(task.text)}</div>
          <div class="task-meta">
            <span class="priority-badge priority-${task.priority}">${task.priority}</span>
            ${task.dueDate ? `<span>Due: ${task.dueDate}</span>` : ''}
            ${task.category ? `<span>${task.category}</span>` : ''}
          </div>
        </li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  ${completedTasks.length > 0 && options.includeCompleted ? `
  <div class="section">
    <h2 class="section-title">
      <span>Completed Tasks</span>
      <span style="font-size: 14px; color: #64748b; font-weight: normal;">(${completedTasks.length})</span>
    </h2>
    <ul class="task-list">
      ${completedTasks.map(task => `
        <li class="task-item completed ${task.priority}">
          <div class="task-title">${escapeHtml(task.text)}</div>
          <div class="task-meta">
            <span class="priority-badge priority-${task.priority}">${task.priority}</span>
            ${task.completedAt ? `<span>Completed: ${formatDate(task.completedAt)}</span>` : ''}
          </div>
        </li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  ${filteredTasks.length === 0 ? `
  <div class="empty-state">No tasks to display</div>
  ` : ''}

  <div class="footer">
    <p>Generated by TaskFlow - Your Personal Productivity Companion</p>
  </div>

  <script>
    // Auto-trigger print dialog
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  return html;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Open PDF in new window for printing/saving
 */
export function openPDFReport(tasks: Task[], options: ExportOptions): void {
  const html = exportToPDF(tasks, options);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
