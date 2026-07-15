use soroban_sdk::{Address, Env, Vec};

use crate::types::{DataKey, Lock};

const PERSISTENT_BUMP: u32 = 120_960; // ~7 days at 5s ledgers
const PERSISTENT_THRESHOLD: u32 = 100_800; // ~5.83 days

pub fn get_next_id(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&DataKey::NextId)
        .unwrap_or(0u64)
}

pub fn set_next_id(env: &Env, id: u64) {
    env.storage().instance().set(&DataKey::NextId, &id);
}

pub fn set_lock(env: &Env, id: u64, lock: &Lock) {
    let key = DataKey::Lock(id);
    env.storage().persistent().set(&key, lock);
    env.storage()
        .persistent()
        .extend_ttl(&key, PERSISTENT_THRESHOLD, PERSISTENT_BUMP);
}

pub fn get_lock(env: &Env, id: u64) -> Lock {
    env.storage()
        .persistent()
        .get(&DataKey::Lock(id))
        .expect("lock not found")
}

pub fn has_lock(env: &Env, id: u64) -> bool {
    env.storage().persistent().has(&DataKey::Lock(id))
}

pub fn add_owner_lock(env: &Env, owner: &Address, id: u64) {
    let key = DataKey::OwnerLocks(owner.clone());
    let mut ids: Vec<u64> = env
        .storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Vec::new(env));
    ids.push_back(id);
    env.storage().persistent().set(&key, &ids);
    env.storage()
        .persistent()
        .extend_ttl(&key, PERSISTENT_THRESHOLD, PERSISTENT_BUMP);
}

pub fn get_owner_locks(env: &Env, owner: &Address) -> Vec<u64> {
    env.storage()
        .persistent()
        .get(&DataKey::OwnerLocks(owner.clone()))
        .unwrap_or_else(|| Vec::new(env))
}
