import type { Task, DashboardStats } from '../types';

/**
 * Calculates live dashboard metrics reactively from real Firestore task data.
 * Adheres to Requirement 9: "Display real dashboard statistics".
 */
export function calculateDashboardStats(tasks: Task[], currentUserId?: string): DashboardStats {
  const totalTasks = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReviewCount = tasks.filter((t) => t.status === 'IN_REVIEW').length;
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;

  const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;
  const totalProgress = tasks.reduce((sum, t) => sum + (Number(t.progress) || 0), 0);
  const avgProgress = totalTasks > 0 ? Math.round(totalProgress / totalTasks) : 0;

  const myTasksCount = currentUserId
    ? tasks.filter((t) => t.assignedTo === currentUserId).length
    : 0;

  const highPriorityCount = tasks.filter(
    (t) => (t.priority === 'HIGH' || t.priority === 'URGENT') && t.status !== 'DONE'
  ).length;

  return {
    totalTasks,
    todoCount,
    inProgressCount,
    inReviewCount,
    doneCount,
    completionRate,
    avgProgress,
    myTasksCount,
    highPriorityCount,
  };
}
