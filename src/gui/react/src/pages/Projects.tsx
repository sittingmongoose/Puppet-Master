import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Panel } from '@/components/layout';
import { Button, Input } from '@/components/ui';
import { StatusBadge } from '@/components/shared';
import { useProjectStore } from '@/stores';
import { api } from '@/lib';
import type { Project } from '@/types';

/**
 * Projects page - project selection and management
 * Fixes Issues #7 (browser limitations) and #8 (loading states)
 */
export default function ProjectsPage() {
  const navigate = useNavigate();
  
  // Store state
  const currentProject = useProjectStore((s) => s.currentProject);
  const recentProjects = useProjectStore((s) => s.recentProjects);
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject);
  const addRecentProject = useProjectStore((s) => s.addRecentProject);
  
  // Local state
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.listProjects();
        setProjects(data || []);
      } catch (err) {
        console.error('[Projects] Failed to fetch projects:', err);
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Open a project
  const handleOpenProject = useCallback(async (project: Project) => {
    try {
      await api.openProject(project.path);
      setCurrentProject(project);
      addRecentProject(project);
      navigate('/');
    } catch (err) {
      console.error('[Projects] Failed to open project:', err);
      setError(err instanceof Error ? err.message : 'Failed to open project');
    }
  }, [navigate, setCurrentProject, addRecentProject]);

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h1 className="font-display text-2xl">Projects</h1>
        <div className="flex gap-sm">
          <Link to="/wizard">
            <Button variant="primary">START NEW PROJECT</Button>
          </Link>
          <Button
            variant="info"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'CANCEL' : 'OPEN EXISTING'}
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <Panel showInnerBorder={false}>
          <div className="text-hot-magenta flex items-center gap-sm">
            <StatusBadge status="error" size="sm" />
            <span>{error}</span>
          </div>
        </Panel>
      )}

      {/* Create/Open Form */}
      {showCreateForm && (
        <OpenProjectForm
          onOpen={handleOpenProject}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Current Project */}
      {currentProject && (
        <Panel title="Current Project">
          <ProjectCard
            project={currentProject}
            isCurrent
          />
        </Panel>
      )}

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <Panel title="Recent Projects">
          <div className="space-y-md">
            {recentProjects.map((project) => (
              <ProjectCard
                key={project.path}
                project={project}
                isCurrent={currentProject?.path === project.path}
                onOpen={() => handleOpenProject(project)}
              />
            ))}
          </div>
        </Panel>
      )}

      {/* All Projects */}
      <Panel title="All Projects">
        {loading ? (
          <LoadingState />
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <ProjectsTable
              projects={projects}
              currentProject={currentProject}
              onOpen={handleOpenProject}
            />
          </div>
        )}
      </Panel>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface OpenProjectFormProps {
  onOpen: (project: Project) => void;
  onCancel: () => void;
}

function OpenProjectForm({ onOpen, onCancel }: OpenProjectFormProps) {
  const [path, setPath] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!path.trim()) {
      setError('Project path is required');
      return;
    }

    // Extract name from path if not provided
    const projectName = name.trim() || path.split('/').filter(Boolean).pop() || 'Untitled';
    const projectPath = path.trim();

    onOpen({
      id: `project-${Date.now()}`,
      name: projectName,
      path: projectPath,
      lastAccessed: new Date(),
    });
  };

  return (
    <Panel title="Open Project">
      <form onSubmit={handleSubmit} className="space-y-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <Input
            label="Project Path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/path/to/your/project"
            required
            error={error || undefined}
            hint="Enter the full path to your project directory"
          />
          <Input
            label="Project Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Project"
            hint="Leave empty to use directory name"
          />
        </div>

        {/* Browser limitation tooltip (Issue #7) */}
        <div className="p-md bg-paper-lined/50 border-medium border-dashed border-ink-faded text-sm">
          <strong>Note:</strong> Due to browser security restrictions, you cannot browse your file 
          system directly. Please copy and paste the full path to your project directory.
        </div>

        <div className="flex gap-sm">
          <Button type="submit" variant="primary">
            OPEN PROJECT
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            CANCEL
          </Button>
        </div>
      </form>
    </Panel>
  );
}

interface ProjectCardProps {
  project: Project;
  isCurrent?: boolean;
  onOpen?: () => void;
}

function ProjectCard({ project, isCurrent, onOpen }: ProjectCardProps) {
  return (
    <div className={`
      p-md border-medium
      ${isCurrent ? 'border-electric-blue bg-electric-blue/5' : 'border-ink-black hover:border-electric-blue'}
      transition-colors
    `}>
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div className="space-y-xs">
          <div className="flex items-center gap-sm">
            <span className="font-bold text-lg">{project.name}</span>
            {isCurrent && (
              <span className="px-sm py-xs bg-electric-blue text-white text-xs font-bold">
                CURRENT
              </span>
            )}
          </div>
          <div className="font-mono text-sm text-ink-faded">{project.path}</div>
          {project.lastAccessed && (
            <div className="text-xs text-ink-faded">
              Last opened: {new Date(project.lastAccessed).toLocaleDateString()}
            </div>
          )}
        </div>
        {!isCurrent && onOpen && (
          <Button variant="info" size="sm" onClick={onOpen}>
            OPEN
          </Button>
        )}
      </div>
    </div>
  );
}

interface ProjectsTableProps {
  projects: Project[];
  currentProject: Project | null;
  onOpen: (project: Project) => void;
}

function ProjectsTable({ projects, currentProject, onOpen }: ProjectsTableProps) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b-medium border-ink-black">
          <th className="text-left py-sm px-md font-bold">Name</th>
          <th className="text-left py-sm px-md font-bold">Path</th>
          <th className="text-left py-sm px-md font-bold">Status</th>
          <th className="text-left py-sm px-md font-bold">Last Opened</th>
          <th className="text-right py-sm px-md font-bold">Actions</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((project) => {
          const isCurrent = currentProject?.path === project.path;
          return (
            <tr
              key={project.path}
              className={`
                border-b border-ink-faded/20
                ${isCurrent ? 'bg-electric-blue/10' : 'hover:bg-paper-lined/50'}
              `}
            >
              <td className="py-sm px-md">
                <span className="font-semibold">{project.name}</span>
              </td>
              <td className="py-sm px-md">
                <span className="font-mono text-sm">{project.path}</span>
              </td>
              <td className="py-sm px-md">
                {isCurrent ? (
                  <StatusBadge status="running" showLabel />
                ) : (
                  <StatusBadge status="pending" showLabel />
                )}
              </td>
              <td className="py-sm px-md text-sm text-ink-faded">
                {project.lastAccessed
                  ? new Date(project.lastAccessed).toLocaleDateString()
                  : '-'}
              </td>
              <td className="py-sm px-md text-right">
                {!isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpen(project)}
                  >
                    OPEN
                  </Button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function LoadingState() {
  return (
    <div className="text-center py-xl">
      <div className="inline-block animate-pulse">
        <StatusBadge status="running" size="lg" />
      </div>
      <p className="mt-md text-ink-faded">Loading projects...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-xl">
      <p className="text-ink-faded mb-md">No projects found.</p>
      <Link to="/wizard">
        <Button variant="primary">START YOUR FIRST PROJECT</Button>
      </Link>
    </div>
  );
}
