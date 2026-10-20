import React from 'react';
import { useOdiseaStore } from '@/store';
import { Book, Plus, Folder, Archive } from 'lucide-react';

export const ProjectsSection: React.FC = () => {
  const { projects, groups, activeProjectId, activeGroupId, setActiveProject, setActiveGroup, openModal } = useOdiseaStore();

  return (
    <div className="mb-3 px-2">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#8e8e93] px-2 mb-1">
        <span>Proyectos</span>
        <button
          onClick={() => openModal('newProject')}
          className="text-[#8e8e93] hover:text-[#f2f2f7] p-0.5 rounded transition-colors"
          title="Crear Proyecto"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="space-y-0.5">
        {projects.map((proj) => {
          const isProjActive = activeProjectId === proj.id;
          const projGroups = groups.filter((g) => g.project_id === proj.id);

          return (
            <div key={proj.id} className="space-y-0.5">
              <button
                onClick={() => setActiveProject(proj.id)}
                className={`flex w-full items-center justify-between rounded px-2 py-1 text-xs transition-colors ${
                  isProjActive
                    ? 'bg-[#2c2c2e] text-[#f2f2f7] font-medium'
                    : 'text-[#aeaeb2] hover:bg-[#252528] hover:text-[#f2f2f7]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Book size={14} style={{ color: proj.color }} />
                  <span className="truncate">{proj.name}</span>
                </div>
                {proj.is_archived && <Archive size={12} className="text-[#8e8e93]" />}
              </button>

              {isProjActive && projGroups.length > 0 && (
                <div className="pl-4 space-y-0.5">
                  {projGroups.map((g) => {
                    const isGrpActive = activeGroupId === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => setActiveGroup(g.id)}
                        className={`flex w-full items-center gap-2 rounded px-2 py-1 text-xs transition-colors ${
                          isGrpActive
                            ? 'bg-[#007aff] text-white font-medium'
                            : 'text-[#aeaeb2] hover:bg-[#2c2c2e] hover:text-[#f2f2f7]'
                        }`}
                      >
                        <Folder size={14} className={isGrpActive ? 'text-white' : 'text-[#8e8e93]'} />
                        <span className="truncate">{g.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
