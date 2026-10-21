import React from 'react';
import { useProject } from '../context/ProjectContext';
import {
  Folder,
  FolderPlus,
  Users,
  Plus,
  ChevronDown,
} from 'lucide-react';

interface ProjectHeaderProps {
  onOpenCreateProject: () => void;
  onOpenAddMember: () => void;
  onOpenCreateTask: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  onOpenCreateProject,
  onOpenAddMember,
  onOpenCreateTask,
}) => {
  const { projects, activeProject, setActiveProjectId, loadingProjects } = useProject();

  const members = Object.values(activeProject?.memberDetails || {});

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Top bar: Project Switcher & Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Project Selector */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Folder className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Active Project
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>

            {loadingProjects ? (
              <div className="h-6 w-48 bg-slate-200 animate-pulse rounded mt-1" />
            ) : projects.length === 0 ? (
              <p className="text-sm font-semibold text-slate-700 mt-0.5">
                No projects yet. Create one to get started!
              </p>
            ) : (
              <div className="relative inline-block mt-0.5">
                <select
                  aria-label="Active Project"
                  value={activeProject?.id || ''}
                  onChange={(e) => setActiveProjectId(e.target.value)}
                  className="appearance-none font-bold text-slate-900 text-lg bg-transparent pr-7 pl-0 py-0 focus:outline-none cursor-pointer border-b border-transparent hover:border-slate-300 transition"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-0 top-1.5 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Create Project Button */}
          <button
            type="button"
            onClick={onOpenCreateProject}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-slate-500" />
            <span>New Project</span>
          </button>

          {activeProject && (
            <>
              {/* Manage Members Button */}
              <button
                type="button"
                onClick={onOpenAddMember}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <Users className="w-4 h-4 text-slate-500" />
                <span>Members ({members.length})</span>
              </button>

              {/* Add Task Button */}
              <button
                type="button"
                onClick={onOpenCreateTask}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Description & Member Avatars */}
      {activeProject && (
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-500">
          <p className="max-w-2xl text-slate-600">
            {activeProject.description || 'No project description provided.'}
          </p>

          {/* Members chips */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-medium text-slate-400">Team:</span>
            <div className="flex -space-x-1.5 overflow-hidden">
              {members.slice(0, 5).map((m) => (
                <div
                  key={m.uid}
                  title={`${m.displayName} (${m.email}) - ${m.role}`}
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full ring-2 ring-white bg-indigo-600 text-white text-[10px] font-bold"
                >
                  {(m.displayName || m.email)[0].toUpperCase()}
                </div>
              ))}
            </div>
            {members.length > 5 && (
              <span className="text-[11px] font-semibold text-slate-500">
                +{members.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
