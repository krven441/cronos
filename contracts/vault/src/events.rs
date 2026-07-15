use soroban_sdk::{symbol_short, Address, Env};

pub fn deposit(env: &Env, id: u64, owner: Address, recipient: Address, amount: i128, unlock_at: u64) {
    env.events().publish(
        (symbol_short!("vault"), symbol_short!("deposit")),
        (id, owner, recipient, amount, unlock_at),
    );
}

pub fn withdraw(env: &Env, id: u64, recipient: Address, amount: i128) {
    env.events().publish(
        (symbol_short!("vault"), symbol_short!("withdraw")),
        (id, recipient, amount),
    );
}
