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
    // throws if inputs not of the correct size

    // get state
    let state = &mut ctx.accounts.state;

    // get event
    let event = &mut ctx.accounts.event;

    // assign and increment event index
    event.index = state.event_count;
    state.event_count += 1; // increments variable used for event index

    // assign values to event
    event.authority = ctx.accounts.authority.key();
    event.max_registration = max_registration;
    event.registration_count = 0;
    event.lamports_price = lamports_price;

    // event data
    event.title = title;
    event.organizer = organizer;
    event.description = description;
    event.image_url = image_url;
    event.location = location;
    event.start_date = start_date;
    event.start_time = start_time;
    event.end_date = end_date;
    event.end_time = end_time;

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
    pub lamports_price: u64, // minimum registration price in lamports

    // event data
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
