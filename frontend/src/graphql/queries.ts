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
    }
  }
`;

export const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
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

// Task Queries
export const GET_TASKS = gql`
  query GetTasks($projectId: ID, $filter: TaskFilter) {
    tasks(projectId: $projectId, filter: $filter) {
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
      project {
        id
        name
        color
      }
      subtasks {
        id
        text
        completed
        createdAt
      }
      dependencies {
        id
        type
        predecessorTask {
          id
          text
          completed
        }
      }
      dependents {
        id
        type
        successorTask {
          id
          text
          completed
        }
      }
    }
  }
`;

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
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
      project {
        id
        name
        color
      }
      subtasks {
        id
        text
        completed
        createdAt
      }
      dependencies {
        id
        type
        predecessorTask {
          id
          text
          completed
        }
      }
      dependents {
        id
        type
        successorTask {
          id
          text
          completed
        }
      }
    }
  }
`;

export const GET_TASKS_BY_DATE = gql`
  query GetTasksByDate($date: DateTime!) {
    tasksByDate(date: $date) {
      id
      text
      description
      completed
      status
      priority
      category
      dueDate
      createdAt
      project {
        id
        name
        color
      }
    }
  }
`;

export const SEARCH_TASKS = gql`
  query SearchTasks($query: String!) {
    searchTasks(query: $query) {
      id
      text
      description
      completed
      status
      priority
      category
      dueDate
      createdAt
      project {
        id
        name
        color
      }
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

export const GET_ACHIEVEMENTS = gql`
  query GetAchievements {
    achievements {
      id
      title
      description
      icon
      points
      category
      unlocked
      unlockedAt
    }
  }
`;

export const GET_DAILY_CHALLENGES = gql`
  query GetDailyChallenges($date: DateTime) {
    dailyChallenges(date: $date) {
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

export const GET_TEMPLATE = gql`
  query GetTemplate($id: ID!) {
    template(id: $id) {
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

// Analytics Queries
export const GET_ANALYTICS = gql`
  query GetAnalytics($dateRange: DateRangeInput!) {
    analytics(dateRange: $dateRange) {
      productivity {
        totalTasksCreated
        totalTasksCompleted
        completionRate
        averageDaily
        mostProductiveDay
        mostProductiveHour
        streakDays
        dailyBreakdown {
          date
          tasksCreated
          tasksCompleted
          focusTime
          completionRate
        }
      }
      timeTracking {
        totalFocusTime
        averageSessionLength
        sessionsCompleted
        focusTimeByDay {
          day
          minutes
        }
        focusTimeByCategory {
          category
          minutes
        }
      }
      categories {
        category
        count
        completed
        pending
        completionRate
        color
      }
      priorities {
        priority
        count
        completed
        percentage
      }
      insights
    }
  }
`;
