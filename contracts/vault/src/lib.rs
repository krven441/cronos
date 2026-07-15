#![no_std]
use soroban_sdk::{contract, contractimpl, Env};

mod storage;
mod types;

pub use types::{Lock, LockStatus};

#[contract]
pub struct Vault;

#[contractimpl]
impl Vault {
    pub fn ping(_env: Env) -> u32 {
        1
    }
}

#[cfg(test)]
mod test;
