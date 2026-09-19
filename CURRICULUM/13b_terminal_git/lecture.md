# Lecture 13b: The Terminal & Git

You cannot work in TypeScript without a terminal and you cannot keep your work without version control. This lecture is the minimum you need to be effective at both, framed for a TypeScript project specifically.

---

## Part 1 — The Terminal

## 1. Moving Around

```bash
pwd                       # where am I?
ls                        # what is here?
ls -la                    # ...including hidden files (dotfiles like .gitignore)
cd projects               # go into a folder
cd ..                     # go up one
cd ~                      # go home
cd -                      # back to where you just were
```

`ls -la` matters more than it looks: `.gitignore`, `.git/`, `.env`, and `.vscode/` are all hidden by a bare `ls`, and those are exactly the files that change how a project behaves.

## 2. Files and Folders

```bash
mkdir src                 # make a folder
mkdir -p src/utils        # make nested folders, no error if they exist
touch index.ts            # create an empty file
cp a.ts b.ts              # copy
mv a.ts src/              # move or rename
rm a.ts                   # delete a file  — NO UNDO, no trash
rm -rf dist               # delete a folder and everything in it — be certain
cat file.ts               # print a file
head -20 file.ts          # the first 20 lines
tail -f app.log           # follow a log as it grows
```

> **`rm -rf` does not go to the trash.** There is no undo. The classic disaster is a stray space: `rm -rf ./dist /` (with a space before the slash) is a very different command from `rm -rf ./dist/`. Type carefully, and check `pwd` before deleting anything recursive.

In a TypeScript project, the folders you will delete routinely are `node_modules`, `dist`, and `coverage`. All three are build artefacts, all three are gitignored, and all three regenerate.

## 3. Finding Things

```bash
grep -r "TODO" CURRICULUM/             # search file contents recursively
grep -rn "console.log" --include="*.ts" .   # with line numbers, .ts only
find . -name "*.test.ts"               # find files by name
find . -name "*.ts" -not -path "*/node_modules/*"

# The modern replacements, if installed
rg "TODO" CURRICULUM/                  # ripgrep — much faster
fd "\.test\.ts$"                       # a friendlier find
```

That `-not -path "*/node_modules/*"` filter is a TypeScript-specific necessity: `node_modules` can hold tens of thousands of files, and a search that wanders into it is useless.

## 4. Pipes and Redirection

```bash
npm run check > errors.txt            # stdout to a file (overwrites)
npm run check >> errors.txt           # append
npm run check 2> errors.txt           # stderr only
npm run check 2>&1 | tee errors.txt   # both, and show on screen as well

npm run check | grep "error TS"       # only the type errors
npm run check && echo "all good"      # echo only if check SUCCEEDED
npm run check || echo "it failed"     # echo only if it FAILED
```

The `&&` and `||` behaviour is worth internalising, because it is how command chains are built: a command "succeeds" when its exit code is `0`. This is the same exit code you set with `process.exit(1)` in [02b_input_output](../02b_input_output/lecture.md) — the two are the same mechanism.

```bash
npm test; echo "exit code: $?"        # $? is the last command's exit code
```

## 5. Aliases and History

```bash
history | grep npm                    # what did I run before?
!!                                    # repeat the last command
!$                                    # last command's final argument
Ctrl+R                                # search history interactively
```

Useful shorthands to put in your shell profile:

```bash
alias tsc="npx tsc"
alias nrn="npm run"
alias nt="npm test"
```

---

## Part 2 — Git

## 6. The Three Places a File Can Be

This is the model that makes git stop being confusing:

```text
working directory          staging area            repository
(your edits)     --add-->  (what goes in   --commit-->  (permanent
                           the next commit)              history)
```

| Command | Moves a change |
|---|---|
| edit a file | working directory → changed |
| `git add <file>` | working directory → staging area |
| `git commit` | staging area → repository |
| `git push` | repository → remote (GitHub) |

`git add` does not save anything permanently. It marks what you *intend* to save. That two-step design is what lets you make several unrelated edits and commit them as separate, coherent changes.

## 7. The Commands You Use Every Day

```bash
git status                    # what has changed? Run this constantly.
git diff                      # what exactly changed, line by line?
git diff --staged             # ...in the staging area
git add file.ts               # stage one file
git add .                     # stage everything — check `git status` FIRST
git commit -m "feat: add fizzbuzz exercise"
git log --oneline             # a compact history
git log --oneline --graph --all
git show HEAD                 # the most recent commit in full
```

The order that keeps you out of trouble: **`status` → `diff` → `add` → `diff --staged` → `commit`.** The second `diff --staged` is the one people skip, and it is the last chance to notice the stray debugging `console.log` or the file you did not mean to include.

## 8. `.gitignore` for a TypeScript Project

```gitignore
node_modules/
dist/
coverage/
*.tsbuildinfo
.env
.DS_Store
```

What each line is protecting you from:

