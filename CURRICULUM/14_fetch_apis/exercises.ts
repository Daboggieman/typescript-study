// Exercise 14: Fetch & APIs
// Run this file with: npm run ex CURRICULUM/14_fetch_apis/exercises.ts
//
// These exercises need network access. If you are offline (or sandboxed), the
// calls will throw "fetch failed" — the error handling is still the exercise,
// so write it either way.


// TODO: Exercise 1
// Fetch https://api.github.com/users/octocat and print the `name` and
// `public_repos` fields. Remember BOTH awaits: one for fetch, one for .json().
async function exercise1(): Promise<void> {
}


// TODO: Exercise 2
// Fetch https://api.github.com/users/this-user-does-not-exist-xyz
// Confirm NO exception is thrown, then print response.status and response.ok.
// In a comment, explain why a 404 does not reject a fetch promise.
async function exercise2(): Promise<void> {
}


// TODO: Exercise 3
// Write fetchJSON<T> that throws when !response.ok, then use it for both URLs above.
export async function fetchJSON<T>(url: string): Promise<T> {
  throw new Error("TODO");
}


// TODO: Exercise 4
// Fetch a GitHub repo and print it WITHOUT validation.
// Then write an isRepo type predicate and validate the same response.
// Explain in a comment why `as Repo` is an assertion, not a check.
type Repo = { name: string; stargazers_count: number };

export function isRepo(value: unknown): value is Repo {
  return false;
}


// TODO: Exercise 5
// POST a JSON body to https://httpbin.org/post and print the response.
// Set Content-Type: application/json.
// Then try it WITHOUT that header and note the difference.
async function exercise5(): Promise<void> {
}


// TODO: Exercise 6
// Write fetchWithTimeout using AbortController, then call it against
// https://httpbin.org/delay/10 with a 2000ms timeout.
// Catch the AbortError specifically.
// Don't forget clearTimeout in a finally block.
export async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  throw new Error("TODO");
}


// TODO: Exercise 7
// Fetch https://api.github.com/rate_limit and print the remaining requests
// from the response HEADERS (not the body).
async function exercise7(): Promise<void> {
}


// TODO: Exercise 8
// Wrap a failing fetch so the original error survives as `cause`.
// Prove it by printing err.cause.
// Never hardcode a token: read it from process.env and throw if it is missing.
async function exercise8(): Promise<void> {
}
