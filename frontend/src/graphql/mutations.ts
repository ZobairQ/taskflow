import { gql } from '@apollo/client/core';

// Auth Mutations
export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      refreshToken
      user {
        id
        email
        name
        avatar
        createdAt
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      refreshToken
      user {
        id
        email
        name
        avatar
        createdAt
      }
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($token: String!) {
    refreshToken(token: $token) {
      token
      refreshToken
      user {
        id
        email
        name
        avatar
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($name: String, $avatar: String) {
    updateUserProfile(name: $name, avatar: $avatar) {
      id
      email
      name
      avatar
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword)
  }
`;

// Project Mutations
export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
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

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
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

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

// Task Mutations
export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
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
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
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
      subtasks {
        id
        text
        completed
        createdAt
      }
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const COMPLETE_TASK = gql`
  mutation CompleteTask($id: ID!) {
    completeTask(id: $id) {
      id
      text
      completed
      status
      completedAt
    }
  }
`;

export const BULK_COMPLETE_TASKS = gql`
  mutation BulkCompleteTasks($ids: [ID!]!) {
    bulkCompleteTasks(ids: $ids) {
      success
      processedCount
      failedCount
      errors {
        taskId
        error
      }
    }
  }
`;

export const BULK_DELETE_TASKS = gql`
  mutation BulkDeleteTasks($ids: [ID!]!) {
    bulkDeleteTasks(ids: $ids) {
      success
      processedCount
      failedCount
      errors {
        taskId
        error
      }
    }
  }
`;

// Task Dependency Mutations
export const CREATE_DEPENDENCY = gql`
  mutation CreateDependency($input: CreateDependencyInput!) {
    createDependency(input: $input) {
      id
      type
      predecessorTask {
        id
        text
      }
      successorTask {
        id
        text
      }
    }
  }
`;

export const DELETE_DEPENDENCY = gql`
  mutation DeleteDependency($id: ID!) {
    deleteDependency(id: $id)
  }
`;

// Gamification Mutations
export const ACTIVATE_POWER_UP = gql`
  mutation ActivatePowerUp($id: ID!) {
    activatePowerUp(id: $id) {
      id
      xp
      level
      activePowerUps {
        id
        name
        description
        icon
        active
        multiplier
        duration
        expiresAt
      }
    }
  }
`;

export const DEACTIVATE_POWER_UP = gql`
  mutation DeactivatePowerUp($id: ID!) {
    deactivatePowerUp(id: $id) {
      id
      xp
      level
      activePowerUps {
        id
        name
        description
        icon
        active
        multiplier
        duration
        expiresAt
      }
    }
  }
`;

// Timer Mutations
export const START_TIMER = gql`
  mutation StartTimer($taskId: ID, $type: PomodoroPhase!) {
    startTimer(taskId: $taskId, type: $type) {
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

export const PAUSE_TIMER = gql`
  mutation PauseTimer($sessionId: ID!) {
    pauseTimer(sessionId: $sessionId) {
      id
      startTime
      endTime
      duration
      type
      completed
    }
  }
`;

export const COMPLETE_TIMER = gql`
  mutation CompleteTimer($sessionId: ID!) {
    completeTimer(sessionId: $sessionId) {
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

export const SKIP_PHASE = gql`
  mutation SkipPhase($sessionId: ID!) {
    skipPhase(sessionId: $sessionId) {
      id
      startTime
      endTime
      duration
      type
      completed
    }
  }
`;

// Template Mutations
export const CREATE_TEMPLATE = gql`
  mutation CreateTemplate($input: CreateTemplateInput!) {
    createTemplate(input: $input) {
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

export const UPDATE_TEMPLATE = gql`
  mutation UpdateTemplate($id: ID!, $input: CreateTemplateInput!) {
    updateTemplate(id: $id, input: $input) {
      id
      name
      description
      category
      icon
      usageCount
    }
  }
`;

export const DELETE_TEMPLATE = gql`
  mutation DeleteTemplate($id: ID!) {
    deleteTemplate(id: $id)
  }
`;

export const USE_TEMPLATE = gql`
  mutation UseTemplate($id: ID!, $projectId: ID!) {
    useTemplate(id: $id, projectId: $projectId) {
      id
      text
      description
      status
      priority
      category
      dueDate
      createdAt
      project {
        id
        name
      }
    }
  }
`;
