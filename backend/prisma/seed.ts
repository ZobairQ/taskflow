import { PrismaClient, TaskPriority, TaskStatus, DependencyType, PomodoroPhase } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed Achievement Definitions
  const achievements = [
    {
      id: 'first-task',
      title: 'First Steps',
      description: 'Complete your first task',
      icon: '🎯',
      points: 10,
      category: 'tasks',
    },
    {
      id: 'task-master-10',
      title: 'Task Master',
      description: 'Complete 10 tasks',
      icon: '✅',
      points: 25,
      category: 'tasks',
    },
    {
      id: 'task-master-50',
      title: 'Productivity Pro',
      description: 'Complete 50 tasks',
      icon: '🏆',
      points: 100,
      category: 'tasks',
    },
    {
      id: 'task-master-100',
      title: 'Century Club',
      description: 'Complete 100 tasks',
      icon: '💎',
      points: 250,
      category: 'tasks',
    },
    {
      id: 'streak-3',
      title: 'Getting Warmed Up',
      description: 'Maintain a 3-day streak',
      icon: '🔥',
      points: 15,
      category: 'streak',
    },
    {
      id: 'streak-7',
      title: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '⚡',
      points: 50,
      category: 'streak',
    },
    {
      id: 'streak-14',
      title: 'Fortnight Fighter',
      description: 'Maintain a 14-day streak',
      icon: '💫',
      points: 100,
      category: 'streak',
    },
    {
      id: 'streak-30',
      title: 'Monthly Master',
      description: 'Maintain a 30-day streak',
      icon: '🌟',
      points: 300,
      category: 'streak',
    },
    {
      id: 'focus-1h',
      title: 'Focus Finder',
      description: 'Complete 1 hour of focused work',
      icon: '⏰',
      points: 20,
      category: 'focus',
    },
    {
      id: 'focus-10h',
      title: 'Deep Work',
      description: 'Complete 10 hours of focused work',
      icon: '🧠',
      points: 100,
      category: 'focus',
    },
    {
      id: 'focus-100h',
      title: 'Zen Master',
      description: 'Complete 100 hours of focused work',
      icon: '🧘',
      points: 500,
      category: 'focus',
    },
    {
      id: 'high-priority-10',
      title: 'Priority Player',
      description: 'Complete 10 high-priority tasks',
      icon: '🔴',
      points: 75,
      category: 'tasks',
    },
    {
      id: 'early-bird',
      title: 'Early Bird',
      description: 'Complete a task before 8 AM',
      icon: '🌅',
      points: 25,
      category: 'special',
    },
    {
      id: 'night-owl',
      title: 'Night Owl',
      description: 'Complete a task after 11 PM',
      icon: '🦉',
      points: 25,
      category: 'special',
    },
    {
      id: 'project-creator',
      title: 'Project Planner',
      description: 'Create your first project',
      icon: '📁',
      points: 10,
      category: 'projects',
    },
    {
      id: 'template-user',
      title: 'Template Creator',
      description: 'Create your first task template',
      icon: '📋',
      points: 15,
      category: 'special',
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievementDefinition.upsert({
      where: { id: achievement.id },
      update: achievement,
      create: achievement,
    });
  }
  console.log(`Seeded ${achievements.length} achievements`);

  // Seed Daily Challenge Definitions
  const challenges = [
    {
      id: 'complete-3-tasks',
      title: 'Task Triathlete',
      description: 'Complete 3 tasks today',
      target: 3,
      reward: 30,
      icon: '🎯',
    },
    {
      id: 'complete-5-tasks',
      title: 'Task Machine',
      description: 'Complete 5 tasks today',
      target: 5,
      reward: 50,
      icon: '🔥',
    },
    {
      id: 'focus-30min',
      title: 'Focus Starter',
      description: 'Complete 30 minutes of focused work',
      target: 30,
      reward: 20,
      icon: '⏰',
    },
    {
      id: 'focus-60min',
      title: 'Focus Champion',
      description: 'Complete 60 minutes of focused work',
      target: 60,
      reward: 40,
      icon: '🧠',
    },
    {
      id: 'high-priority-1',
      title: 'Priority Crusher',
      description: 'Complete 1 high-priority task',
      target: 1,
      reward: 25,
      icon: '🔴',
    },
    {
      id: 'create-task-3',
      title: 'Planner',
      description: 'Create 3 new tasks',
      target: 3,
      reward: 15,
      icon: '📝',
    },
    {
      id: 'pomodoro-4',
      title: 'Pomodoro Pro',
      description: 'Complete 4 pomodoro sessions',
      target: 4,
      reward: 50,
      icon: '🍅',
    },
    {
      id: 'subtask-5',
      title: 'Detail Oriented',
      description: 'Complete 5 subtasks',
      target: 5,
      reward: 30,
      icon: '✨',
    },
  ];

  for (const challenge of challenges) {
    await prisma.dailyChallengeDefinition.upsert({
      where: { id: challenge.id },
      update: challenge,
      create: challenge,
    });
  }
  console.log(`Seeded ${challenges.length} daily challenges`);

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
