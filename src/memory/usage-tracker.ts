/**
 * UsageTracker for RWM Puppet Master
 * 
 * Manages the append-only usage.jsonl file per STATE_FILES.md Section 4.
 * Tracks platform usage events for budget management and quota enforcement.
 */

import { appendFile, readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Platform } from '../types/config.js';
import type { UsageEvent, UsageQuery, UsageSummary } from '../types/usage.js';

/**
 * UsageTracker handles reading and writing to usage.jsonl
 */
export class UsageTracker {
  private filePath: string;

  constructor(filePath: string = '.puppet-master/usage/usage.jsonl') {
    this.filePath = filePath;
  }

  /**
   * Ensures the directory and file exist
   */
  private async ensureFileExists(): Promise<void> {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    // Create empty file if it doesn't exist
    if (!existsSync(this.filePath)) {
      await writeFile(this.filePath, '', 'utf-8');
    }
  }

  /**
   * Parses a single JSONL line into a UsageEvent
   * Returns null if line is invalid or empty
   */
  private parseLine(line: string): UsageEvent | null {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      return null;
    }

    try {
      const event = JSON.parse(trimmed) as UsageEvent;
      
      // Validate required fields
      if (!event.timestamp || !event.platform || !event.action || typeof event.durationMs !== 'number' || typeof event.success !== 'boolean') {
        return null;
      }

      return event;
    } catch {
      // Invalid JSON, skip this line
      return null;
    }
  }

  /**
   * Records a usage event, appending to usage.jsonl
   * Automatically adds timestamp if not provided
   */
  async track(event: Omit<UsageEvent, 'timestamp'>): Promise<void> {
    const fullEvent: UsageEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    await this.ensureFileExists();

    // Append JSON line (no trailing newline on last line, but we add one for consistency)
    const jsonLine = JSON.stringify(fullEvent) + '\n';
    await appendFile(this.filePath, jsonLine, 'utf-8');
  }

  /**
   * Reads all events from usage.jsonl
   * Returns empty array if file doesn't exist or is empty
   */
  async getAll(): Promise<UsageEvent[]> {
    if (!existsSync(this.filePath)) {
      return [];
    }

    try {
      const content = await readFile(this.filePath, 'utf-8');
      if (content.trim().length === 0) {
        return [];
      }

      const lines = content.split('\n');
      const events: UsageEvent[] = [];

      for (const line of lines) {
        const event = this.parseLine(line);
        if (event) {
          events.push(event);
        }
      }

      return events;
    } catch {
      // If file read fails, return empty array
      return [];
    }
  }

  /**
   * Returns all events for a specific platform
   */
  async getByPlatform(platform: Platform): Promise<UsageEvent[]> {
    const allEvents = await this.getAll();
    return allEvents.filter(event => event.platform === platform);
  }

  /**
   * Returns events within a time period
   * If until is not provided, uses current time
   */
  async getInPeriod(since: Date, until?: Date): Promise<UsageEvent[]> {
    const allEvents = await this.getAll();
    const untilDate = until || new Date();

    return allEvents.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= since && eventDate <= untilDate;
    });
  }

  /**
   * Queries events with multiple filters
   * All filters are combined with AND logic
   */
  async query(query: UsageQuery): Promise<UsageEvent[]> {
    let events = await this.getAll();

    // Apply platform filter
    if (query.platform) {
      events = events.filter(event => event.platform === query.platform);
    }

    // Apply action filter
    if (query.action) {
      events = events.filter(event => event.action === query.action);
    }

    // Apply time filters
    if (query.since) {
      const sinceDate = query.since;
      events = events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= sinceDate;
      });
    }

    if (query.until) {
      const untilDate = query.until;
      events = events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate <= untilDate;
      });
    }

    // Apply limit
    if (query.limit !== undefined) {
      if (query.limit <= 0) {
        return [];
      }
      events = events.slice(0, query.limit);
    }

    return events;
  }

  /**
   * Gets aggregated summary statistics for a platform
   * If since is provided, only counts events after that date
   */
  async getSummary(platform: Platform, since?: Date): Promise<UsageSummary> {
    let events = await this.getByPlatform(platform);

    // Filter by date if provided
    if (since) {
      events = events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= since;
      });
    }

    const totalCalls = events.length;
    const totalTokens = events.reduce((sum, event) => sum + (event.tokens || 0), 0);
    const totalDurationMs = events.reduce((sum, event) => sum + event.durationMs, 0);
    const successCount = events.filter(event => event.success).length;
    const failureCount = events.filter(event => !event.success).length;

    return {
      platform,
      totalCalls,
      totalTokens,
      totalDurationMs,
      successCount,
      failureCount,
    };
  }

  /**
   * Counts events for a platform in the last hour (60 minutes)
   */
  async getCallCountInLastHour(platform: Platform): Promise<number> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const events = await this.getByPlatform(platform);
    return events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= oneHourAgo;
    }).length;
  }

  /**
   * Counts events for a platform since the start of the current day (UTC)
   */
  async getCallCountToday(platform: Platform): Promise<number> {
    const now = new Date();
    const startOfDay = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0
    ));

    const events = await this.getByPlatform(platform);
    return events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= startOfDay;
    }).length;
  }
}
