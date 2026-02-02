import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Panel } from '@/components/layout';
import { Button } from '@/components/ui';
import { StatusBadge } from '@/components/shared';
import { agents, type AgentsFile } from '@/lib/api';
import type { StatusType } from '@/types';

/**
 * Memory page - AGENTS.md files viewer
 * Displays list of AGENTS.md files with ability to view/edit content
 */
export default function MemoryPage() {
  const { path: filePath } = useParams<{ path?: string }>();
  const [files, setFiles] = useState<AgentsFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<AgentsFile | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  // Fetch agents files list on mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const fileList = await agents.list();
        // Ensure fileList is always an array
        const safeFileList = Array.isArray(fileList) ? fileList : [];
        setFiles(safeFileList);
        
        // If a path was passed, select that file
        if (filePath) {
          const file = fileList.find((f) => f.path === filePath);
          if (file) {
            setSelectedFile(file);
            await loadFileContent(file);
          }
        }
      } catch (err) {
        console.error('[Memory] Failed to fetch files:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [filePath]);

  const loadFileContent = useCallback(async (file: AgentsFile) => {
    try {
      setLoadingContent(true);
      const content = await agents.getContent(file.path);
      setFileContent(content.document);
      setSelectedFile(file);
    } catch (err) {
      console.error('[Memory] Failed to load file content:', err);
      setFileContent(null);
    } finally {
      setLoadingContent(false);
    }
  }, []);

  const handleFileClick = useCallback((file: AgentsFile) => {
    loadFileContent(file);
  }, [loadFileContent]);

  const getLevelBadge = (level: AgentsFile['level']): StatusType => {
    switch (level) {
      case 'root': return 'complete';
      case 'module': return 'running';
      case 'phase': return 'pending';
      case 'task': return 'pending';
      default: return 'pending';
    }
  };

  const getLevelLabel = (level: AgentsFile['level']): string => {
    switch (level) {
      case 'root': return 'Root';
      case 'module': return 'Module';
      case 'phase': return 'Phase';
      case 'task': return 'Task';
      default: return level;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-xl">
        <p className="text-ink-faded">Loading AGENTS.md files...</p>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Memory (AGENTS.md)</h1>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        {/* Files List */}
        <Panel title="AGENTS.md Files">
          {files.length === 0 ? (
            <div className="text-center py-lg text-ink-faded">
              <p>No AGENTS.md files found.</p>
              <p className="text-sm mt-sm">Create AGENTS.md in your project root to get started.</p>
            </div>
          ) : (
            <div className="space-y-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-faded/20">
                    <th className="py-sm px-md text-left text-sm font-semibold">Name</th>
                    <th className="py-sm px-md text-left text-sm font-semibold">Path</th>
                    <th className="py-sm px-md text-left text-sm font-semibold">Level</th>
                    <th className="py-sm px-md text-left text-sm font-semibold">Last Accessed</th>
                    <th className="py-sm px-md text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(files) && files.length > 0 ? files.map((file) => {
                    const isSelected = selectedFile?.path === file.path;
                    return (
                      <tr
                        key={file.path}
                        className={`border-b border-ink-faded/20 ${
                          isSelected ? 'bg-electric-blue/10' : 'hover:bg-paper-lined/50'
                        }`}
                      >
                        <td className="py-sm px-md">
                          <span className="font-semibold">{file.name}</span>
                        </td>
                        <td className="py-sm px-md">
                          <span className="font-mono text-sm">{file.path}</span>
                        </td>
                        <td className="py-sm px-md">
                          <StatusBadge
                            status={getLevelBadge(file.level)}
                            showLabel
                            label={getLevelLabel(file.level)}
                          />
                        </td>
                        <td className="py-sm px-md text-sm text-ink-faded">
                          {file.lastAccessed ? new Date(file.lastAccessed).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-sm px-md text-right">
                          {!isSelected && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFileClick(file)}
                            >
                              OPEN
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={5} className="py-lg text-center text-ink-faded">
                        No files available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* File Content */}
        <Panel title={selectedFile ? `Content: ${selectedFile.name}` : 'Select a file to view content'}>
          {loadingContent ? (
            <div className="text-center py-lg">
              <p className="text-ink-faded">Loading content...</p>
            </div>
          ) : fileContent ? (
            <div className="space-y-md">
              <div className="bg-paper-lined rounded-md p-md">
                <pre className="whitespace-pre-wrap font-mono text-sm overflow-auto max-h-[600px]">
                  {fileContent}
                </pre>
              </div>
              {selectedFile && (
                <div className="flex items-center justify-between text-sm text-ink-faded">
                  <span>Level: {getLevelLabel(selectedFile.level)}</span>
                  <span>Path: {selectedFile.path}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-lg text-ink-faded">
              <p>Select an AGENTS.md file from the list to view its content.</p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
