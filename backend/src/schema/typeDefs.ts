import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # ============================================================================
  # SCALARS
  # ============================================================================

  scalar DateTime
  scalar JSON

  # ============================================================================
  # ENUMS
  # ============================================================================

  enum TaskStatus {
    pending
    in_progress
    completed
  }

  enum TaskPriority {
    low
    medium
    high
  }

  enum DependencyType {
    blocks
    blockedBy
    relatesTo
  }

  enum PomodoroPhase {
    work
    shortBreak
    longBreak
  }

  # ============================================================================
  # USER TYPES
  # ============================================================================

  type User {
    id: ID!
    email: String!
    name: String
    avatar: String
    createdAt: DateTime!
    lastLoginAt: DateTime

    projects: [Project!]!
    tasks: [Task!]!
    gameProfile: GamificationProfile
    templates: [Template!]!
    achievements: [UserAchievement!]!
    analytics(dateRange: DateRangeInput): AnalyticsOverview!
  }

  type AuthPayload {
    token: String!
    user: User!
    refreshToken: String!
  }

  # ============================================================================
  # PROJECT TYPES
  # ============================================================================

  type Project {
    id: ID!
    name: String!
    description: String!
    color: String!
    createdAt: DateTime!
    updatedAt: DateTime!

    tasks: [Task!]!
    completedTodos: Int!
    totalTodos: Int!
  }

  type ProjectStats {
    totalProjects: Int!
    totalTodos: Int!
    totalCompleted: Int!
    totalActive: Int!
  }

  # ============================================================================
  # TASK TYPES
  # ============================================================================

  type Task {
    id: ID!
    text: String!
    description: String!
    completed: Boolean!
    status: TaskStatus!
    priority: TaskPriority!
    category: String!
    dueDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    completedAt: DateTime
    startedAt: DateTime

    project: Project!
    user: User!

    subtasks: [Subtask!]

    isRecurring: Boolean!
    recurrencePattern: RecurrencePattern
    recurrenceInstances: [RecurringTaskInstance!]
    parentRecurringId: ID

    dependencies: [TaskDependency!]!
    dependents: [TaskDependency!]!
    canStart: Boolean!

    notificationSettings: NotificationSettings
  }

  type Subtask {
    id: ID!
    text: String!
    completed: Boolean!
    createdAt: DateTime!
  }

  type RecurrencePattern {
    frequency: String!
    interval: Int!
    daysOfWeek: [Int!]
    dayOfMonth: Int
    monthOfYear: Int
    endDate: DateTime
    maxOccurrences: Int
    customDays: [Int!]
  }

  type RecurringTaskInstance {
    instanceId: ID!
    parentTaskId: ID!
    dueDate: DateTime!
    generatedAt: DateTime!
    occurrenceNumber: Int!
    modified: Boolean
    completed: Boolean
  }

  type TaskDependency {
    id: ID!
    predecessorTask: Task!
    successorTask: Task!
    type: DependencyType!
    createdAt: DateTime!
  }

  type NotificationSettings {
    enabled: Boolean!
    timing: [Int!]!
    type: String!
  }

  # ============================================================================
  # GAMIFICATION TYPES
  # ============================================================================

  type GamificationProfile {
    id: ID!
    xp: Int!
    level: Int!
    currentStreak: Int!
    maxStreak: Int!
    lastStreakDate: DateTime
    totalTasksCompleted: Int!
    completedTasksToday: Int!
    activePowerUps: [PowerUp!]!

    achievements: [UserAchievement!]!
    dailyChallenges(date: DateTime): [UserDailyChallenge!]!
    streakBadge: StreakBadge!
    xpProgress: Float!
  }

  type Achievement {
    id: ID!
    title: String!
    description: String!
    icon: String!
    points: Int!
    category: String
    unlocked: Boolean!
    unlockedAt: DateTime
  }

  type UserAchievement {
    id: ID!
    achievement: Achievement!
    unlockedAt: DateTime!
  }

  type UserDailyChallenge {
    id: ID!
    challenge: DailyChallenge!
    current: Int!
    completed: Boolean!
    completedAt: DateTime
  }

  type DailyChallenge {
    id: ID!
    title: String!
    description: String!
    target: Int!
    reward: Int!
    icon: String!
  }

  type PowerUp {
    id: ID!
    name: String!
    description: String!
    icon: String!
    active: Boolean!
    multiplier: Float!
    duration: Int!
    expiresAt: DateTime
    activatedAt: DateTime
    requiredLevel: Int
    rarity: String
  }

  type StreakBadge {
    color: String!
    emoji: String!
    multiplier: Float!
  }

  # ============================================================================
  # TIMER TYPES
  # ============================================================================

  type PomodoroSession {
    id: ID!
    startTime: DateTime!
    endTime: DateTime
    duration: Int!
    type: PomodoroPhase!
    task: Task
    completed: Boolean!
  }

  type TimerStats {
    todayMinutes: Int!
    weekMinutes: Int!
    totalSessions: Int!
    currentStreak: Int!
    averageSessionLength: Float!
  }

  # ============================================================================
  # TEMPLATE TYPES
  # ============================================================================

  type Template {
    id: ID!
    name: String!
    description: String!
    category: String!
    icon: String!
    isBuiltIn: Boolean!
    createdAt: DateTime!
    usageCount: Int!
    templateData: TaskTemplateData!
  }

  type TaskTemplateData {
    text: String!
    description: String
    priority: TaskPriority!
    category: String
    subtasks: [TemplateSubtask!]
    recurrencePattern: RecurrencePattern
    dueDate: DateTime
    tags: [String!]
  }

  type TemplateSubtask {
    text: String!
    completed: Boolean!
  }

  # ============================================================================
  # ANALYTICS TYPES
  # ============================================================================

  type AnalyticsOverview {
    productivity: ProductivityMetrics!
    timeTracking: TimeTrackingMetrics!
    categories: [CategoryMetrics!]!
    priorities: [PriorityMetrics!]!
    insights: [String!]!
  }

  type ProductivityMetrics {
    totalTasksCreated: Int!
    totalTasksCompleted: Int!
    completionRate: Float!
    averageDaily: Float!
    mostProductiveDay: String!
    mostProductiveHour: Int!
    streakDays: Int!
    dailyBreakdown: [DailyMetrics!]!
  }

  type DailyMetrics {
    date: DateTime!
    tasksCreated: Int!
    tasksCompleted: Int!
    focusTime: Int!
    completionRate: Float!
  }

  type TimeTrackingMetrics {
    totalFocusTime: Int!
    averageSessionLength: Float!
    sessionsCompleted: Int!
    focusTimeByDay: [FocusTimeData!]!
    focusTimeByCategory: [CategoryTimeData!]!
  }

  type FocusTimeData {
    day: String!
    minutes: Int!
  }

  type CategoryTimeData {
    category: String!
    minutes: Int!
  }

  type CategoryMetrics {
    category: String!
    count: Int!
    completed: Int!
    pending: Int!
    completionRate: Float!
    color: String!
  }

  type PriorityMetrics {
    priority: String!
    count: Int!
    completed: Int!
    percentage: Float!
  }

  # ============================================================================
  # INPUT TYPES
  # ============================================================================

  input CreateTaskInput {
    text: String!
    description: String
    priority: TaskPriority
    category: String
    dueDate: DateTime
    projectId: ID!
    subtasks: [SubtaskInput!]
    isRecurring: Boolean
    recurrencePattern: RecurrencePatternInput
    notificationSettings: NotificationSettingsInput
  }

  input UpdateTaskInput {
    id: ID!
    text: String
    description: String
    status: TaskStatus
    priority: TaskPriority
    category: String
    dueDate: DateTime
    subtasks: [SubtaskInput!]
    notificationSettings: NotificationSettingsInput
  }

  input SubtaskInput {
    id: ID
    text: String!
    completed: Boolean
  }

  input RecurrencePatternInput {
    frequency: String!
    interval: Int!
    daysOfWeek: [Int!]
    dayOfMonth: Int
    monthOfYear: Int
    endDate: DateTime
    maxOccurrences: Int
    customDays: [Int!]
  }

  input NotificationSettingsInput {
    enabled: Boolean!
    timing: [Int!]!
    type: String!
  }

  input CreateProjectInput {
    name: String!
    description: String
    color: String
  }

  input UpdateProjectInput {
    id: ID!
    name: String
    description: String
    color: String
  }

  input DateRangeInput {
    start: DateTime!
    end: DateTime!
  }

  input CreateDependencyInput {
    predecessorTaskId: ID!
    successorTaskId: ID!
    type: DependencyType!
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateTemplateInput {
    name: String!
    description: String!
    category: String!
    icon: String!
    templateData: TaskTemplateDataInput!
  }

  input TaskTemplateDataInput {
    text: String!
    description: String
    priority: TaskPriority!
    category: String
    subtasks: [TemplateSubtaskInput!]
    recurrencePattern: RecurrencePatternInput
    tags: [String!]
  }

  input TemplateSubtaskInput {
    text: String!
    completed: Boolean!
  }

  input TaskFilter {
    status: TaskStatus
    priority: TaskPriority
    category: String
    dueBefore: DateTime
    dueAfter: DateTime
    completed: Boolean
  }

  input SearchFilterInput {
    field: String!
    operator: String!
    value: JSON!
  }

  input TimerSettingsInput {
    workDuration: Int!
    shortBreakDuration: Int!
    longBreakDuration: Int!
    sessionsBeforeLongBreak: Int!
  }

  # ============================================================================
  # BULK OPERATION TYPES
  # ============================================================================

  type BulkActionResult {
    success: Boolean!
    processedCount: Int!
    failedCount: Int!
    errors: [BulkActionError!]
  }

  type BulkActionError {
    taskId: ID!
    error: String!
  }

  # ============================================================================
  # QUERIES
  # ============================================================================

  type Query {
    # Auth
    me: User

    # Projects
    projects: [Project!]!
    project(id: ID!): Project
    projectStats: ProjectStats!

    # Tasks
    tasks(projectId: ID, filter: TaskFilter): [Task!]!
    task(id: ID!): Task
    tasksByDate(date: DateTime!): [Task!]!

    # Gamification
    gameProfile: GamificationProfile
    achievements: [Achievement!]!
    dailyChallenges(date: DateTime): [UserDailyChallenge!]!

    # Timer
    timerSessions(dateRange: DateRangeInput): [PomodoroSession!]!
    timerStats: TimerStats!

    # Templates
    templates(category: String): [Template!]!
    template(id: ID!): Template
    mostUsedTemplates(limit: Int): [Template!]!

    # Analytics
    analytics(dateRange: DateRangeInput!): AnalyticsOverview!

    # Search
    searchTasks(query: String!, filters: [SearchFilterInput!]): [Task!]!
  }

  # ============================================================================
  # MUTATIONS
  # ============================================================================

  type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    loginWithGoogle(code: String!): AuthPayload!
    loginWithGitHub(code: String!): AuthPayload!
    refreshToken(token: String!): AuthPayload!
    logout: Boolean!

    # Projects
    createProject(input: CreateProjectInput!): Project!
    updateProject(input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!

    # Tasks
    createTask(input: CreateTaskInput!): Task!
    updateTask(input: UpdateTaskInput!): Task!
    deleteTask(id: ID!): Boolean!
    completeTask(id: ID!): Task!
    bulkCompleteTasks(ids: [ID!]!): BulkActionResult!
    bulkDeleteTasks(ids: [ID!]!): BulkActionResult!

    # Dependencies
    createDependency(input: CreateDependencyInput!): TaskDependency!
    deleteDependency(id: ID!): Boolean!

    # Gamification
    activatePowerUp(id: ID!): GamificationProfile!
    deactivatePowerUp(id: ID!): GamificationProfile!

    # Timer
    startTimer(taskId: ID, type: PomodoroPhase!): PomodoroSession!
    pauseTimer(sessionId: ID!): PomodoroSession!
    completeTimer(sessionId: ID!): PomodoroSession!
    skipPhase(sessionId: ID!): PomodoroSession!
    updateTimerSettings(settings: TimerSettingsInput!): User!

    # Templates
    createTemplate(input: CreateTemplateInput!): Template!
    updateTemplate(id: ID!, input: CreateTemplateInput!): Template!
    deleteTemplate(id: ID!): Boolean!
    useTemplate(id: ID!, projectId: ID!): Task!

    # User
    updateUserProfile(name: String, avatar: String): User!
    changePassword(oldPassword: String!, newPassword: String!): Boolean!
  }

  # ============================================================================
  # SUBSCRIPTIONS
  # ============================================================================

  type Subscription {
    taskUpdated(projectId: ID): Task!
    projectUpdated: Project!
    timerTick: TimerUpdate!
  }

  type TimerUpdate {
    sessionId: ID!
    timeRemaining: Int!
    progress: Float!
  }
`;
