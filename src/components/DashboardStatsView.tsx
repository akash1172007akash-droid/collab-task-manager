import React from 'react';
import { useProject } from '../context/ProjectContext';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  TrendingUp,
} from 'lucide-react';

export const DashboardStatsView: React.FC = () => {
  const { stats } = useProject();

  return (
    <div className="space-y-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Tasks */}
        <div data-testid="stat-total-tasks" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Total Tasks</span>
            <ListTodo className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{stats.totalTasks}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Live Firestore items</span>
          </div>
        </div>

        {/* Completion Rate */}
        <div data-testid="stat-completed-tasks" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">{stats.doneCount}</span>
              <span className="text-xs font-medium text-emerald-600">({stats.completionRate}%)</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">Tasks marked DONE</span>
          </div>
        </div>

        {/* In Progress */}
        <div data-testid="stat-inprogress-tasks" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">In Progress</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{stats.inProgressCount}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Active developments</span>
          </div>
        </div>

        {/* To Do */}
        <div data-testid="stat-todo-tasks" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">To Do</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{stats.todoCount}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Pending work</span>
          </div>
        </div>

        {/* My Tasks */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">My Tasks</span>
            <UserCheck className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{stats.myTasksCount}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Assigned to you</span>
          </div>
        </div>

        {/* High Priority */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Urgent/High</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <span className="text-2xl font-bold text-rose-600">{stats.highPriorityCount}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Needs attention</span>
          </div>
        </div>
      </div>

      {/* Progress overview bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Overall Project Progress</span>
          </div>
          <span className="font-bold text-slate-900">{stats.avgProgress}% Average Completion</span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
          {stats.totalTasks > 0 ? (
            <>
              <div
                className="bg-emerald-500 transition-all duration-300"
                style={{ width: `${(stats.doneCount / stats.totalTasks) * 100}%` }}
                title={`Done: ${stats.doneCount}`}
              />
              <div
                className="bg-sky-500 transition-all duration-300"
                style={{ width: `${(stats.inProgressCount / stats.totalTasks) * 100}%` }}
                title={`In Progress: ${stats.inProgressCount}`}
              />
              <div
                className="bg-amber-400 transition-all duration-300"
                style={{ width: `${(stats.inReviewCount / stats.totalTasks) * 100}%` }}
                title={`In Review: ${stats.inReviewCount}`}
              />
              <div
                className="bg-slate-300 transition-all duration-300"
                style={{ width: `${(stats.todoCount / stats.totalTasks) * 100}%` }}
                title={`To Do: ${stats.todoCount}`}
              />
            </>
          ) : (
            <div className="w-full bg-slate-200" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-2.5 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Done ({stats.doneCount})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> In Progress ({stats.inProgressCount})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> In Review ({stats.inReviewCount})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" /> To Do ({stats.todoCount})
          </span>
        </div>
      </div>
    </div>
  );
};
