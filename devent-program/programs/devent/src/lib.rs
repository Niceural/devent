//! # devent
//! A decentralized event management and ticketing application.

use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Token};
use std::mem::size_of;

declare_id!("59sCeP718NpdHv3Xj6kjgrmGNEt67BNXFcy5VUBUDhJE");

pub mod state;
pub mod event;
pub mod registration;
pub mod error;
pub mod mint_nft;
use state::*;
use event::*;
use registration::*;
use error::*;
use mint_nft::*;

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
        title: String,
        organizer: String,
        description: String,
        image_url: String,
        location: String,
        start_date: String,
        start_time: String,
        end_date: String,
        end_time: String,
        max_registration: u64,
        lamports_price: u64,
    ) -> Result<()> {
        event::create_event(ctx, title, organizer, description, image_url, location,
            start_date, start_time, end_date, end_time, max_registration, lamports_price)
    }
}
