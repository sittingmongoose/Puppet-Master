import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Panel } from '@/components/layout';
import { Button } from '@/components/ui';
import { StatusBadge } from '@/components/shared';
import type { StatusType } from '@/types';

interface EvidenceFile {
  id: string;
  name: string;
  type: 'screenshot' | 'log' | 'report' | 'trace' | 'snapshot';
  size: number;
  createdAt: Date;
  tierId?: string;
  status?: StatusType;
}

interface EvidenceCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

const CATEGORIES: EvidenceCategory[] = [
  { id: 'all', name: 'All Files', icon: '📁', count: 0 },
  { id: 'screenshot', name: 'Screenshots', icon: '📸', count: 0 },
  { id: 'log', name: 'Logs', icon: '📝', count: 0 },
  { id: 'report', name: 'Gate Reports', icon: '📊', count: 0 },
  { id: 'trace', name: 'Browser Traces', icon: '🌐', count: 0 },
  { id: 'snapshot', name: 'File Snapshots', icon: '📄', count: 0 },
];

// Mock data for demonstration
const MOCK_FILES: EvidenceFile[] = [
  { id: '1', name: 'dashboard-screenshot.png', type: 'screenshot', size: 245000, createdAt: new Date('2026-01-25T10:30:00'), tierId: 'T01-S01', status: 'complete' },
  { id: '2', name: 'test-output.log', type: 'log', size: 12500, createdAt: new Date('2026-01-25T10:31:00'), tierId: 'T01-S01', status: 'complete' },
  { id: '3', name: 'gate-report-T01.json', type: 'report', size: 5200, createdAt: new Date('2026-01-25T10:32:00'), tierId: 'T01', status: 'complete' },
  { id: '4', name: 'browser-trace.zip', type: 'trace', size: 1250000, createdAt: new Date('2026-01-25T10:33:00'), tierId: 'T01-S02', status: 'error' },
  { id: '5', name: 'file-snapshot-before.txt', type: 'snapshot', size: 3400, createdAt: new Date('2026-01-25T10:34:00'), tierId: 'T01-S02' },
];

/**
 * Evidence page - evidence viewer
 */
