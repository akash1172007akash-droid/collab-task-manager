export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt?: string | number | null;
}

export type ProjectMemberRole = 'owner' | 'member';

export interface ProjectMemberDetail {
  uid: string;
  email: string;
  displayName: string;
  role: ProjectMemberRole;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerEmail: string;
  members: string[]; // List of UIDs with access
  memberEmails: string[]; // List of Emails for quick member searching
  memberDetails: Record<string, ProjectMemberDetail>;
  createdAt?: any;
  updatedAt?: any;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number; // 0 - 100
  assignedTo: string; // UID
  assignedToEmail: string;
  assignedToName: string;
  createdBy: string; // UID
  createdByName: string;
  dueDate?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface DashboardStats {
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  inReviewCount: number;
  doneCount: number;
  completionRate: number; // 0 - 100%
  avgProgress: number; // 0 - 100%
  myTasksCount: number;
  highPriorityCount: number;
}
