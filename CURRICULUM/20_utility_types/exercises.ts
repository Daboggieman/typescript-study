// Exercise 20: Utility Types
// Run this file with: npm run ex CURRICULUM/20_utility_types/exercises.ts
// Typecheck with:    npm run check
//
// Exercises that ask you to trigger a TYPE ERROR keep those lines commented
// out, so `npm run check` stays clean on a fresh clone. Uncomment one at a
// time, run `npm run check`, read the error, then comment it back.
//
// The theme of this file: DERIVE types, do not duplicate them.


export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

const ada: User = {
  id: "u1",
  name: "Ada",
  email: "ada@example.com",
  createdAt: new Date("1815-12-10"),
};


// TODO: Exercise 1
// `Partial<User>` — an update payload where any subset of fields is fine.
// Uncomment the typo'd key and note that it is still caught.
export function updateUser(id: string, changes: Partial<User>): string {
  return id;
}

updateUser("u1", { name: "Grace" });
updateUser("u1", { email: "g@example.com" });
// updateUser("u1", { nmae: "Grace" });


// TODO: Exercise 2
// `Required<Config>` — the inverse. Uncomment the incomplete object.
export interface Config {
  host?: string;
  port?: number;
}

export type FullConfig = Required<Config>;

const full: FullConfig = { host: "localhost", port: 8080 };
// const incomplete: FullConfig = { host: "localhost" };


// TODO: Exercise 3
// `Readonly<User>` — try the assignment, then prove that a nested array is
// still mutable. Shallow is the word that matters.
export type FrozenUser = Readonly<User>;

const frozen: FrozenUser = ada;
// frozen.name = "Grace";

export type ReadonlyTeam = Readonly<{ name: string; members: User[] }>;
const team: ReadonlyTeam = { name: "Core", members: [] };
team.members.push(ada);          // FINE — readonly is shallow
// team.name = "Other";


// TODO: Exercise 4
// `Omit<User, "id">` — the record BEFORE it has an id.
// Note that this type is derived: add a field to User and NewUser follows.
export type NewUser = Omit<User, "id">;

export function createUser(input: NewUser): User {
  return { ...input, id: "generated" };
}

createUser({ name: "Ada", email: "a@example.com", createdAt: new Date() });
// createUser({ id: "u1", name: "Ada", email: "a@example.com", createdAt: new Date() });


// TODO: Exercise 5
// `Pick<User, "id" | "name">` — keep only what a preview needs.
export type UserPreview = Pick<User, "id" | "name">;


// TODO: Exercise 6
// `Record<Status, number>` demands EXACTLY those three keys.
// Uncomment the object missing `done` and compare the error with what an
// index signature would have allowed.
export type Status = "pending" | "active" | "done";

export type StatusCounts = Record<Status, number>;

const counts: StatusCounts = { pending: 1, active: 2, done: 3 };
// const missing: StatusCounts = { pending: 1, active: 2 };


// TODO: Exercise 7
// `Exclude` and `Extract` work on UNIONS, not objects. That is the
// distinction people mix up with Pick/Omit.
export type EventKind = "click" | "focus" | "blur";

export type NonClickEvent = Exclude<EventKind, "click">;    // TODO: should be "focus" | "blur"
export type ClickOnly = Extract<EventKind, "click">;        // TODO: should be "click"


// TODO: Exercise 8
// `NonNullable` on a union that includes both null and undefined.
export type MaybeUser = User | null | undefined;
export type DefiniteUser = NonNullable<MaybeUser>;          // User

export function orThrow(user: MaybeUser): DefiniteUser {
  if (user == null) throw new Error("no user");
  return user;                 // narrowed — no assertion needed
}


// TODO: Exercise 9
// `ReturnType` and `Parameters` read a function's type. Note the `typeof`:
// `ReturnType<createUser>` is an error, `ReturnType<typeof createUser>` is not.
export function makeUser(name: string, age: number): User {
  return { id: "u1", name, email: "", createdAt: new Date() };
}

export type MadeUser = ReturnType<typeof makeUser>;
export type MakeUserArgs = Parameters<typeof makeUser>;

// export type Broken = ReturnType<makeUser>;


// TODO: Exercise 10
// Derive a union from a VALUE. Without `as const` the array widens to
// string[] and the union collapses to `string`. Remove it and watch.
const STATUSES = ["pending", "active", "done"] as const;

export type StatusFromArray = (typeof STATUSES)[number];

const s: StatusFromArray = "active";
// const bad: StatusFromArray = "archived";


// TODO: Exercise 11
// The object version. `keyof typeof` gives the KEYS,
// `(typeof X)[keyof typeof X]` gives the VALUES.
const ROUTES = {
  home: "/",
  about: "/about",
  contact: "/contact",
} as const;

export type RouteName = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];


// TODO: Exercise 12
// `satisfies` versus an annotation versus `as`.
// `routesTyped.home` survives; `routesAnnotated.home` does not.
export type RouteTable = Record<string, { path: string; title: string }>;

const routesAnnotated: RouteTable = {
  home: { path: "/", title: "Home" },
};
// routesAnnotated.home;          // ERROR — the index signature swallowed the keys

const routesTyped = {
  home: { path: "/", title: "Home" },
} satisfies RouteTable;

routesTyped.home.path;            // fine
// routesTyped.hoem;              // ERROR — the keys are known


// TODO: Exercise 13
// `as const satisfies` — validated AND narrow. Uncomment the bad route and
// read the error; the value must start with a slash.
const PATHS = {
  home: "/",
  about: "/about",
} as const satisfies Record<string, `/${string}`>;

// const BAD_PATHS = { home: "no-slash" } as const satisfies Record<string, `/${string}`>;


// TODO: Exercise 14
// Compose them. Build an update payload that excludes both `id` and
// `createdAt`, and makes everything else optional.
export type UserUpdate = Partial<Omit<User, "id" | "createdAt">>;


// TODO: Exercise 15
// `sortBy` using `keyof`. The `String(...)` wrapper is there because `<`
// cannot be applied to two values of an unconstrained generic type.
export function sortBy<T, K extends keyof T>(items: T[], key: K): T[] {
  return [...items].sort((a, b) => (String(a[key]) < String(b[key]) ? -1 : 1));
}

console.log(sortBy([{ name: "Grace" }, { name: "Ada" }], "name"));
