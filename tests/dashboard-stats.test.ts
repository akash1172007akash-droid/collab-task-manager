import { describe, it, expect } from 'vitest';
import { calculateDashboardStats } from '../src/lib/stats';
import type { Task } from '../src/types';

describe('Requirement 9: Real Dashboard Statistics', () => {
  const currentUserId = 'user-alice-123';

  it('calculates correct statistics for an empty task list', () => {
    const stats = calculateDashboardStats([], currentUserId);
    expect(stats.totalTasks).toBe(0);
    expect(stats.todoCount).toBe(0);
    expect(stats.inProgressCount).toBe(0);
    expect(stats.inReviewCount).toBe(0);
    expect(stats.doneCount).toBe(0);
    expect(stats.completionRate).toBe(0);
    expect(stats.avgProgress).toBe(0);
    expect(stats.myTasksCount).toBe(0);
    expect(stats.highPriorityCount).toBe(0);
  });

  it('calculates status counts, completion rates, and average progress correctly', () => {
    const tasks: Task[] = [
      {
        id: 'task-1',
        projectId: 'proj-1',
        title: 'Task 1',
        description: '',
        status: 'DONE',
        priority: 'MEDIUM',
        progress: 100,
        assignedTo: currentUserId,
        assignedToEmail: 'alice@example.com',
        assignedToName: 'Alice',
        createdBy: currentUserId,
        createdByName: 'Alice',
      },
      {
        id: 'task-2',
        projectId: 'proj-1',
        title: 'Task 2',
        description: '',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        progress: 50,
        assignedTo: currentUserId,
        assignedToEmail: 'alice@example.com',
        assignedToName: 'Alice',
        createdBy: currentUserId,
        createdByName: 'Alice',
      },
      {
        id: 'task-3',
        projectId: 'proj-1',
        title: 'Task 3',
        description: '',
        status: 'TODO',
        priority: 'URGENT',
        progress: 0,
        assignedTo: 'user-bob-456',
        assignedToEmail: 'bob@example.com',
        assignedToName: 'Bob',
        createdBy: currentUserId,
        createdByName: 'Alice',
      },
      {
        id: 'task-4',
        projectId: 'proj-1',
        title: 'Task 4',
        description: '',
        status: 'IN_REVIEW',
        priority: 'LOW',
        progress: 80,
        assignedTo: 'user-bob-456',
        assignedToEmail: 'bob@example.com',
        assignedToName: 'Bob',
        createdBy: currentUserId,
        createdByName: 'Alice',
      },
    ];

    const stats = calculateDashboardStats(tasks, currentUserId);

    expect(stats.totalTasks).toBe(4);
    expect(stats.doneCount).toBe(1);
    expect(stats.inProgressCount).toBe(1);
    expect(stats.todoCount).toBe(1);
    expect(stats.inReviewCount).toBe(1);

    // Completion rate: 1/4 = 25%
    expect(stats.completionRate).toBe(25);

    // Average progress: (100 + 50 + 0 + 80) / 4 = 230 / 4 = 57.5 => 58%
    expect(stats.avgProgress).toBe(58);

    // My tasks assigned to Alice: task-1 and task-2 => 2
    expect(stats.myTasksCount).toBe(2);

    // High priority or Urgent that are NOT DONE: task-2 (HIGH) + task-3 (URGENT) => 2
    expect(stats.highPriorityCount).toBe(2);
  });

  it('excludes completed tasks from high priority alerts', () => {
    const tasks: Task[] = [
      {
        id: 'task-urgent-done',
        projectId: 'proj-1',
        title: 'Urgent Task Finished',
        description: '',
        status: 'DONE',
        priority: 'URGENT',
        progress: 100,
        assignedTo: currentUserId,
        assignedToEmail: 'alice@example.com',
        assignedToName: 'Alice',
        createdBy: currentUserId,
        createdByName: 'Alice',
      },
    ];

    const stats = calculateDashboardStats(tasks, currentUserId);
    expect(stats.doneCount).toBe(1);
    expect(stats.completionRate).toBe(100);
    expect(stats.highPriorityCount).toBe(0);
  });
});
