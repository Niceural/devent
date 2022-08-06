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
    /// It declares a variable used to create an event.
    pub fn create_state(
        ctx: Context<CreateState>,
    ) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.authority = ctx.accounts.authority.key();
        state.event_count = 0;
        Ok(())
    }

    pub fn create_event(
        ctx: Context<CreateEvent>,
        metadata_url: String,
        max_attendees: u64,
        min_price: u64,
    ) -> Result<()> {
        if METADATA_URL_LENGTH < metadata_url.len() {
            return Err(ErrorCode::InvalidUrl.into());
        }

        // get state
        let state = &mut ctx.accounts.state;
        // get event
        let event = &mut ctx.accounts.event;
        event.authority = ctx.accounts.authority.key();
        event.metadata_url = metadata_url;
        event.registration_limit = max_attendees;
        event.amount_registered = 0;
        event.min_lamports_price = min_price;
        event.index = state.event_count;

        state.event_count += 1;
        Ok(())
    }

    pub fn attendee_registers(
        ctx: Context<AttendeeRegisters>,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;
        if event.amount_registered > event.registration_limit {
            return Err(ErrorCode::MaxCapacity.into())
        }

        let registration = &mut ctx.accounts.registration;
        registration.authority = ctx.accounts.authority.key();
        registration.status = Status::Registered;
        registration.index = event.amount_registered;

        event.amount_registered += 1;
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
        seeds = [b"registration".as_ref(), event.index.to_be_bytes().as_ref(), event.amount_registered.to_be_bytes().as_ref()],
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
    pub amount_registered: u64, // amount of Pubkeys currently registered
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