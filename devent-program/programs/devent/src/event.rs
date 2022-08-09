use anchor_lang::prelude::*;
// use anchor_lang::system_program;
use anchor_spl::token::{self, Token};
use crate::state::StateAccount;

// event data variable sizes
const TITLE_LENGTH: usize = 64;
const ORGANIZER_LENGTH: usize = 32;
const DESCRIPTION_LENGTH: usize = 255;
const IMAGE_URL_LENGTH: usize = 255;
const LOCATION_LENGTH: usize = 64;
const START_DATE_LENGTH: usize = 8;
const START_TIME_LENGTH: usize = 4;
const END_DATE_LENGTH: usize = 8;
const END_TIME_LENGTH: usize = 4;

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
    event_data: EventData,
) -> Result<()> {
    // throws if inputs not of the correct size

    // get accounts
    let state = &mut ctx.accounts.state;
    let event = &mut ctx.accounts.event;
    let authority = ctx.accounts.authority.key();

    // assign and increment event index
    event.index = state.event_count;
    state.event_count += 1; // increments variable used for event index

    // assign values to event
    event.authority = authority;
    event.max_registration = max_registration;
    event.registration_count = 0;
    event.registration_price = registration_price;
    event.resell_allowed = resell_allowed;
    event.max_resell_price = max_resell_price;
    event.mint_nft_on_registration = mint_nft_on_registration;
    event.mint_nft_on_attendance = mint_nft_on_attendance;
    event.paused = paused;
    event.event_data = event_data;

    Ok(())
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

#[account]
pub struct EventAccount {
    pub authority: Pubkey, // event organizer
    pub index: u64, // given by the StateAccount
    pub max_registration: u64, // maximum number of Pubkeys allowed to register
    pub registration_count: u64, // amount of Pubkeys currently registered
    pub registration_price: u64, // minimum registration price in lamports
    pub resell_allowed: bool, // set to true if pubkey registered is allowed to resell their ticket
    pub max_resell_price: u64, // maximum resell price
    pub mint_nft_on_registration: bool,
    pub mint_nft_on_attendance: bool,
    pub paused: bool, // if true, can't register, resell ticket, etc
    pub event_data: EventData, // event data
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct EventData {
    pub title: String,
    pub organizer: String,
    pub description: String,
    pub image_url: String,
    pub location: String,
    pub start_date: String,
    pub start_time: String,
    pub end_date: String,
    pub end_time: String,
}

impl EventAccount {
    const LEN: usize = 32 + 8 + 8 + 8 + 8 + 
        TITLE_LENGTH + ORGANIZER_LENGTH + DESCRIPTION_LENGTH + 
        IMAGE_URL_LENGTH + LOCATION_LENGTH + START_DATE_LENGTH + 
        START_TIME_LENGTH + END_DATE_LENGTH + END_TIME_LENGTH;

}
