import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  content?: string;
}

// Mock data for demonstration
const MOCK_FILES: Record<string, EvidenceFile> = {
  '1': { id: '1', name: 'dashboard-screenshot.png', type: 'screenshot', size: 245000, createdAt: new Date('2026-01-25T10:30:00'), tierId: 'T01-S01', status: 'complete' },
  '2': { id: '2', name: 'test-output.log', type: 'log', size: 12500, createdAt: new Date('2026-01-25T10:31:00'), tierId: 'T01-S01', status: 'complete', content: '[INFO] Test started at 10:31:00\n[INFO] Running test suite...\n[PASS] All tests passed\n[INFO] Test completed successfully' },
  '3': { id: '3', name: 'gate-report-T01.json', type: 'report', size: 5200, createdAt: new Date('2026-01-25T10:32:00'), tierId: 'T01', status: 'complete' },
  '4': { id: '4', name: 'browser-trace.zip', type: 'trace', size: 1250000, createdAt: new Date('2026-01-25T10:33:00'), tierId: 'T01-S02', status: 'error' },
  '5': { id: '5', name: 'file-snapshot-before.txt', type: 'snapshot', size: 3400, createdAt: new Date('2026-01-25T10:34:00'), tierId: 'T01-S02', content: '// Sample file snapshot content\nconst config = {\n  enabled: true,\n  timeout: 5000\n};' },
};

/**
 * Evidence Detail page - full-page view of a single evidence file
 * Accessed via /evidence/:id route
 */
export default function EvidenceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<EvidenceFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch evidence file on mount
  useEffect(() => {
    const fetchFile = async () => {
      if (!id) {
        setError('No evidence ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // In production, this would call the API
        // const data = await api.getEvidence(id);
        // setFile(data);

        // Using mock data for now
        await new Promise((r) => setTimeout(r, 200));
        const mockFile = MOCK_FILES[id];
        if (mockFile) {
          setFile(mockFile);
        } else {
          setError(`Evidence file with ID "${id}" not found`);
        }
      } catch (err) {
        console.error('[EvidenceDetail] Failed to fetch file:', err);
        setError('Failed to load evidence file');
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [id]);

  // Format file size
  const formatSize = useCallback((bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  // Get type icon
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

  if (loading) {
    return (
      <div className="text-center py-xl">
        <p className="text-ink-faded">Loading evidence file...</p>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="space-y-lg">
        <div className="flex items-center gap-md">
          <Link
            to="/evidence"
            className="text-electric-blue hover:underline font-ui"
          >
            &larr; Back to Evidence
          </Link>
        </div>
        <Panel>
          <div className="text-center py-xl">
            <p className="text-hot-magenta font-semibold text-lg mb-md">
              {error || 'File not found'}
            </p>
            <Button variant="primary" onClick={() => navigate('/evidence')}>
              VIEW ALL EVIDENCE
            </Button>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Breadcrumb navigation */}
      <div className="flex flex-wrap items-center gap-md">
        <Link
          to="/evidence"
          className="text-electric-blue hover:underline font-ui"
        >
          &larr; Back to Evidence
        </Link>
        <span className="text-ink-faded">/</span>
        <span className="font-mono text-sm">{file.name}</span>
      </div>

      {/* File header */}
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div>
          <h1 className="font-display text-2xl flex items-center gap-sm">
            <span>{getTypeIcon(file.type)}</span>
            {file.name}
          </h1>
          <div className="flex items-center gap-md mt-sm text-ink-faded">
            <span className="capitalize">{file.type}</span>
            <span>{formatSize(file.size)}</span>
            <span>{file.createdAt.toLocaleString()}</span>
            {file.tierId && (
              <Link
                to={`/tiers?item=${file.tierId}`}
                className="font-mono text-electric-blue hover:underline"
              >
                {file.tierId}
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-md">
          {file.status && (
            <StatusBadge status={file.status} showLabel size="lg" />
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* File content / preview */}
        <div className="lg:col-span-2">
          <Panel title="Content">
            <FileContent file={file} />
          </Panel>
        </div>

        {/* Metadata sidebar */}
        <div className="space-y-lg">
          <Panel title="Details">
            <div className="space-y-sm text-sm">
              <DetailRow label="ID" value={file.id} mono />
              <DetailRow label="Type" value={file.type} capitalize />
              <DetailRow label="Size" value={formatSize(file.size)} />
              <DetailRow
                label="Created"
                value={file.createdAt.toLocaleString()}
              />
              {file.tierId && (
                <DetailRow label="Tier ID" value={file.tierId} mono />
              )}
              {file.status && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Status:</span>
                  <StatusBadge status={file.status} showLabel />
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Actions">
            <div className="space-y-sm">
              <Button variant="primary" className="w-full">
                DOWNLOAD
              </Button>
              <Button variant="secondary" className="w-full">
                OPEN IN NEW TAB
              </Button>
              <Button variant="ghost" className="w-full">
                COPY LINK
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface DetailRowProps {
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}

function DetailRow({ label, value, mono, capitalize }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-semibold">{label}:</span>
      <span
        className={`
          ${mono ? 'font-mono' : ''}
          ${capitalize ? 'capitalize' : ''}
        `}
      >
        {value}
      </span>
    </div>
  );
}

interface FileContentProps {
  file: EvidenceFile;
}

function FileContent({ file }: FileContentProps) {
  switch (file.type) {
    case 'screenshot':
      return (
        <div className="text-center py-xl bg-ink-black/5 dark:bg-ink-light/5 rounded">
          <div className="text-6xl mb-md">📸</div>
          <p className="text-ink-faded">Screenshot Preview</p>
          <p className="text-xs text-ink-faded mt-sm">
            (Image would render here in production)
          </p>
        </div>
      );

    case 'log':
      return (
        <div className="bg-ink-black text-acid-lime font-mono text-sm p-md max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap">
            {file.content || '[INFO] No log content available'}
          </pre>
        </div>
      );

    case 'report':
      return (
        <div className="space-y-md">
          <p className="text-ink-faded">Gate Report: {file.name}</p>
          <div className="bg-paper-lined/50 dark:bg-ink-black/20 p-md font-mono text-sm">
            <pre className="whitespace-pre-wrap">
              {`{
  "gate": "T01",
  "status": "passed",
  "timestamp": "${file.createdAt.toISOString()}",
  "checks": {
    "build": "passed",
    "tests": "passed",
    "lint": "passed"
  }
}`}
            </pre>
          </div>
        </div>
      );

    case 'trace':
      return (
        <div className="text-center py-xl">
          <div className="text-6xl mb-md">🌐</div>
          <p className="text-ink-faded">Browser Trace Archive</p>
          <p className="text-sm text-ink-faded mt-sm">
            Download to view in Chrome DevTools
          </p>
        </div>
      );

    case 'snapshot':
      return (
        <div className="bg-paper-lined/30 dark:bg-ink-black/20 p-md font-mono text-sm max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap">
            {file.content || '// File snapshot content'}
          </pre>
        </div>
      );

    default:
      return (
        <div className="text-center py-xl text-ink-faded">
          <p>Preview not available for this file type</p>
        </div>
      );
  }
}
