// Wildcard module declarations for non-code imports.
//
// Node cannot import a .css or .svg file. Neither can the type system, unless
// you tell it what such an import produces. A wildcard pattern like "*.css"
// matches any import ending in that suffix.
//
// A bundler (Vite, webpack, esbuild) is what actually handles these at build
// time — these declarations only describe what the bundler will produce.
// This repo runs Node directly, so nothing here is imported; the file exists
// so you can see the shape of the pattern.

declare module "*.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.svg" {
  const url: string;
  export default url;
}

declare module "*.png" {
  const url: string;
  export default url;
}

declare module "*.txt" {
  const content: string;
  export default content;
}

// A bundler "define" — the runtime value is substituted at build time.
// Same caveat as the ambient modules above: the compiler believes this.
declare const __BUILD_TIME__: string;
