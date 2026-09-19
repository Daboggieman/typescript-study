# Lecture 13: npm & Packages

Python's story is `pip` plus `venv`, and the tutorial always tells you to make a virtual environment first. **JavaScript has no equivalent problem**: every project gets its own `node_modules/` folder automatically, so dependencies are already isolated per project. This lecture covers npm — the package manager — and what is actually inside a `package.json`.

---

## 1. The One Thing to Know First

| Python | Node.js |
|---|---|
| `pip install requests` — installs globally by default | `npm install express` — installs **into this project** by default |
| You must create and activate a `venv` to isolate | **No virtualenv.** `node_modules/` is per-project, always |
| `pip freeze > requirements.txt` | `package-lock.json`, written automatically |
| `python -m venv .venv` then `source .venv/bin/activate` | not needed |
| `pip install -r requirements.txt` | `npm install` (reads `package.json`) |
| `python app.py` | `node app.js` or `npm run start` |

If you take one thing from this lecture: **there is no `venv` to activate.** You `cd` into the project and npm does the right thing. `node_modules/` is never committed; `package.json` and `package-lock.json` are.

---

## 2. `package.json` — The Project Manifest

Created by `npm init` (or `npm init -y` to accept every default):

```json
{
  "name": "typescript-study",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "ex": "tsx",
    "check": "tsc --noEmit",
    "build": "tsc -p tsconfig.build.json",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

Every field that matters:

| Field | Meaning |
|---|---|
| `name` | Lowercase, no spaces. What you would publish under |
| `version` | Semver. **Changing it is a promise to your users** |
| `private: true` | Refuses to publish. Every app should set this |
| `type: "module"` | **`.js` files are ES modules.** This is why `.ts` files here use `import`/`export` |
| `scripts` | Named commands: `npm run <name>` |
| `dependencies` | Needed to **run** the code |
| `devDependencies` | Needed only to **develop** it — types, test runners, linters |
| `main` / `exports` | What a consumer gets when they import your package |
| `engines` | Which Node versions you support |

That `type` field explains a lot of confusion: without it, `.js` means CommonJS (`require`), and `import` statements fail. With it, `.js` means ESM. This repo sets it, which is why the `.ts` files can use modern `import`/`export` and top-level `await`.

---

## 3. Dependencies vs devDependencies

```bash
npm install express                  # dependencies        — ships with the app
npm install --save-dev typescript    # devDependencies     — development only
npm install -D vitest                # -D is the short form
npm install -g typescript            # GLOBAL — avoid this
```

The rule: **if it is imported by code that runs in production, it is a dependency. Otherwise it is a devDependency.**

```json
{
  "dependencies": { "express": "^4.18.2" },
  "devDependencies": { "typescript": "^5.7.2" }
}
```

For an application the distinction is mostly organisational — everything gets installed either way. For a **library** it is load-bearing: a consumer installing your package receives only `dependencies`, so a package listed in the wrong place is either missing at runtime or bloating everyone's install.

> **Avoid `npm install -g`.** A global install means "this specific version, on this machine, for every project", which is exactly the isolation problem virtualenvs solved for Python. Almost everything you would install globally (TypeScript, a test runner, a build tool) should be a devDependency and invoked through `npx` or a script. The `-g` escape hatch exists for CLI tools you genuinely use everywhere, like `npm-check-updates`.

---

## 4. Semantic Versioning

```json
"typescript": "^5.7.2"
```

`MAJOR.MINOR.PATCH`, and the prefix decides how much npm may upgrade for you:

| Range | Allows | Meaning |
|---|---|---|
| `5.7.2` | exactly that version | Pinned |
| `~5.7.2` | `5.7.x` | Patch updates only |
| `^5.7.2` | `5.x.x` | **The default.** Minor and patch updates |
| `*` or `latest` | anything | Do not |

Semver's contract is only meaningful if the package author follows it:

- **MAJOR** — breaking change. Your code must change.
- **MINOR** — new features, backwards compatible.
- **PATCH** — bug fixes only.

In practice, `^` is safe for most packages and occasionally spectacular when an author ships a breaking change in a minor. When a dependency upgrade breaks your build, read the changelog before changing your code — sometimes it is their mistake.

---

## 5. The Lockfile

`package-lock.json` records the **exact** version of every package, including transitive dependencies — the packages your packages depend on. Commit it.

| | `package.json` | `package-lock.json` |
|---|---|---|
| Records | the ranges you asked for | the exact versions installed |
| Written by | you, `npm install <pkg>` | npm, automatically |
| Commit it? | yes | **yes** |
| Size | small | large, and that is fine |

```bash
npm install        # honours the lockfile; updates it if package.json changed
npm ci             # installs EXACTLY the lockfile, never writes one
```

`npm ci` is the one to use in CI and on a fresh clone: it is faster, and it fails rather than silently resolving a different version than your teammates have. `npm install` is for when you are deliberately changing dependencies.

> **The `node_modules` rule:** always gitignored, never committed, always reproducible from the lockfile. If a project's `node_modules` and lockfile disagree, delete `node_modules` and run `npm ci`.

---

## 6. `node_modules` — How Node Finds a Package

When you write `import { z } from "zod"`, Node walks **up** the directory tree looking for `node_modules/zod`, then `node_modules/zod/package.json`, and reads its `main`/`exports` field to find the actual file.

That upward walk explains several things:

- **Nested duplicates are normal.** If two of your dependencies need different major versions of the same package, both are installed, nested. There is no "dependency hell" version conflict — at the cost of disk space.
- **A dependency you never installed can still resolve**, because a parent folder has it. This produces the "works on my machine" bug where a package is imported without being declared.
- **Deleting `node_modules` is always safe.** It is a build artefact. `rm -rf node_modules && npm ci` fixes an astonishing range of problems.

```bash
du -sh node_modules          # how much space it takes
npm ls <package>             # why is this installed?
npm outdated                 # what is behind?
npm prune                    # remove what is no longer in package.json
```

---

## 7. npm Scripts

```json
"scripts": {
  "ex": "tsx",
  "check": "tsc --noEmit",
  "test": "vitest run"
}
```

```bash
npm run check
npm test                     # test/start/stop are special — `run` is optional
npm run ex CURRICULUM/01_hello_typescript/exercises.ts
```

Three details worth knowing:

1. **`node_modules/.bin` is on the PATH inside a script.** That is why `"test": "vitest run"` works without a path, while typing `vitest run` in your shell needs `npx vitest run`.
2. **Arguments pass through with `--`.** `npm run ex file.ts -- --watch` passes `--watch` to `tsx`, not to npm. Forgetting the `--` is why your script's arguments vanish.
3. **Scripts are the project's documented commands.** A new contributor reads `package.json` to learn how to run, test, and build. Treat the script names as an interface.

### Pre- and post- hooks

```json
"pretest": "npm run check",
"test": "vitest run"
```

`npm test` now typechecks first, and a type error stops the tests from running. Any script name can have a `pre`/`post` sibling, run automatically. It is a small feature that enforces a useful habit.

---

## 8. `npx` — Running a Package Without Installing It

```bash
npx tsx file.ts              # run tsx without a global install
npx tsc --version
npx --yes some-tool          # skip the "install this?" prompt
```

`npx` looks in `node_modules/.bin` first, then downloads temporarily. It is how you try a tool once without polluting anything. Inside a project with the tool already installed as a devDependency, prefer `npm run` — it uses your pinned version instead of whatever is current.

---

## 9. Node Versions

There is no `pyenv` in the standard toolchain, but the equivalent tools are worth knowing:

```bash
node --version               # v22.23.2

