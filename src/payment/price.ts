import type { RouteRow } from '../db/queries'

/**
 * Match a path against a glob pattern.
 * Supports '*' (any single segment) and '**' or trailing '*' (any suffix).
 */
function matchPattern(pattern: string, path: string): boolean {
  // Escape regex special chars except * and convert glob * to regex
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '.+')
    .replace(/\*$/g, '.+') // trailing * matches multiple segments
    .replace(/\*/g, '[^/]+') // non-trailing * matches single segment
  return new RegExp(`^${escaped}$`).test(path)
}

/**
 * Resolve the USDC price for a given path.
 * Routes are already sorted by priority ascending (lower = higher precedence).
 * Falls back to defaultPrice if no route matches.
 */
export function resolvePrice(
  path: string,
  routes: RouteRow[],
  defaultPrice: string,
): string {
  for (const route of routes) {
    if (matchPattern(route.path_pattern, path)) {
      return route.price
    }
  }
  return defaultPrice
}
