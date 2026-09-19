# Modules_dynamic_import

Source: modules_dynamic_import

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Using a dynamic `await import(...)`, write a function that dynamically imports a standard library module by name (given as a string) and returns the value of a named attribute from it. Return `null` if the module or attribute doesn't exist.

Expected function
```ts
async function get_module_attribute(module_name: string, attribute_name: string): Promise<unknown> {
  return null;
}
```


Here is a possible program to test your function :
```ts
console.log(await get_module_attribute("node:path", "sep"));
console.log(await get_module_attribute("node:path", "does_not_exist"));
console.log(await get_module_attribute("not_a_real_module", "pi"));
```

And its output :
```text
/
null
null
```
