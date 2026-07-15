#![cfg(test)]

use soroban_sdk::testutils::{Address as _, Ledger};
use soroban_sdk::{token, Address, Env, String};

use crate::{Vault, VaultClient};

fn setup(env: &Env) -> (Address, token::Client<'static>, token::StellarAssetClient<'static>) {
    let admin = Address::generate(env);
    let sac = env.register_stellar_asset_contract_v2(admin);
    let token_address = sac.address();
    let token_client = token::Client::new(env, &token_address);
    let asset_client = token::StellarAssetClient::new(env, &token_address);
    (token_address, token_client, asset_client)
}

fn setup_vault(env: &Env) -> Address {
    env.register(Vault, ())
}

#[test]
fn test_deposit_locks_funds() {
    let env = Env::default();
    env.mock_all_auths();

    let (token_addr, token_client, asset_client) = setup(&env);
    let vault_addr = setup_vault(&env);
    let vault = VaultClient::new(&env, &vault_addr);

    let owner = Address::generate(&env);
    asset_client.mint(&owner, &1_000_000);

    let unlock_at = env.ledger().timestamp() + 100;
    let id = vault.deposit(
        &owner,
        &owner,
        &token_addr,
        &500_000,
        &unlock_at,
        &String::from_str(&env, "Demo lock"),
    );

    assert_eq!(token_client.balance(&vault_addr), 500_000);
    assert_eq!(token_client.balance(&owner), 500_000);

    let lock = vault.get_lock(&id);
    assert_eq!(lock.amount, 500_000);
    assert_eq!(lock.owner, owner);
    assert_eq!(lock.unlock_at, unlock_at);
}

#[test]
#[should_panic(expected = "still locked")]
fn test_withdraw_before_unlock_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let (token_addr, _token_client, asset_client) = setup(&env);
    let vault_addr = setup_vault(&env);
    let vault = VaultClient::new(&env, &vault_addr);

    let owner = Address::generate(&env);
    asset_client.mint(&owner, &1_000_000);

    let unlock_at = env.ledger().timestamp() + 100;
    let id = vault.deposit(
        &owner,
        &owner,
        &token_addr,
        &500_000,
        &unlock_at,
        &String::from_str(&env, "Demo lock"),
    );

    vault.withdraw(&id);
}

#[test]
fn test_withdraw_after_unlock_pays_exact_amount() {
    let env = Env::default();
    env.mock_all_auths();

    let (token_addr, token_client, asset_client) = setup(&env);
    let vault_addr = setup_vault(&env);
    let vault = VaultClient::new(&env, &vault_addr);

    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    asset_client.mint(&owner, &1_000_000);

    let start = env.ledger().timestamp();
    let unlock_at = start + 100;
    let id = vault.deposit(
        &owner,
        &recipient,
        &token_addr,
        &500_000,
        &unlock_at,
        &String::from_str(&env, "Demo lock"),
    );

    env.ledger().set_timestamp(unlock_at + 1);

    let recipient_before = token_client.balance(&recipient);
    vault.withdraw(&id);
    let recipient_after = token_client.balance(&recipient);

    assert_eq!(recipient_after - recipient_before, 500_000);
    assert_eq!(token_client.balance(&vault_addr), 0);

    let lock = vault.get_lock(&id);
    assert_eq!(lock.status, crate::LockStatus::Withdrawn);
}

#[test]
#[should_panic]
fn test_withdraw_wrong_address_fails() {
    let env = Env::default();

    let (token_addr, _token_client, asset_client) = setup(&env);
    let vault_addr = setup_vault(&env);
    let vault = VaultClient::new(&env, &vault_addr);

    let owner = Address::generate(&env);
    let recipient = Address::generate(&env);
    let attacker = Address::generate(&env);

    env.mock_all_auths();
    asset_client.mint(&owner, &1_000_000);

    let unlock_at = env.ledger().timestamp() + 100;
    let id = vault.deposit(
        &owner,
        &recipient,
        &token_addr,
        &500_000,
        &unlock_at,
        &String::from_str(&env, "Demo lock"),
    );

    env.ledger().set_timestamp(unlock_at + 1);

    // Simulate the attacker's own auth context only; recipient never signs.
    env.set_auths(&[]);
    let _ = attacker;
    vault.withdraw(&id);
}

#[test]
#[should_panic(expected = "already withdrawn")]
fn test_double_withdraw_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let (token_addr, _token_client, asset_client) = setup(&env);
    let vault_addr = setup_vault(&env);
    let vault = VaultClient::new(&env, &vault_addr);

    let owner = Address::generate(&env);
    asset_client.mint(&owner, &1_000_000);

    let unlock_at = env.ledger().timestamp() + 100;
    let id = vault.deposit(
        &owner,
        &owner,
        &token_addr,
        &500_000,
        &unlock_at,
        &String::from_str(&env, "Demo lock"),
    );

    env.ledger().set_timestamp(unlock_at + 1);
    vault.withdraw(&id);
    vault.withdraw(&id);
}

#[test]
#[should_panic(expected = "amount must be positive")]
fn test_deposit_validation_zero_amount() {
    let env = Env::default();
    env.mock_all_auths();

    let (token_addr, _token_client, _asset_client) = setup(&env);
    let vault_addr = setup_vault(&env);
    let vault = VaultClient::new(&env, &vault_addr);

    let owner = Address::generate(&env);
    let unlock_at = env.ledger().timestamp() + 100;
    vault.deposit(
        &owner,
        &owner,
        &token_addr,
        &0,
        &unlock_at,
        &String::from_str(&env, "Demo lock"),
    );
}

#[test]
#[should_panic(expected = "unlock_at must be in the future")]
fn test_deposit_validation_past_unlock() {
    let env = Env::default();
    env.mock_all_auths();

    let (token_addr, _token_client, asset_client) = setup(&env);
    let vault_addr = setup_vault(&env);
    let vault = VaultClient::new(&env, &vault_addr);

    let owner = Address::generate(&env);
    asset_client.mint(&owner, &1_000_000);

    let now = env.ledger().timestamp();
    vault.deposit(
        &owner,
        &owner,
        &token_addr,
        &500_000,
        &now,
        &String::from_str(&env, "Demo lock"),
    );
}

#[test]
fn test_time_remaining() {
    let env = Env::default();
    env.mock_all_auths();

    let (token_addr, _token_client, asset_client) = setup(&env);
    let vault_addr = setup_vault(&env);
    let vault = VaultClient::new(&env, &vault_addr);

    let owner = Address::generate(&env);
    asset_client.mint(&owner, &1_000_000);

    let start = env.ledger().timestamp();
    let unlock_at = start + 100;
    let id = vault.deposit(
        &owner,
        &owner,
        &token_addr,
        &500_000,
        &unlock_at,
        &String::from_str(&env, "Demo lock"),
    );

    assert_eq!(vault.time_remaining(&id), 100);

    env.ledger().set_timestamp(unlock_at + 1);
    assert_eq!(vault.time_remaining(&id), 0);

    vault.withdraw(&id);
    assert_eq!(vault.time_remaining(&id), 0);
}
