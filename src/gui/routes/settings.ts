/**
 * Settings API routes for RWM Puppet Master GUI
 * 
 * Provides routes for the Settings page.
 * The Settings page reuses the existing /api/config endpoints for loading and saving.
 * This file exists for consistency and potential future extensibility.
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T17 for specification.
 */

import type { Router } from 'express';
import { Router as createRouter } from 'express';

/**
 * Create settings routes.
 * 
 * Returns Express Router. Currently minimal as Settings page
 * reuses /api/config endpoints.
 * 
 * @returns Express Router for settings routes
 */
export function createSettingsRoutes(): Router {
  const router = createRouter();

  // Settings page uses /api/config endpoints for all operations
  // No additional API endpoints needed at this time
  // This router can be extended in the future if Settings-specific endpoints are needed

  return router;
}
