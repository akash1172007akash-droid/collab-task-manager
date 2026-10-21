import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { TaskCard } from './TaskCard';
import type { TaskStatus } from '../types';
import {
  ListFilter,
  CheckCircle,
  Plus,
  Inbox,
  UserCheck,
  Columns3,
  Rows3,
} from 'lucide-react';

interface TaskBoardProps {
  onOpenCreateTask: () => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ onOpenCreateTask }) => {
  const { tasks, activeProject, loadingTasks } = useProject();
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<'ALL' | 'MY_TASKS' | TaskStatus>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');

  const filteredTasks = useMemo(() => {
    if (filter === 'ALL') return tasks;
    if (filter === 'MY_TASKS') return tasks.filter((t) => t.assignedTo === currentUser?.uid);
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter, currentUser]);

  if (!activeProject) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Project Selected</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Create a new project or select an existing one to manage tasks with your team.
        </p>
      </div>
    );
  }

  const kanbanColumns: { status: TaskStatus; label: string; headerColor: string }[] = [
    { status: 'TODO', label: 'To Do', headerColor: 'border-slate-300 text-slate-700' },
    { status: 'IN_PROGRESS', label: 'In Progress', headerColor: 'border-sky-400 text-sky-700' },
    { status: 'IN_REVIEW', label: 'In Review', headerColor: 'border-amber-400 text-amber-700' },
    { status: 'DONE', label: 'Done', headerColor: 'border-emerald-400 text-emerald-700' },
  ];

  return (
    <div className="space-y-4">
      {/* Filter and View Mode Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-medium">
          <span className="text-slate-400 text-[11px] font-semibold mr-1 flex items-center gap-1">
            <ListFilter className="w-3.5 h-3.5" />
            Filter:
          </span>
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Tasks ({tasks.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('MY_TASKS')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
              filter === 'MY_TASKS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            My Tasks ({tasks.filter((t) => t.assignedTo === currentUser?.uid).length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('TODO')}
            className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
              filter === 'TODO'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            To Do
          </button>

          <button
            type="button"
            onClick={() => setFilter('IN_PROGRESS')}
            className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
              filter === 'IN_PROGRESS'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            In Progress
          </button>

          <button
            type="button"
            onClick={() => setFilter('IN_REVIEW')}
            className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
              filter === 'IN_REVIEW'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            In Review
          </button>

          <button
            type="button"
            onClick={() => setFilter('DONE')}
            className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
              filter === 'DONE'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Done
          </button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            title="Grid View"
            className={`p-1.5 rounded-md transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Rows3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            title="Kanban Board View"
            className={`p-1.5 rounded-md transition cursor-pointer ${
              viewMode === 'kanban'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Columns3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task Content */}
      {loadingTasks ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-5 h-44 animate-pulse"
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Tasks in Project Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Add tasks to track progress and assign team members. All changes save directly to Firestore.
          </p>
          <button
            type="button"
            onClick={onOpenCreateTask}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Task</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-slate-100/70 rounded-xl p-3 border border-slate-200/80 space-y-3"
              >
                <div
                  className={`flex items-center justify-between pb-2 border-b-2 font-bold text-xs uppercase tracking-wider ${col.headerColor}`}
                >
                  <span>{col.label}</span>
                  <span className="bg-white px-2 py-0.5 rounded-full text-slate-700 shadow-2xs">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[150px]">
                  {colTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-xs italic">
                      No tasks in this state
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
