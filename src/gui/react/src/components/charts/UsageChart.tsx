/**
 * UsageChart - 7-day usage bar chart
 * 
 * Displays API usage over the past 7 days, stacked by platform.
 * Uses Recharts for rendering.
 */

interface UsageData {
  date: string;
  cursor: number;
  codex: number;
  claude: number;
}

interface UsageChartProps {
  data: UsageData[];
  className?: string;
}

/**
 * Simple bar chart for usage visualization
 * 
 * Note: Full Recharts integration would require adding recharts dependency.
 * This is a fallback CSS-based chart that maintains the visual style.
 */
export function UsageChart({ data, className = '' }: UsageChartProps) {
  const safeData = Array.isArray(data) ? data : [];
  const maxValue =
    safeData.length === 0
      ? 1
      : Math.max(...safeData.map((d) => d.cursor + d.codex + d.claude));

  return (
    <div className={`space-y-sm ${className}`}>
      <div className="flex items-end gap-xs h-32">
        {safeData.map((day) => {
          const total = day.cursor + day.codex + day.claude;
          const cursorHeight = maxValue > 0 ? (day.cursor / maxValue) * 100 : 0;
          const codexHeight = maxValue > 0 ? (day.codex / maxValue) * 100 : 0;
          const claudeHeight = maxValue > 0 ? (day.claude / maxValue) * 100 : 0;

          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col justify-end h-full"
              title={`${day.date}: ${total} calls`}
            >
              {/* Stacked bars */}
              <div
                className="bg-electric-blue"
                style={{ height: `${cursorHeight}%` }}
              />
              <div
                className="bg-safety-orange"
                style={{ height: `${codexHeight}%` }}
              />
              <div
                className="bg-royal-purple"
                style={{ height: `${claudeHeight}%` }}
              />
            </div>
          );
        })}
      </div>
      
      {/* X-axis labels */}
      <div className="flex gap-xs text-xs text-ink-faded">
        {safeData.map((day) => (
          <div key={day.date} className="flex-1 text-center truncate">
            {formatDate(day.date)}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-md text-xs">
        <div className="flex items-center gap-xs">
          <span className="w-3 h-3 bg-electric-blue" />
          <span>Cursor</span>
        </div>
        <div className="flex items-center gap-xs">
          <span className="w-3 h-3 bg-safety-orange" />
          <span>Codex</span>
        </div>
        <div className="flex items-center gap-xs">
          <span className="w-3 h-3 bg-royal-purple" />
          <span>Claude</span>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}
