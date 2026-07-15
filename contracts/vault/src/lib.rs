#![no_std]
use soroban_sdk::{contract, contractimpl, token, Address, Env, String, Vec};

mod events;
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

        events::deposit(&env, id, owner, recipient, amount, unlock_at);

        id
    }

    pub fn withdraw(env: Env, id: u64) {
        let mut lock = storage::get_lock(&env, id);
        lock.recipient.require_auth();

        if lock.status != LockStatus::Locked {
            panic!("already withdrawn");
        }
        let now = env.ledger().timestamp();
        if now < lock.unlock_at {
            panic!("still locked");
        }

        let token_client = token::Client::new(&env, &lock.token);
        token_client.transfer(
            &env.current_contract_address(),
            &lock.recipient,
            &lock.amount,
        );

        lock.status = LockStatus::Withdrawn;
        storage::set_lock(&env, id, &lock);

        events::withdraw(&env, id, lock.recipient, lock.amount);
    }

    pub fn get_lock(env: Env, id: u64) -> Lock {
        storage::get_lock(&env, id)
    }

    pub fn get_locks_for(env: Env, who: Address) -> Vec<u64> {
        storage::get_owner_locks(&env, &who)
    }

    pub fn time_remaining(env: Env, id: u64) -> u64 {
        let lock = storage::get_lock(&env, id);
        if lock.status != LockStatus::Locked {
            return 0;
        }
        let now = env.ledger().timestamp();
        if now >= lock.unlock_at {
            0
        } else {
            lock.unlock_at - now
        }
    }

    pub fn get_lock_count(env: Env) -> u64 {
        storage::get_next_id(&env)
    }
}

#[cfg(test)]
mod test;
