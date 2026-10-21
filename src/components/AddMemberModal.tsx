import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { X, UserPlus, Users, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose }) => {
  const { activeProject, addProjectMember } = useProject();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen || !activeProject) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await addProjectMember(activeProject.id, email.trim());
      if (res.success) {
        setMessage({ text: res.message, type: 'success' });
        setEmail('');
      } else {
        setMessage({ text: res.message, type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to add member', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const membersList = Object.values(activeProject.memberDetails || {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Project Members</h3>
              <p className="text-xs text-slate-500">Collaborators who can view and work on tasks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`mt-4 flex items-start gap-2 p-3 rounded-lg text-xs border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            )}
            <div>{message.text}</div>
          </div>
        )}

        {/* Add Member Form (Only owners/members can add) */}
        <form onSubmit={handleAdd} className="mt-4 space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Add Collaborator by Registered Email
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. bob@teamcollab.io"
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Adding...' : 'Add Member'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Note: Collaborators must have a registered account in Firestore.
          </p>
        </form>

        {/* Existing Members List */}
        <div className="mt-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Current Members ({membersList.length})
          </h4>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {membersList.map((m) => (
              <div
                key={m.uid}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/60"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {(m.displayName || m.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{m.displayName || 'Member'}</p>
                    <p className="text-[11px] text-slate-500">{m.email}</p>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    m.role === 'owner'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {m.role === 'owner' && <ShieldCheck className="w-3 h-3 text-amber-600" />}
                  {m.role === 'owner' ? 'Owner' : 'Member'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
