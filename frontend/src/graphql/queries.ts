import { gql } from '@apollo/client/core';

// Auth Queries
export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      avatar
      createdAt
      lastLoginAt
    }
  }
`;

// Project Queries
export const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      description
      color
      createdAt
      updatedAt
      completedTodos
      totalTodos
      tasks {
        id
        text
        description
        completed
        status
        priority
        category
        dueDate
        createdAt
        updatedAt
        completedAt
        startedAt
        isRecurring
        canStart
        subtasks {
          id
          text
          completed
          createdAt
        }
      }
    }
  }
`;

export const GET_PROJECT_STATS = gql`
  query GetProjectStats {
    projectStats {
      totalProjects
      totalTodos
      totalCompleted
      totalActive
    }
  }
`;

// Gamification Queries
export const GET_GAME_PROFILE = gql`
  query GetGameProfile {
    gameProfile {
      id
      xp
      level
      currentStreak
      maxStreak
      lastStreakDate
      totalTasksCompleted
      completedTasksToday
      xpProgress
      streakBadge {
        color
        emoji
        multiplier
      }
      achievements {
        id
        achievement {
          id
          title
          description
          icon
          points
          category
        }
        unlockedAt
      }
      dailyChallenges {
        id
        challenge {
          id
          title
          description
          target
          reward
          icon
        }
        current
        completed
        completedAt
      }
    }
  }
`;

// Timer Queries
export const GET_TIMER_SESSIONS = gql`
  query GetTimerSessions($dateRange: DateRangeInput) {
    timerSessions(dateRange: $dateRange) {
      id
      startTime
      endTime
      duration
      type
      completed
      task {
        id
        text
      }
    }
  }
`;

export const GET_TIMER_STATS = gql`
  query GetTimerStats {
    timerStats {
      todayMinutes
      weekMinutes
      totalSessions
      currentStreak
      averageSessionLength
    }
  }
`;

// Template Queries
export const GET_TEMPLATES = gql`
  query GetTemplates($category: String) {
    templates(category: $category) {
      id
      name
      description
      category
      icon
      isBuiltIn
      createdAt
      usageCount
    }
  }
`;

export const GET_MOST_USED_TEMPLATES = gql`
  query GetMostUsedTemplates($limit: Int) {
    mostUsedTemplates(limit: $limit) {
      id
      name
      description
      category
      icon
      usageCount
    }
  }
`;
