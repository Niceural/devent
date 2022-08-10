//! # devent
//! A decentralized event management and ticketing application.

use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Token};
use std::mem::size_of;

declare_id!("59sCeP718NpdHv3Xj6kjgrmGNEt67BNXFcy5VUBUDhJE");

pub mod state; use state::*;
pub mod event; use event::*;
pub mod registration; use registration::*;
pub mod error; use error::*;
// pub mod mint_nft; use mint_nft::*;

#[program]
pub mod devent {
    use super::*;

    /// Initializes the state of the program. 
    /// The program state must be created before any event is created.
    /// It is used to give a unique event index for each event.
    /// An event will then be referenced to using this index.
    pub fn create_state(
        ctx: Context<CreateState>,
    ) -> Result<()> {
        state::create_state(ctx)
    }

    /// Creates a new event.
    pub fn create_event(
        ctx: Context<CreateEvent>,
        max_registration: u64,
        registration_price: u64,
        resell_allowed: bool,
        max_resell_price: u64,
        mint_nft_on_registration: bool,
        mint_nft_on_attendance: bool,
        paused: bool,
    ) -> Result<()> {
        event::create_event(ctx, max_registration, registration_price, resell_allowed, max_resell_price,
        mint_nft_on_registration, mint_nft_on_attendance, paused)
    }

    /// Register a Pubkey to an event
    pub fn create_registration(
        ctx: Context<CreateRegistration>,
    ) -> Result<()> {
        registration::create_registration(ctx)
    }

    pub fn update_registration(
        ctx: Context<UpdateRegistration>,
        price: u64,
    ) -> Result<()> {
        registration::update_registration(ctx, price)
    }
}
