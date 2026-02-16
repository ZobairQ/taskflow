/**
 * Dependency Utilities - Logic for managing task dependencies
 */

import { Task } from '../ProjectContext';
import {
  TaskDependency,
  DependencyNode,
  DependencyType,
} from '../types/professional.types';

/**
 * Check if a task can be started (no incomplete blocking dependencies)
 */
export function canStartTask(
  taskId: number,
  dependencies: TaskDependency[],
  getTaskById: (id: number) => Task | undefined
): boolean {
  const blockingDeps = dependencies.filter(
    (d) => d.successorTaskId === taskId && d.type === 'blocks'
  );

  // Check if any blocking task is incomplete
  for (const dep of blockingDeps) {
    const blockingTask = getTaskById(dep.predecessorTaskId);
    if (blockingTask && !blockingTask.completed) {
      return false;
    }
  }

  return true;
}

/**
 * Get all tasks that block a given task
 */
export function getBlockingTasks(
  taskId: number,
  dependencies: TaskDependency[],
  getTaskById: (id: number) => Task | undefined
): Task[] {
  const blockingDeps = dependencies.filter(
    (d) => d.successorTaskId === taskId && d.type === 'blocks'
  );

  return blockingDeps
    .map((d) => getTaskById(d.predecessorTaskId))
    .filter((t): t is Task => t !== undefined);
}

/**
 * Get all tasks that depend on a given task
 */
export function getDependentTasks(
  taskId: number,
  dependencies: TaskDependency[],
  getTaskById: (id: number) => Task | undefined
): Task[] {
  const dependentDeps = dependencies.filter(
    (d) => d.predecessorTaskId === taskId && d.type === 'blocks'
  );

  return dependentDeps
    .map((d) => getTaskById(d.successorTaskId))
    .filter((t): t is Task => t !== undefined);
}

/**
 * Check if adding a dependency would create a cycle
 */
export function wouldCreateCycle(
  predecessorId: number,
  successorId: number,
  dependencies: TaskDependency[]
): boolean {
  // BFS to check if successor can reach predecessor
  const visited = new Set<number>();
  const queue: number[] = [successorId];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current === predecessorId) {
      return true;
    }

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    // Find all tasks that depend on current
    const nextTasks = dependencies
      .filter((d) => d.predecessorTaskId === current && d.type === 'blocks')
      .map((d) => d.successorTaskId);

    queue.push(...nextTasks);
  }

  return false;
}

/**
 * Build a dependency graph for visualization
 */
export function buildDependencyGraph(
  tasks: Task[],
  dependencies: TaskDependency[]
): DependencyNode[] {
  const nodes: DependencyNode[] = tasks.map((task) => ({
    taskId: task.id,
    taskText: task.text,
    level: 0,
    dependencies: dependencies
      .filter((d) => d.successorTaskId === task.id && d.type === 'blocks')
      .map((d) => d.predecessorTaskId),
    dependents: dependencies
      .filter((d) => d.predecessorTaskId === task.id && d.type === 'blocks')
      .map((d) => d.successorTaskId),
    status: task.completed ? 'completed' : 'pending',
  }));

  // Calculate levels using topological sort
  const levels = calculateDependencyLevels(nodes);
  nodes.forEach((node) => {
    node.level = levels.get(node.taskId) || 0;
    node.status = getTaskDependencyStatus(node, nodes);
  });

  return nodes;
}

/**
 * Calculate dependency levels for visualization
 */
function calculateDependencyLevels(nodes: DependencyNode[]): Map<number, number> {
  const levels = new Map<number, number>();
  const visited = new Set<number>();

  function getLevel(nodeId: number): number {
    if (levels.has(nodeId)) {
      return levels.get(nodeId)!;
    }

    const node = nodes.find((n) => n.taskId === nodeId);
    if (!node || node.dependencies.length === 0) {
      levels.set(nodeId, 0);
      return 0;
    }

    const maxDepLevel = Math.max(
      ...node.dependencies.map((depId) => getLevel(depId))
    );
    const level = maxDepLevel + 1;
    levels.set(nodeId, level);
    return level;
  }

  nodes.forEach((node) => getLevel(node.taskId));
  return levels;
}

/**
 * Get the dependency status for a task
 */
function getTaskDependencyStatus(
  node: DependencyNode,
  allNodes: DependencyNode[]
): 'pending' | 'blocked' | 'ready' | 'completed' {
  if (node.status === 'completed') {
    return 'completed';
  }

  // Check if all dependencies are completed
  const allDepsCompleted = node.dependencies.every((depId) => {
    const depNode = allNodes.find((n) => n.taskId === depId);
    return depNode?.status === 'completed';
  });

  return allDepsCompleted ? 'ready' : 'blocked';
}

/**
 * Get tasks in topological order (dependencies first)
 */
export function getTopologicalOrder(
  tasks: Task[],
  dependencies: TaskDependency[]
): Task[] {
  const graph = buildDependencyGraph(tasks, dependencies);
  return [...graph]
    .sort((a, b) => a.level - b.level)
    .map((node) => tasks.find((t) => t.id === node.taskId)!)
    .filter(Boolean);
}

/**
 * Create a new dependency
 */
export function createDependency(
  predecessorTaskId: number,
  successorTaskId: number,
  type: DependencyType = 'blocks'
): TaskDependency {
  return {
    id: `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    predecessorTaskId,
    successorTaskId,
    type,
    createdAt: Date.now(),
  };
}

/**
 * Get tasks that are ready to work on (no incomplete dependencies)
 */
export function getReadyTasks(
  tasks: Task[],
  dependencies: TaskDependency[]
): Task[] {
  const graph = buildDependencyGraph(tasks, dependencies);
  const readyIds = new Set(
    graph.filter((n) => n.status === 'ready').map((n) => n.taskId)
  );
  return tasks.filter((t) => readyIds.has(t.id) && !t.completed);
}

/**
 * Get tasks that are blocked by incomplete dependencies
 */
export function getBlockedTasks(
  tasks: Task[],
  dependencies: TaskDependency[]
): Task[] {
  const graph = buildDependencyGraph(tasks, dependencies);
  const blockedIds = new Set(
    graph.filter((n) => n.status === 'blocked').map((n) => n.taskId)
  );
  return tasks.filter((t) => blockedIds.has(t.id));
}

/**
 * Get a human-readable dependency description
 */
export function getDependencyDescription(
  dependency: TaskDependency,
  getTaskById: (id: number) => Task | undefined
): string {
  const predecessor = getTaskById(dependency.predecessorTaskId);
  const successor = getTaskById(dependency.successorTaskId);

  const predecessorText = predecessor?.text || 'Unknown task';
  const successorText = successor?.text || 'Unknown task';

  switch (dependency.type) {
    case 'blocks':
      return `"${predecessorText}" blocks "${successorText}"`;
    case 'blockedBy':
      return `"${successorText}" is blocked by "${predecessorText}"`;
    case 'relatesTo':
      return `"${predecessorText}" relates to "${successorText}"`;
    default:
      return `${predecessorText} → ${successorText}`;
  }
}
