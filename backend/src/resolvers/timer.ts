import { Context } from '../types/context';
import { AuthenticationError, UserInputError } from '../utils/errors';

export const timerResolvers = {
  Query: {
    timerSessions: async (
      _: any,
      { dateRange }: { dateRange?: { start: Date; end: Date } },
      { user, prisma }: Context
    ) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const where: any = { userId: user.id };

      if (dateRange) {
        where.startTime = {
          gte: new Date(dateRange.start),
          lte: new Date(dateRange.end),
        };
      }

      return prisma.pomodoroSession.findMany({
        where,
        orderBy: { startTime: 'desc' },
      });
    },

    timerStats: async (_: any, __: any, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - 7);

      // Today's sessions
      const todaySessions = await prisma.pomodoroSession.findMany({
        where: {
          userId: user.id,
          completed: true,
          type: 'work',
          startTime: { gte: today },
        },
      });

      // Week's sessions
      const weekSessions = await prisma.pomodoroSession.findMany({
        where: {
          userId: user.id,
          completed: true,
          type: 'work',
          startTime: { gte: weekStart },
        },
      });

      // All sessions for streak calculation
      const allSessions = await prisma.pomodoroSession.findMany({
        where: {
          userId: user.id,
          completed: true,
          type: 'work',
        },
        orderBy: { startTime: 'desc' },
      });

      const todayMinutes = todaySessions.reduce((acc, s) => acc + s.duration, 0);
      const weekMinutes = weekSessions.reduce((acc, s) => acc + s.duration, 0);
      const totalSessions = allSessions.length;
      const averageSessionLength = totalSessions > 0
        ? allSessions.reduce((acc, s) => acc + s.duration, 0) / totalSessions
        : 0;

      // Calculate current streak (days with at least one session)
      let currentStreak = 0;
      const sessionDays = new Set(
        allSessions.map(s => s.startTime.toISOString().split('T')[0])
      );
      const sortedDays = Array.from(sessionDays).sort().reverse();

      for (let i = 0; i < sortedDays.length; i++) {
        const expectedDay = new Date(today);
        expectedDay.setDate(expectedDay.getDate() - i);
        const expectedDayStr = expectedDay.toISOString().split('T')[0];

        if (sortedDays.includes(expectedDayStr)) {
          currentStreak++;
        } else {
          break;
        }
      }

      return {
        todayMinutes,
        weekMinutes,
        totalSessions,
        currentStreak,
        averageSessionLength,
      };
    },
  },
  Mutation: {
    startTimer: async (
      _: any,
      { taskId, type }: { taskId?: string; type: string },
      { user, prisma }: Context
    ) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      // Check for existing active session
      const existingSession = await prisma.pomodoroSession.findFirst({
        where: {
          userId: user.id,
          completed: false,
        },
      });

      if (existingSession) {
        throw new UserInputError('You already have an active timer session');
      }

      // Validate task ownership if taskId provided
      if (taskId) {
        const task = await prisma.task.findFirst({
          where: { id: taskId, userId: user.id },
        });

        if (!task) {
          throw new UserInputError('Task not found');
        }
      }

      const durationMap: Record<string, number> = {
        work: 25,
        shortBreak: 5,
        longBreak: 15,
      };

      return prisma.pomodoroSession.create({
        data: {
          userId: user.id,
          taskId: taskId || null,
          type: type as any,
          duration: durationMap[type] || 25,
          completed: false,
        },
      });
    },

    completeTimer: async (_: any, { sessionId }: { sessionId: string }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const session = await prisma.pomodoroSession.findFirst({
        where: {
          id: sessionId,
          userId: user.id,
        },
      });

      if (!session) {
        throw new UserInputError('Timer session not found');
      }

      if (session.completed) {
        throw new UserInputError('Timer session already completed');
      }

      const updatedSession = await prisma.pomodoroSession.update({
        where: { id: sessionId },
        data: {
          completed: true,
          endTime: new Date(),
        },
      });

      // Update gamification if it was a work session - increment XP
      if (session.type === 'work') {
        await prisma.gamificationProfile.update({
          where: { userId: user.id },
          data: {
            xp: { increment: 10 },
          },
        });
      }

      return updatedSession;
    },

    pauseTimer: async (_: any, { sessionId }: { sessionId: string }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const session = await prisma.pomodoroSession.findFirst({
        where: {
          id: sessionId,
          userId: user.id,
          completed: false,
        },
      });

      if (!session) {
        throw new UserInputError('Active timer session not found');
      }

      // For pause, we just return the session - actual pause logic would need more fields
      // In a real implementation, you'd track pause time
      return session;
    },

    skipPhase: async (_: any, { sessionId }: { sessionId: string }, { user, prisma }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const session = await prisma.pomodoroSession.findFirst({
        where: {
          id: sessionId,
          userId: user.id,
          completed: false,
        },
      });

      if (!session) {
        throw new UserInputError('Active timer session not found');
      }

      // Mark current session as completed and return it
      return prisma.pomodoroSession.update({
        where: { id: sessionId },
        data: {
          completed: true,
          endTime: new Date(),
        },
      });
    },

    updateTimerSettings: async (
      _: any,
      { settings }: { settings: { workDuration: number; shortBreakDuration: number; longBreakDuration: number; sessionsBeforeLongBreak: number } },
      { user, prisma }: Context
    ) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      // In a real implementation, you'd store these settings in the user profile or a settings table
      // For now, just return the user
      return prisma.user.findUnique({
        where: { id: user.id },
      });
    },
  },
  PomodoroSession: {
    task: async (parent: any, _: any, { prisma }: Context) => {
      if (!parent.taskId) return null;
      return prisma.task.findUnique({
        where: { id: parent.taskId },
      });
    },
  },
};