| Entry | Why |
|---|---|
| `node_modules/` | Rebuildable from the lockfile. Never commit it — it is hundreds of megabytes |
| `dist/` | Compiled output. A build artefact, regenerated by `npm run build` |
| `coverage/` | Test coverage reports |
| `*.tsbuildinfo` | TypeScript's incremental-build cache |
| `.env` | **Secrets.** Never commit API keys |
| `.DS_Store` | macOS folder metadata |

`.gitignore` only affects **untracked** files. A file already committed stays tracked after you add it to `.gitignore` — a genuinely common confusion:

```bash
git rm --cached .env          # stop tracking, keep the file on disk
echo ".env" >> .gitignore
```

## 9. Branches

```bash
git branch                    # list local branches
git switch -c feat/fizzbuzz   # create and switch to a new branch
git switch main               # go back
git merge feat/fizzbuzz       # merge into the current branch
git branch -d feat/fizzbuzz   # delete a merged branch
```

`git switch` (2019) replaced the overloaded `git checkout` for changing branches — it does one thing and cannot accidentally discard your work. `checkout` still exists and still works; prefer `switch` for branches and `restore` for files:

```bash
git restore file.ts           # DISCARD uncommitted changes to a file — no undo!
git restore --staged file.ts  # unstage, keeping the edit
```

## 10. Undoing Things

| Goal | Command |
|---|---|
| Discard edits to one file | `git restore file.ts` |
| Unstage, keep the edit | `git restore --staged file.ts` |
| Fix the last commit's message | `git commit --amend` |
| Add a forgotten file to the last commit | `git add f.ts && git commit --amend --no-edit` |
| Undo the last commit but keep the changes | `git reset --soft HEAD~1` |
| Undo the last commit, discard the changes | `git reset --hard HEAD~1` |
| Undo a commit on a shared branch | `git revert <hash>` |
| Recover something after a bad reset | `git reflog` |

Two rules that prevent most git disasters:

1. **`git reset --hard` destroys uncommitted work.** Nothing recovers it. Check `git status` first.
2. **Never rewrite history on a branch someone else has.** `amend`, `reset`, and force-push are fine on your own local branch; on `main`, use `revert`, which adds a new commit instead of erasing one. `git reflog` is the safety net — it records every position `HEAD` has been in for about 90 days, and it will find a commit you thought you lost.

## 11. Commit Messages That Mean Something

A convention worth adopting, and the one this repo uses:

```text
feat: add the generics module
fix: correct off-by-one in binary search
docs: clarify the mutable default section
refactor: extract the cart total into a helper
test: cover the empty-array case
chore: bump vitest to 2.1.8
```

Each is `type: description`, present tense, lowercase, no trailing full stop. `feat` and `fix` are the two that matter most; the rest are for humans reading the log.

Why bother? Because `git log --oneline` is the first thing anyone reads when investigating a bug, including you in six months. "fixed stuff" tells them nothing; `fix: handle empty cart in total()` says exactly where to look.

## 12. A First Repository

```bash
git init                              # start tracking this folder
git add .
git commit -m "chore: initial commit"

# Connect to GitHub
git remote add origin git@github.com:you/repo.git
git branch -M main
git push -u origin main
```

`git push -u` sets the upstream once, so every later `push` needs no arguments.

## 13. Working With This Repo

This repo has a remote and no commits yet. The first commit is a good exercise:

```bash
git status                            # node_modules/ should NOT appear — .gitignore works
git add .
git diff --staged --stat              # how many files, and how large
git commit -m "chore: scaffold the TypeScript study repo"
```

If `node_modules/` shows up in that `status`, your `.gitignore` is not being applied — check it is named exactly `.gitignore`, at the repository root, with no trailing extension.

---

## 🧠 Try It Yourself

Most of this module is muscular memory. Work in your own terminal:

1. `pwd`, `ls -la`, `cd` into `CURRICULUM`, then `cd -` back.
2. `find . -name "*.ts" -not -path "*/node_modules/*" | wc -l` — how many TypeScript files does this repo hold now?
3. `grep -rn "TODO" CURRICULUM/08_functions/` and count the exercises.
4. Run `npm run check` and pipe it through `grep "error TS"`. Then run `npm run check; echo $?` and note the exit code.
5. `git status`, then `git diff --stat`.
6. Create a branch, make a trivial edit, commit it with a `docs:` message, and switch back to `main`.
7. Write a `.gitignore` line for a file, create that file, and confirm `git status` ignores it.
8. Run `git log --oneline` and read the history of this repo.

---

## 📚 Resources

- **Book:** [Pro Git](https://git-scm.com/book/en/v2) — free, and chapters 1–3 are all most people ever need
- **Reference:** [Git — Command Reference](https://git-scm.com/docs)
- **Guide:** [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) — the `feat:`/`fix:` convention in full
- **Article:** [Oh Shit, Git!?!](https://ohshitgit.com/) — plain-language recipes for the mistakes everyone makes
- **Article:** [explainshell.com](https://explainshell.com/) — paste any shell command and get it explained piece by piece
