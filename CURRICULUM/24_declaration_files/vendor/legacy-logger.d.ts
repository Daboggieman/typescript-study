// Hand-written declarations for ./legacy-logger.js
//
// The naming rule is the whole mechanism: TypeScript resolves the import
// "./vendor/legacy-logger.js" and looks for "legacy-logger.d.ts" next to it.
// The pair is matched by filename, so these two files must stay together.
//
// Note what is declared and what is not:
//   - `log` is typed properly, because it is what we call
//   - `level` returns a UNION of the two strings it can actually return,
//     which is much more useful downstream than `string`
//   - `VERSION` is declared `const`, so it keeps its literal type
//
// Delete this file and run `npm run check` to see TS7016.

export declare function log(message: string): void;

export declare function level(): "info" | "warn" | "error";

export declare const VERSION: "1.4.2";
