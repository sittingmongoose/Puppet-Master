import { useState, useEffect, useCallback } from 'react';
import { Panel } from '@/components/layout';
import { Button } from '@/components/ui';
import { StatusBadge } from '@/components/shared';
import { api, getErrorMessage } from '@/lib';
import { fetchWithRetry } from '@/hooks/index.js';
import type { StatusType } from '@/types';

interface TierItem {
  id: string;
  type: 'phase' | 'task' | 'subtask' | 'iteration';
  title: string;
  status: StatusType;
  children?: TierItem[];
  acceptanceCriteria?: string[];
  iterations?: number;
  currentIteration?: number;
}

/**
 * Tiers page - hierarchical tier view (fixes Issue #19)
 */
export default function TiersPage() {
  const [tiers, setTiers] = useState<TierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<TierItem | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Fetch tiers on mount
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchWithRetry(() => api.getTiers());
        const list = Array.isArray(data) ? data : [];
        setTiers(list as TierItem[]);
        if (list.length > 0) {
          setExpandedIds(new Set((list as TierItem[]).map((item) => item.id)));
        }
      } catch (err) {
        console.error('[Tiers] Failed to fetch tiers:', err);
        setError(getErrorMessage(err, 'Failed to load tiers'));
        setTiers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTiers();
  }, []);

  // Toggle node expansion
  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Expand all nodes
  const expandAll = useCallback(() => {
    const getAllIds = (items: TierItem[]): string[] => {
      const list = Array.isArray(items) ? items : [];
      return list.flatMap((item) => [
        item.id,
        ...(Array.isArray(item.children) ? getAllIds(item.children) : []),
      ]);
    };
    setExpandedIds(new Set(getAllIds(tiers)));
  }, [tiers]);

  // Collapse all nodes
  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, item: TierItem) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setSelectedItem(item);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (Array.isArray(item.children) && item.children.length > 0 && !expandedIds.has(item.id)) {
          toggleExpand(item.id);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (Array.isArray(item.children) && item.children.length > 0 && expandedIds.has(item.id)) {
          toggleExpand(item.id);
        }
        break;
    }
  }, [expandedIds, toggleExpand]);

  if (loading) {
    return (
      <div className="text-center py-xl">
        <p className="text-ink-faded">Loading tiers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h1 className="font-display text-2xl">Tiers</h1>
        <div className="flex gap-sm">
          <Button variant="ghost" onClick={expandAll}>
            EXPAND ALL
          </Button>
          <Button variant="ghost" onClick={collapseAll}>
            COLLAPSE ALL
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <Panel showInnerBorder={false}>
          <div className="text-hot-magenta">{error}</div>
        </Panel>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Tree view */}
        <div className="lg:col-span-2">
          <Panel title="Tier Hierarchy">
            {(Array.isArray(tiers) ? tiers : []).length === 0 ? (
              <p className="text-ink-faded text-center py-lg">
                No tiers loaded. Start a project from the Wizard to generate tiers.
              </p>
            ) : (
              <div
                role="tree"
                aria-label="Tier hierarchy"
                className="space-y-xs"
              >
                {(Array.isArray(tiers) ? tiers : []).map((item) => (
                  <TreeNode
                    key={item.id}
                    item={item}
                    depth={0}
                    expanded={expandedIds.has(item.id)}
                    selected={selectedItem?.id === item.id}
                    expandedIds={expandedIds}
                    onToggle={toggleExpand}
                    onSelect={setSelectedItem}
                    onKeyDown={handleKeyDown}
                  />
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* Detail panel */}
        <div>
          <Panel title="Details">
            {selectedItem ? (
              <ItemDetails item={selectedItem} />
            ) : (
              <p className="text-ink-faded text-center py-lg">
                Select an item to view details
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

interface TreeNodeProps {
  item: TierItem;
  depth: number;
  expanded: boolean;
  selected: boolean;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (item: TierItem) => void;
  onKeyDown: (e: React.KeyboardEvent, item: TierItem) => void;
}

function TreeNode({
  item,
  depth,
  expanded,
  selected,
  expandedIds,
  onToggle,
  onSelect,
  onKeyDown,
}: TreeNodeProps) {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  
  return (
    <div role="treeitem" aria-expanded={hasChildren ? expanded : undefined}>
      <div
        className={`
          flex items-center gap-sm p-sm cursor-pointer
          border-medium transition-colors
          ${selected
            ? 'border-electric-blue bg-electric-blue/10'
            : 'border-transparent hover:border-ink-faded hover:bg-paper-lined/50'
          }
        `}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
        onClick={() => onSelect(item)}
        onKeyDown={(e) => onKeyDown(e, item)}
        tabIndex={0}
        role="button"
        aria-label={`${item.type}: ${item.title}`}
      >
        {/* Expand/collapse button */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(item.id);
            }}
            className="w-5 h-5 flex items-center justify-center text-ink-faded hover:text-ink-black dark:hover:text-ink-light"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* Status badge */}
        <StatusBadge status={item.status} size="sm" />

        {/* Item info */}
        <div className="flex-1 min-w-0">
          <span className={`
            font-mono text-sm px-sm py-xs border-medium mr-sm
            ${item.type === 'phase' ? 'border-electric-blue text-electric-blue' : ''}
            ${item.type === 'task' ? 'border-acid-lime text-acid-lime' : ''}
            ${item.type === 'subtask' ? 'border-safety-orange text-safety-orange' : ''}
            ${item.type === 'iteration' ? 'border-hot-magenta text-hot-magenta' : ''}
          `}>
            {item.id}
          </span>
          <span className="font-semibold truncate">{item.title}</span>
        </div>

        {/* Iteration progress */}
        {item.iterations && (
          <span className="text-sm text-ink-faded">
            {item.currentIteration || 0}/{item.iterations}
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div role="group">
          {(Array.isArray(item.children) ? item.children : []).map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              depth={depth + 1}
              expanded={expandedIds.has(child.id)}
              selected={false}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
              onKeyDown={onKeyDown}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ItemDetailsProps {
  item: TierItem;
}

function ItemDetails({ item }: ItemDetailsProps) {
  return (
    <div className="space-y-md">
      {/* Header */}
      <div>
        <span className={`
          font-mono text-sm px-sm py-xs border-medium
          ${item.type === 'phase' ? 'border-electric-blue text-electric-blue' : ''}
          ${item.type === 'task' ? 'border-acid-lime text-acid-lime' : ''}
          ${item.type === 'subtask' ? 'border-safety-orange text-safety-orange' : ''}
          ${item.type === 'iteration' ? 'border-hot-magenta text-hot-magenta' : ''}
        `}>
          {item.id}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-lg">{item.title}</h3>

      {/* Status */}
      <div className="flex items-center gap-sm">
        <span className="font-semibold">Status:</span>
        <StatusBadge status={item.status} showLabel />
      </div>

      {/* Type */}
      <div>
        <span className="font-semibold">Type:</span>
        <span className="ml-sm capitalize">{item.type}</span>
      </div>

      {/* Iterations */}
      {item.iterations && (
        <div>
          <span className="font-semibold">Iteration:</span>
          <span className="ml-sm">
            {item.currentIteration || 0} of {item.iterations}
          </span>
        </div>
      )}

      {/* Acceptance Criteria */}
      {Array.isArray(item.acceptanceCriteria) && item.acceptanceCriteria.length > 0 && (
        <div>
          <h4 className="font-semibold mb-sm">Acceptance Criteria:</h4>
          <ul className="list-disc list-inside space-y-xs text-sm">
            {item.acceptanceCriteria.map((criterion, index) => (
              <li key={index}>{criterion}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Children count */}
      {Array.isArray(item.children) && item.children.length > 0 && (
        <div>
          <span className="font-semibold">Children:</span>
          <span className="ml-sm">{item.children.length} items</span>
        </div>
      )}
    </div>
  );
}
