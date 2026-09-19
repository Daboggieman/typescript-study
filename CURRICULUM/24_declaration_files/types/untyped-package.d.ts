// Ambient declarations for a package that ships no types.
//
// `declare module "name"` tells TypeScript: "when someone imports `name`,
// this is what the module's shape is." Nothing here is emitted, and nothing
// is checked against reality — you are asserting, and the compiler believes
// you.
//
// THIS FILE IS A COMPILE-TIME DEMO ONLY. "untyped-package" is not installed,
// so importing it would typecheck perfectly and then fail at runtime with
// ERR_MODULE_NOT_FOUND. That gap is exactly what `declare` means, and it is
// why a declaration file must be written against a real implementation you
// have actually looked at.

declare module "untyped-package" {
  /** Parses a string into key/value pairs. */
  export function parse(input: string): Record<string, string>;

  /** Returns the package's own version string. */
  export const version: string;

  export interface Options {
    strict?: boolean;
    encoding?: "utf8" | "ascii";
  }

  export default function configure(options: Options): void;
}

// The one-liner version every guide shows you. It makes the ENTIRE module
// `any` — no autocomplete, no checking, and the `any` spreads to everything
// it touches. Useful as a five-minute unblock; never a destination.
declare module "totally-untyped-package";
