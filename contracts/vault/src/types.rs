use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum LockStatus {
    Locked,
    Withdrawn,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Lock {
    pub owner: Address,
    pub recipient: Address,
    pub token: Address,
    pub amount: i128,
    pub created_at: u64,
    pub unlock_at: u64,
    pub status: LockStatus,
    pub label: String,
}

#[contracttype]
pub enum DataKey {
    Lock(u64),
    NextId,
    OwnerLocks(Address),
}