export default function EvidencePage() {
  const { id } = useParams<{ id?: string }>();
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFile, setSelectedFile] = useState<EvidenceFile | null>(null);

  // Fetch evidence files on mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        // In production, this would call the API
        // const data = await api.getEvidence();
        // setFiles(data);
        
        // Using mock data for now
        await new Promise((r) => setTimeout(r, 300));
        const fileList = Array.isArray(MOCK_FILES) ? MOCK_FILES : [];
        setFiles(fileList);
        
        // If an ID was passed, select that file
        if (id) {
          const file = fileList.find((f) => f.id === id);
          if (file) setSelectedFile(file);
        }
      } catch (err) {
        console.error('[Evidence] Failed to fetch files:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [id]);

  const filesList = Array.isArray(files) ? files : [];
  const filteredFiles = Array.isArray(filesList)
    ? (selectedCategory === 'all'
      ? filesList
      : filesList.filter((f) => f.type === selectedCategory))
    : [];

  const categoriesWithCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: cat.id === 'all'
      ? filesList.length
      : filesList.filter((f) => f.type === cat.id).length,
  }));

  // Format file size
  const formatSize = useCallback((bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  if (loading) {
    return (
      <div className="text-center py-xl">
        <p className="text-ink-faded">Loading evidence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h1 className="font-display text-2xl">Evidence</h1>
        <Button variant="ghost">
          REFRESH
        </Button>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg">
        {/* Category sidebar */}
        <div>
          <Panel title="Categories">
            <div className="space-y-xs">
              {categoriesWithCounts.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    w-full text-left p-sm flex items-center justify-between
                    border-medium transition-colors
                    ${selectedCategory === cat.id
                      ? 'border-electric-blue bg-electric-blue/10'
                      : 'border-transparent hover:border-ink-faded'
                    }
                  `}
                >
                  <span>
                    {cat.icon} {cat.name}
                  </span>
                  <span className="text-ink-faded text-sm">{cat.count}</span>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        {/* File list */}
        <div className="lg:col-span-2">
          <Panel title={`Files (${filteredFiles.length})`}>
            {filteredFiles.length === 0 ? (
              <p className="text-ink-faded text-center py-lg">
                No evidence files in this category
              </p>
            ) : (
              <div className="space-y-xs">
                {filteredFiles.map((file) => (
                  <FileRow
                    key={file.id}
                    file={file}
                    selected={selectedFile?.id === file.id}
                    formatSize={formatSize}
                    onSelect={() => setSelectedFile(file)}
                  />
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* Preview panel */}
        <div>
          <Panel title="Preview">
            {selectedFile ? (
              <FilePreview file={selectedFile} formatSize={formatSize} />
            ) : (
              <p className="text-ink-faded text-center py-lg">
                Select a file to preview
              </p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface FileRowProps {
  file: EvidenceFile;
  selected: boolean;
  formatSize: (bytes: number) => string;
  onSelect: () => void;
}

function FileRow({ file, selected, formatSize, onSelect }: FileRowProps) {
  const getTypeIcon = (type: EvidenceFile['type']) => {
    switch (type) {
      case 'screenshot': return '📸';
      case 'log': return '📝';
      case 'report': return '📊';
      case 'trace': return '🌐';
      case 'snapshot': return '📄';
      default: return '📁';
    }
  };

  return (
    <button
      onClick={onSelect}
      className={`
        w-full text-left p-sm flex items-center gap-sm
        border-medium transition-colors
        ${selected
          ? 'border-electric-blue bg-electric-blue/10'
          : 'border-transparent hover:border-ink-faded hover:bg-paper-lined/50'
        }
      `}
    >
      <span className="text-lg">{getTypeIcon(file.type)}</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{file.name}</div>
        <div className="flex items-center gap-sm text-xs text-ink-faded">
          {file.tierId && (
            <span className="font-mono">{file.tierId}</span>
          )}
          <span>{formatSize(file.size)}</span>
          <span>{file.createdAt.toLocaleTimeString()}</span>
        </div>
      </div>
      {file.status && (
        <StatusBadge status={file.status} size="sm" />
      )}
    </button>
  );
}

interface FilePreviewProps {
  file: EvidenceFile;
  formatSize: (bytes: number) => string;
}

function FilePreview({ file, formatSize }: FilePreviewProps) {
  return (
    <div className="space-y-md">
      {/* File info */}
      <div className="space-y-sm text-sm">
        <div>
          <span className="font-semibold">Name:</span>
          <span className="ml-sm font-mono">{file.name}</span>
        </div>
        <div>
          <span className="font-semibold">Type:</span>
          <span className="ml-sm capitalize">{file.type}</span>
        </div>
        <div>
          <span className="font-semibold">Size:</span>
          <span className="ml-sm">{formatSize(file.size)}</span>
        </div>
        <div>
          <span className="font-semibold">Created:</span>
          <span className="ml-sm">{file.createdAt.toLocaleString()}</span>
        </div>
        {file.tierId && (
          <div>
            <span className="font-semibold">Tier:</span>
            <Link
              to={`/tiers?item=${file.tierId}`}
              className="ml-sm font-mono text-electric-blue hover:underline"
            >
              {file.tierId}
            </Link>
          </div>
        )}
        {file.status && (
          <div className="flex items-center gap-sm">
            <span className="font-semibold">Status:</span>
            <StatusBadge status={file.status} showLabel />
          </div>
        )}
      </div>

      {/* Preview content */}
      <div className="border-t-medium border-ink-faded pt-md">
        {file.type === 'screenshot' ? (
          <div className="text-center text-ink-faded">
            <p>📸 Screenshot preview</p>
            <p className="text-xs">(Image would load here)</p>
          </div>
        ) : file.type === 'log' ? (
          <div className="p-sm bg-ink-black text-acid-lime font-mono text-xs max-h-40 overflow-y-auto">
            <pre>[INFO] Sample log content...</pre>
            <pre>[INFO] More log entries...</pre>
          </div>
        ) : (
          <p className="text-center text-ink-faded text-sm">
            Preview not available for this file type
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-sm">
        <Button variant="primary" size="sm">
          DOWNLOAD
        </Button>
        <Button variant="ghost" size="sm">
          OPEN IN NEW TAB
        </Button>
      </div>
    </div>
  );
}
