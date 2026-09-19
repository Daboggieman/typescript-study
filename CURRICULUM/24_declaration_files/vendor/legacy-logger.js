// A plain JavaScript file with no types of its own.
//
// This is the situation the declaration file beside it exists for: TypeScript
// refuses to include .js files unless `allowJs` is on, so without
// legacy-logger.d.ts this module would be invisible to the type system and
// every import from it would be a TS7016 error.

export function log(message) {
  console.log("[legacy]", message);
}

export function level() {
  return "info";
}

export const VERSION = "1.4.2";
