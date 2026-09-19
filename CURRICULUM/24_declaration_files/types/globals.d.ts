// Global augmentations.
//
// `declare global` only works inside a MODULE, and a .d.ts with no imports or
// exports counts as a script. So `export {}` is load-bearing: delete it and
// you get "Augmentations for the global scope can only be directly nested in
// external modules" — after which the declarations below silently stop applying.
//
// Use `var`, not `let` or `const`, for global variables. `var` declarations
// merge across files in the global scope; `let`/`const` do not and collide.

export {};

declare global {
  // Extending the DOM's Window, as a script tag's injected global would.
  interface Window {
    appVersion: string;
    analytics: {
      track(event: string, props?: Record<string, unknown>): void;
    };
  }

  // A build-time flag substituted by a bundler or bundler-equivalent.
  // TypeScript believes this exists; nothing guarantees it does at runtime.
  var __DEV__: boolean;

  // TODO: Exercise 6 — augment Node's environment type.
  //
  // A module augmentation of an interface from @types/node, using the same
  // mechanism. This is how you type process.env.API_BASE without a cast:
  //
  //   namespace NodeJS {
  //     interface ProcessEnv {
  //       API_BASE?: string;
  //       NODE_ENV?: "development" | "production" | "test";
  //     }
  //   }
  //
  // Note that every property must be optional. process.env is a Record of
  // string to string | undefined — there is no way to guarantee a variable
  // was set, and marking it required would be a lie the compiler believed.
}
