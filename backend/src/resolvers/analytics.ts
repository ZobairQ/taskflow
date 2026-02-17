import { Context } from '../types/context';
import { AuthenticationError } from '../utils/errors';

export const analyticsResolvers = {
  Query: {
    analytics: async (
      _: any,
      { dateRange }: { dateRange: { start: Date; end: Date } },
      { user, prisma }: Context
    ) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      // Fetch tasks in date range
      const tasks = await prisma.task.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Fetch completed tasks
      const completedTasks = tasks.filter((t) => t.completed);

      // Fetch pomodoro sessions
      const sessions = await prisma.pomodoroSession.findMany({
        where: {
          userId: user.id,
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Calculate productivity metrics
      const totalTasksCreated = tasks.length;
      const totalTasksCompleted = completedTasks.length;
      const completionRate = totalTasksCreated > 0
        ? (totalTasksCompleted / totalTasksCreated) * 100
        : 0;

      // Daily breakdown
      const dailyStats: Record<string, { created: number; completed: number }> = {};
      tasks.forEach((task) => {
        const day = task.createdAt.toISOString().split('T')[0];
        if (!dailyStats[day]) dailyStats[day] = { created: 0, completed: 0 };
        dailyStats[day].created++;
      });
      completedTasks.forEach((task) => {
        if (task.completedAt) {
          const day = task.completedAt.toISOString().split('T')[0];
          if (!dailyStats[day]) dailyStats[day] = { created: 0, completed: 0 };
          dailyStats[day].completed++;
        }
      });

      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const averageDaily = daysDiff > 0 ? totalTasksCompleted / daysDiff : 0;

      // Most productive day of week
      const dayCompletions: Record<string, number> = {};
      completedTasks.forEach((task) => {
        if (task.completedAt) {
          const dayName = task.completedAt.toLocaleDateString('en-US', { weekday: 'long' });
          dayCompletions[dayName] = (dayCompletions[dayName] || 0) + 1;
        }
      });
      const mostProductiveDay = Object.entries(dayCompletions)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Monday';

      // Most productive hour
      const hourCompletions: Record<number, number> = {};
      completedTasks.forEach((task) => {
        if (task.completedAt) {
          const hour = task.completedAt.getHours();
          hourCompletions[hour] = (hourCompletions[hour] || 0) + 1;
        }
      });
      const mostProductiveHour = Object.entries(hourCompletions)
        .sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0]
        ? parseInt(Object.entries(hourCompletions)
            .sort((a, b) => (b[1] as number) - (a[1] as number))[0][0])
        : 9;

      // Calculate streak
      const gamificationProfile = await prisma.gamificationProfile.findUnique({
        where: { userId: user.id },
      });
      const streakDays = gamificationProfile?.currentStreak || 0;

      // Build daily breakdown - matching DailyMetrics type in schema
      const dailyBreakdown = Object.entries(dailyStats)
        .map(([date, stats]) => ({
          date: new Date(date),
          tasksCreated: stats.created,
          tasksCompleted: stats.completed,
          focusTime: 0,
          completionRate: stats.created > 0 ? (stats.completed / stats.created) * 100 : 0,
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      // Time tracking metrics
      const workSessions = sessions.filter((s) => s.type === 'work' && s.completed);
      const totalFocusTime = workSessions.reduce((acc, s) => acc + s.duration, 0);
      const sessionsCompleted = workSessions.length;
      const averageSessionLength = sessionsCompleted > 0 ? totalFocusTime / sessionsCompleted : 0;

      // Focus time by day - matching FocusTimeData type in schema
      const focusByDay: Record<string, number> = {};
      workSessions.forEach((session) => {
        const day = session.startTime.toISOString().split('T')[0];
        focusByDay[day] = (focusByDay[day] || 0) + session.duration;
      });
      const focusTimeByDay = Object.entries(focusByDay)
        .map(([day, minutes]) => ({ day, minutes }))
        .sort((a, b) => a.day.localeCompare(b.day));

      // Focus time by category - matching CategoryTimeData type in schema
      const taskCategories: Record<string, string> = {};
      tasks.forEach((task) => {
        taskCategories[task.id] = task.category;
      });
      const focusByCategory: Record<string, number> = {};
      workSessions.forEach((session) => {
        if (session.taskId && taskCategories[session.taskId]) {
          const category = taskCategories[session.taskId];
          focusByCategory[category] = (focusByCategory[category] || 0) + session.duration;
        }
      });
      const focusTimeByCategory = Object.entries(focusByCategory).map(([category, minutes]) => ({
        category,
        minutes,
      }));

      // Category breakdown - matching CategoryMetrics type in schema
      const categoryStats: Record<string, { total: number; completed: number }> = {};
      tasks.forEach((task) => {
        const cat = task.category || 'general';
        if (!categoryStats[cat]) categoryStats[cat] = { total: 0, completed: 0 };
        categoryStats[cat].total++;
        if (task.completed) categoryStats[cat].completed++;
      });
      const categories = Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        count: stats.total,
        completed: stats.completed,
        pending: stats.total - stats.completed,
        completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
        color: getCategoryColor(category),
      }));

      // Priority breakdown - matching PriorityMetrics type in schema
      const priorityStats: Record<string, { total: number; completed: number }> = {};
      tasks.forEach((task) => {
        const pri = task.priority || 'medium';
        if (!priorityStats[pri]) priorityStats[pri] = { total: 0, completed: 0 };
        priorityStats[pri].total++;
        if (task.completed) priorityStats[pri].completed++;
      });
      const priorities = Object.entries(priorityStats).map(([priority, stats]) => ({
        priority,
        count: stats.total,
        completed: stats.completed,
        percentage: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      }));

      // Generate insights as strings
      const insights: string[] = [];

      if (completionRate >= 80) {
        insights.push(`High Completion Rate: You completed ${completionRate.toFixed(0)}% of your tasks this period!`);
      }

      if (streakDays >= 7) {
        insights.push(`On Fire: You've maintained a ${streakDays}-day streak. Keep it up!`);
      }

      if (totalFocusTime > 0) {
        insights.push(`Focus Time: You logged ${Math.round(totalFocusTime / 60)} hours of focused work.`);
      }

      if (mostProductiveDay !== 'Monday') {
        insights.push(`Peak Performance: ${mostProductiveDay}s are your most productive days.`);
      }

      return {
        productivity: {
          totalTasksCreated,
          totalTasksCompleted,
          completionRate,
          averageDaily,
          mostProductiveDay,
          mostProductiveHour,
          streakDays,
          dailyBreakdown,
        },
        timeTracking: {
          totalFocusTime,
          averageSessionLength,
          sessionsCompleted,
          focusTimeByDay,
          focusTimeByCategory,
        },
        categories,
        priorities,
        insights,
      };
    },
  },
};

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    work: '#3B82F6',
    personal: '#10B981',
    health: '#EF4444',
    finance: '#F59E0B',
    learning: '#8B5CF6',
    general: '#6B7280',
  };
  return colors[category] || colors.general;
}
