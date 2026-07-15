#![no_std]
use soroban_sdk::{contract, contractimpl, token, Address, Env, String};

mod storage;
mod types;

pub use types::{Lock, LockStatus};

#[contract]
pub struct Vault;

#[contractimpl]
impl Vault {
    pub fn deposit(
        env: Env,
        owner: Address,
        recipient: Address,
        token: Address,
        amount: i128,
        unlock_at: u64,
        label: String,
    ) -> u64 {
        owner.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }
        let now = env.ledger().timestamp();
        if unlock_at <= now {
            panic!("unlock_at must be in the future");
        }
        if label.len() > 64 {
            panic!("label too long");
        }

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&owner, &env.current_contract_address(), &amount);

        let id = storage::get_next_id(&env);
        let lock = Lock {
            owner: owner.clone(),
            recipient: recipient.clone(),
            token,
            amount,
            created_at: now,
            unlock_at,
            status: LockStatus::Locked,
            label,
        };
        storage::set_lock(&env, id, &lock);
        storage::set_next_id(&env, id + 1);
        storage::add_owner_lock(&env, &owner, id);

        env.events().publish(
            (soroban_sdk::symbol_short!("vault"), soroban_sdk::symbol_short!("deposit")),
            (id, owner, recipient, amount, unlock_at),
        );

        id
    }
}

#[cfg(test)]
mod test;
