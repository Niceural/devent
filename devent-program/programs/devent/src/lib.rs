//! # devent
//! A decentralized event management and ticketing application.

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token};
use std::mem::size_of;

declare_id!("59sCeP718NpdHv3Xj6kjgrmGNEt67BNXFcy5VUBUDhJE");

const METADATA_URL_LENGTH: usize = 255;

#[program]
pub mod devent {
    use super::*;

    /// Initializes the state of the program. 
    /// This function must be called before any event is created.
    /// It is used to give an event index different for each index.
    /// An event will then be referenced to with this index.
    pub fn create_state(
        ctx: Context<CreateState>,
    ) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.authority = ctx.accounts.authority.key();
        state.event_count = 0; // used to assign to EventAccount.index
        Ok(())
    }

    /// Creates a new event.
    /// @param metadata_url URL pointing to the metadata of the event.
    /// @param registration_limit Maximum number of Pubkeys allowed to register.
    /// @param min_lamports_price Minimum ticket price in lamports. 
    pub fn create_event(
        ctx: Context<CreateEvent>,
        metadata_url: String,
        registration_limit: u64,
        min_lamports_price: u64,
    ) -> Result<()> {
        // throws an exception if metadata_url contains over 255 characters
        if METADATA_URL_LENGTH < metadata_url.len() {
            return Err(ErrorCode::InvalidUrl.into());
        }
        // get state
        let state = &mut ctx.accounts.state;
        // get event
        let event = &mut ctx.accounts.event;
        // assign and increment event index
        event.index = state.event_count;
        state.event_count += 1; // increments variable used for event index
        // assign values to event
        event.authority = ctx.accounts.authority.key();
        event.metadata_url = metadata_url;
        event.registration_limit = registration_limit;
        event.registration_count = 0;
        event.min_lamports_price = min_lamports_price;

        Ok(())
    }

    pub fn attendee_registers(
        ctx: Context<AttendeeRegisters>,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;
        if event.registration_count > event.registration_limit {
            return Err(ErrorCode::MaxCapacity.into())
        }

        let registration = &mut ctx.accounts.registration;
        registration.authority = ctx.accounts.authority.key();
        registration.status = Status::Registered;
        registration.index = event.registration_count;

        event.registration_count += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateState<'info> {
    // authenticating state account
    #[account(
        init,
        seeds = [b"state".as_ref()],
        bump,
        payer = authority,
        space = StateAccount::LEN + 8,
    )]
    pub state: Account<'info, StateAccount>,
    // authority (signer who paid transaction fee)
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: System program
    pub system_program: UncheckedAccount<'info>,
    // Token program (no clue what it is)
    #[account(constraint = token_program.key == &token::ID)]
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CreateEvent<'info> {
    // authenticate state account
    #[account(
        mut,
        seeds = [b"state".as_ref()],
        bump,
    )]
    pub state: Account<'info, StateAccount>,
    // authenticate event account
    #[account(
        init,
        seeds = [b"event".as_ref(), state.event_count.to_be_bytes().as_ref()],
        bump,
        payer = authority,
        space = EventAccount::LEN,
    )]
    pub event: Account<'info, EventAccount>,
    // authority (signer who pays transaction fee)
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: System program
    pub system_program: UncheckedAccount<'info>,
    #[account(constraint = token_program.key == &token::ID)]
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AttendeeRegisters<'info> {
    #[account(
        mut,
        seeds = [b"event".as_ref(), event.index.to_be_bytes().as_ref()],
        bump
    )]
    pub event: Account<'info, EventAccount>,

    #[account(
        init,
        seeds = [b"registration".as_ref(), event.index.to_be_bytes().as_ref(), event.registration_count.to_be_bytes().as_ref()],
        bump,
        payer = authority,
        space = RegistrationAccount::LEN,
    )]
    pub registration: Account<'info, RegistrationAccount>,

    // Authority (signer who paid transaction fee)
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: System program
    pub system_program: UncheckedAccount<'info>,

    // Token program
    #[account(constraint = token_program.key == &token::ID)]
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct StateAccount {
    pub authority: Pubkey, // signer address
    pub event_count: u64, // number of events
}

impl StateAccount {
    const LEN: usize = 32 + 64;
}

#[account]
pub struct EventAccount {
    pub authority: Pubkey, // event organizer
    pub index: u64, // given by the StateAccount
    pub metadata_url: String, // event metadata url
    pub registration_limit: u64, // maximum number of Pubkeys allowed to register
    pub registration_count: u64, // amount of Pubkeys currently registered
    pub min_lamports_price: u64, // minimum registration price in lamports
}

impl EventAccount {
    const LEN: usize = 32 + 64 + 64 + 64 + 64 + METADATA_URL_LENGTH;
}

#[account]
pub struct RegistrationAccount {
    pub authority: Pubkey,
    pub index: u64,
    pub status: Status,
}

impl RegistrationAccount {
    const LEN: usize = 32 + 64 + size_of::<Status>();
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub enum Status {
    NotRegistered,
    Registered,
    AttendanceVerified,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Event at maximum capacity")]
    MaxCapacity,
    #[msg("Metadata URL is too long")]
    InvalidUrl,
}