# The version managers
nvm install 22 && nvm use 22            # the most common
fnm use 22                              # faster, written in Rust
volta install node@22                   # pins per-project
```

Record what you need in `package.json` so the mismatch surfaces early:

```json
"engines": { "node": ">=22.0.0" }
```

`@types/node` should match your runtime's major version — that is why this repo installs `@types/node@^22` alongside Node 22. If the types and the runtime disagree, you get either missing APIs or APIs that typecheck and then fail.

---

## 10. Publishing, Briefly

```bash
npm login
npm publish              # only if "private" is not true
npm version patch        # bumps the version and creates a git tag
```

Before publishing you would configure `files` (what to include), `exports` (the entry points), and usually run a build so consumers get compiled `.js` rather than `.ts`. None of it applies to this repo — `"private": true` is set, which makes `npm publish` refuse — but the mechanism is worth knowing since it is what `npm install <anything>` pulls from.

---

## 🧠 Try It Yourself

Exercises for this module are mostly terminal work:

1. Run `npm ls --depth=0` in this repo and read the tree of what is installed directly.
2. Run `npm outdated` and interpret the output columns.
3. Explain, in a comment in `exercises.ts`, why `typescript` is in `devDependencies` and not `dependencies`.
4. Look up `tsx` in `package-lock.json` and find its exact resolved version and integrity hash.
5. Delete `node_modules`, then run `npm ci` and confirm the install is identical. (Do this only when you have network access.)
6. Add a `pretest` script that runs `npm run check` before the tests, and prove a type error stops the suite.
7. Work out what `^4.19.2` permits, and what `~4.19.2` would permit instead.

Open `exercises.ts` for the written parts.

---

## 📚 Resources

- **Docs:** [npm — package.json reference](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- **Docs:** [npm — About semantic versioning](https://docs.npmjs.com/about-semantic-versioning)
- **Docs:** [npm — `npm ci`](https://docs.npmjs.com/cli/v10/commands/npm-ci)
- **Docs:** [Node.js — Modules: Packages](https://nodejs.org/api/packages.html) — the authoritative statement on `exports` and resolution
- **Docs:** [semver.org](https://semver.org/) — the specification itself, and shorter than you expect
