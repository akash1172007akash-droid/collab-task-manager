import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { Navbar } from './components/Navbar';
import { FirebaseBanner } from './components/FirebaseBanner';
import { AuthView } from './components/AuthView';
import { ProjectHeader } from './components/ProjectHeader';
import { DashboardStatsView } from './components/DashboardStatsView';
import { TaskBoard } from './components/TaskBoard';
import { CreateProjectModal } from './components/CreateProjectModal';
import { AddMemberModal } from './components/AddMemberModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';

const MainLayout: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Connecting to Firebase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />
      <FirebaseBanner onOpenSettings={() => setIsConfigModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!currentUser ? (
          <AuthView onOpenConfig={() => setIsConfigModalOpen(true)} />
        ) : (
          <div className="space-y-6">
            {/* Project Header (Selector, Members, Actions) */}
            <ProjectHeader
              onOpenCreateProject={() => setIsCreateProjectOpen(true)}
              onOpenAddMember={() => setIsAddMemberOpen(true)}
              onOpenCreateTask={() => setIsCreateTaskOpen(true)}
            />

            {/* Live Dashboard Statistics (Requirement 9) */}
            <DashboardStatsView />

            {/* Task Board / List with Status & Progress Controls (Requirement 4, 5, 6) */}
            <TaskBoard onOpenCreateTask={() => setIsCreateTaskOpen(true)} />
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
      />
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
      />
      <FirebaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <MainLayout />
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
