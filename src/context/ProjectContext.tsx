import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  getDocs,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { calculateDashboardStats } from '../lib/stats';
import type { Project, Task, TaskStatus, TaskPriority, DashboardStats } from '../types';

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  tasks: Task[];
  stats: DashboardStats;
  loadingProjects: boolean;
  loadingTasks: boolean;
  setActiveProjectId: (id: string | null) => void;
  createProject: (name: string, description: string) => Promise<string>;
  addProjectMember: (projectId: string, email: string) => Promise<{ success: boolean; message: string }>;
  createTask: (taskData: {
    title: string;
    description: string;
    priority: TaskPriority;
    assignedTo: string;
    dueDate?: string;
  }) => Promise<string>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  updateTaskProgress: (taskId: string, progress: number) => Promise<void>;
  updateTaskDetails: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);

  // 1. Real-time Project Listener
  useEffect(() => {
    if (!currentUser) {
      setProjects([]);
      setActiveProjectId(null);
      setLoadingProjects(false);
      return;
    }

    setLoadingProjects(true);
    // Listen for all projects where the current user is a member
    const q = query(
      collection(db, 'projects'),
      where('members', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedProjects: Project[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || 'Untitled Project',
            description: data.description || '',
            ownerId: data.ownerId,
            ownerEmail: data.ownerEmail,
            members: data.members || [],
            memberEmails: data.memberEmails || [],
            memberDetails: data.memberDetails || {},
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });

        setProjects(fetchedProjects);
        setLoadingProjects(false);

        // Keep active project valid or default to first project
        setActiveProjectId((prev) => {
          if (prev && fetchedProjects.some((p) => p.id === prev)) {
            return prev;
          }
          return fetchedProjects.length > 0 ? fetchedProjects[0].id : null;
        });
      },
      (error) => {
        console.error('Error listening to projects:', error);
        setLoadingProjects(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Derived Active Project
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || null;
  }, [projects, activeProjectId]);

  // 2. Real-time Tasks Listener for Active Project
  useEffect(() => {
    if (!activeProject?.id || !currentUser) {
      setTasks([]);
      setLoadingTasks(false);
      return;
    }

    setLoadingTasks(true);
    const tasksRef = collection(db, 'projects', activeProject.id, 'tasks');

    const unsubscribe = onSnapshot(
      tasksRef,
      (snapshot) => {
        const fetchedTasks: Task[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            projectId: data.projectId,
            title: data.title || '',
            description: data.description || '',
            status: data.status || 'TODO',
            priority: data.priority || 'MEDIUM',
            progress: Number(data.progress ?? 0),
            assignedTo: data.assignedTo || '',
            assignedToEmail: data.assignedToEmail || '',
            assignedToName: data.assignedToName || '',
            createdBy: data.createdBy || '',
            createdByName: data.createdByName || '',
            dueDate: data.dueDate || '',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });

        setTasks(fetchedTasks);
        setLoadingTasks(false);
      },
      (error) => {
        console.error(`[ProjectContext:${currentUser.email}] Error listening to tasks:`, error);
        setLoadingTasks(false);
      }
    );

    return () => unsubscribe();
  }, [activeProject?.id, currentUser]);

  // 3. Create Project
  const createProject = async (name: string, description: string): Promise<string> => {
    if (!currentUser) throw new Error('You must be signed in to create a project');

    const memberDetails: Record<string, any> = {
      [currentUser.uid]: {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: userProfile?.displayName || currentUser.displayName || 'Owner',
        role: 'owner',
      },
    };

    const docRef = await addDoc(collection(db, 'projects'), {
      name: name.trim(),
      description: description.trim(),
      ownerId: currentUser.uid,
      ownerEmail: currentUser.email || '',
      members: [currentUser.uid],
      memberEmails: [currentUser.email || ''],
      memberDetails,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setActiveProjectId(docRef.id);
    return docRef.id;
  };

  // 4. Add Project Member
  const addProjectMember = async (
    projectId: string,
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) throw new Error('You must be signed in');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return { success: false, message: 'Please provide a valid email address.' };
    }

    // Find the project
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      return { success: false, message: 'Project not found.' };
    }

    if (project.memberEmails?.map((e) => e.toLowerCase()).includes(cleanEmail)) {
      return { success: false, message: 'This user is already a member of this project.' };
    }

    // Look up user in Firestore 'users' collection
    const usersQuery = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const querySnapshot = await getDocs(usersQuery);

    if (querySnapshot.empty) {
      return {
        success: false,
        message: `No registered account found with email "${cleanEmail}". The member must create an account first.`,
      };
    }

    const memberDoc = querySnapshot.docs[0];
    const memberData = memberDoc.data();
    const memberUid = memberDoc.id;

    const projectDocRef = doc(db, 'projects', projectId);
    await updateDoc(projectDocRef, {
      members: arrayUnion(memberUid),
      memberEmails: arrayUnion(cleanEmail),
      [`memberDetails.${memberUid}`]: {
        uid: memberUid,
        email: cleanEmail,
        displayName: memberData.displayName || cleanEmail.split('@')[0],
        role: 'member',
      },
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: `Successfully added ${memberData.displayName || cleanEmail} to project!`,
    };
  };

  // 5. Create Task
  const createTask = async (taskData: {
    title: string;
    description: string;
    priority: TaskPriority;
    assignedTo: string;
    dueDate?: string;
  }): Promise<string> => {
    if (!currentUser || !activeProject) {
      throw new Error('Active project and signed-in user are required');
    }

    const assignedMember = activeProject.memberDetails[taskData.assignedTo];
    const assignedToEmail = assignedMember?.email || '';
    const assignedToName = assignedMember?.displayName || assignedToEmail.split('@')[0] || 'Unassigned';

    try {
      const docRef = await addDoc(collection(db, 'projects', activeProject.id, 'tasks'), {
        projectId: activeProject.id,
        title: taskData.title.trim(),
        description: taskData.description.trim(),
        status: 'TODO',
        priority: taskData.priority,
        progress: 0,
        assignedTo: taskData.assignedTo,
        assignedToEmail,
        assignedToName,
        createdBy: currentUser.uid,
        createdByName: userProfile?.displayName || currentUser.displayName || currentUser.email || 'Author',
        dueDate: taskData.dueDate || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`[ProjectContext:${currentUser.email}] Created task with ID:`, docRef.id);
      return docRef.id;
    } catch (err) {
      console.error(`[ProjectContext:${currentUser.email}] Error creating task:`, err);
      throw err;
    }
  };

  // 6. Update Task Status
  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    if (!activeProject) return;
    const taskDocRef = doc(db, 'projects', activeProject.id, 'tasks', taskId);
    const updates: Record<string, any> = {
      status,
      updatedAt: serverTimestamp(),
    };

    // If marked DONE, automatically set progress to 100%
    if (status === 'DONE') {
      updates.progress = 100;
    }

    await updateDoc(taskDocRef, updates);
  };

  // 7. Update Task Progress
  const updateTaskProgress = async (taskId: string, progress: number) => {
    if (!activeProject) return;
    const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));
    const taskDocRef = doc(db, 'projects', activeProject.id, 'tasks', taskId);
    const updates: Record<string, any> = {
      progress: clampedProgress,
      updatedAt: serverTimestamp(),
    };

    // If progress is 100%, transition status to DONE; if progress > 0 and TODO, transition to IN_PROGRESS
    if (clampedProgress === 100) {
      updates.status = 'DONE';
    } else {
      const currentTask = tasks.find((t) => t.id === taskId);
      if (currentTask && currentTask.status === 'DONE') {
        updates.status = 'IN_PROGRESS';
      } else if (currentTask && currentTask.status === 'TODO' && clampedProgress > 0) {
        updates.status = 'IN_PROGRESS';
      }
    }

    await updateDoc(taskDocRef, updates);
  };

  // 8. Update Task Details
  const updateTaskDetails = async (taskId: string, updates: Partial<Task>) => {
    if (!activeProject) return;
    const taskDocRef = doc(db, 'projects', activeProject.id, 'tasks', taskId);
    await updateDoc(taskDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  };

  // 9. Delete Task
  const deleteTask = async (taskId: string) => {
    if (!activeProject) return;
    const taskDocRef = doc(db, 'projects', activeProject.id, 'tasks', taskId);
    await deleteDoc(taskDocRef);
  };

  // 10. Real Dashboard Statistics computed reactively from Firestore tasks
  const stats: DashboardStats = useMemo(() => {
    return calculateDashboardStats(tasks, currentUser?.uid);
  }, [tasks, currentUser]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        tasks,
        stats,
        loadingProjects,
        loadingTasks,
        setActiveProjectId,
        createProject,
        addProjectMember,
        createTask,
        updateTaskStatus,
        updateTaskProgress,
        updateTaskDetails,
        deleteTask,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
