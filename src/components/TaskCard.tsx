import React, { useState } from 'react';
import type { Task, TaskStatus, TaskPriority } from '../types';
import { useProject } from '../context/ProjectContext';
import {
  Calendar,
  Trash2,
  Database,
  Sliders,
  Check,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

const PRIORITY_BADGES: Record<TaskPriority, { label: string; className: string }> = {
  LOW: { label: 'Low', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  MEDIUM: { label: 'Medium', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  HIGH: { label: 'High', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  URGENT: { label: 'Urgent', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const STATUS_OPTIONS: { value: TaskStatus; label: string; dotClass: string }[] = [
  { value: 'TODO', label: 'To Do', dotClass: 'bg-slate-400' },
  { value: 'IN_PROGRESS', label: 'In Progress', dotClass: 'bg-sky-500' },
  { value: 'IN_REVIEW', label: 'In Review', dotClass: 'bg-amber-500' },
  { value: 'DONE', label: 'Done', dotClass: 'bg-emerald-500' },
];

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { updateTaskStatus, updateTaskProgress, deleteTask } = useProject();
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsUpdating(true);
    try {
      await updateTaskStatus(task.id, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProgressChange = async (newProgress: number) => {
    setIsUpdating(true);
    try {
      await updateTaskProgress(task.id, newProgress);
    } catch (err) {
      console.error('Failed to update progress:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete task "${task.title}" from Firestore?`)) {
      try {
        await deleteTask(task.id);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const copyDocId = () => {
    navigator.clipboard.writeText(task.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const priorityBadge = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.MEDIUM;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3 relative group">
      {/* Header: Title & Priority & Delete */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityBadge.className}`}
              >
                {priorityBadge.label}
              </span>

              {/* Firestore Document Verification Badge */}
              <button
                type="button"
                onClick={copyDocId}
                title="Click to copy Firestore Document ID"
                className="inline-flex items-center gap-1 text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded border border-slate-200 transition cursor-pointer"
              >
                <Database className="w-2.5 h-2.5 text-indigo-500" />
                <span>id: {task.id.slice(0, 7)}...</span>
                {copiedId && <Check className="w-2.5 h-2.5 text-emerald-600" />}
              </button>
            </div>

            <h4
              className={`font-semibold text-slate-900 text-sm leading-snug ${
                task.status === 'DONE' ? 'line-through text-slate-400' : ''
              }`}
            >
              {task.title}
            </h4>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            className="text-slate-300 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {task.description && (
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{task.description}</p>
        )}
      </div>

      {/* Assignee & Due Date */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
            {(task.assignedToName || 'U')[0].toUpperCase()}
          </div>
          <span className="text-[11px] font-medium text-slate-700 truncate max-w-[120px]">
            {task.assignedToName || 'Unassigned'}
          </span>
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{task.dueDate}</span>
          </div>
        )}
      </div>

      {/* Status & Progress Controls (Requirement 5) */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        {/* Status Dropdown */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-slate-600">Status:</span>
          <select
            aria-label="Task Status"
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            disabled={isUpdating}
            className="text-xs font-medium py-1 px-2.5 rounded-lg border border-slate-300 bg-white hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Progress Slider and percentage */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-500 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-slate-400" />
              Progress
            </span>
            <span data-testid="task-progress-value" className="font-bold text-slate-800">{task.progress}%</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={task.progress}
              onChange={(e) => handleProgressChange(Number(e.target.value))}
              disabled={isUpdating}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center justify-between gap-1 mt-1.5">
            {[0, 25, 50, 75, 100].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleProgressChange(val)}
                className={`text-[9px] font-semibold px-1.5 py-0.5 rounded transition cursor-pointer ${
                  task.progress === val
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
