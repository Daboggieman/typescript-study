# OOP Bank Account Self

Source: oop_bank_account_self

Files to submit
- solution.ts

Allowed functions
- --allow-builtin

Instructions
Define a `BankAccount` class with a constructor `(owner: string, balance: number = 0)`, `deposit(amount: number): number`, and `withdraw(amount: number): number | string` (withdraw should not go below 0 -- if there are insufficient funds, do not change the balance and instead return the string `"Insufficient funds"`; a successful withdraw or deposit should return the new balance).

Expected function
```ts
class BankAccount {
    constructor(owner: string, balance: number = 0) {
    }

    deposit(amount: number): number {
        return 0;
    }

    withdraw(amount: number): number | string {
        return 0;
    }
}
```


Here is a possible program to test your function :
```ts
const acc = new BankAccount("Alice", 100);
console.log(acc.deposit(50));
console.log(acc.withdraw(200));
console.log(acc.withdraw(30));
```

And its output :
```text
150
Insufficient funds
120
```