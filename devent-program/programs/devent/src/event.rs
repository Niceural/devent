use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token};
use std::mem::size_of;
use crate::state::StateAccount;

/// Creates a new event.
/// @param max_registration Maximum number of Pubkeys allowed to register
/// @param registration_price Ticket price in lamports
/// @param resell_allowed Set to true if the ticket can be resold
/// @param max_resell_price Maximum ticket resell price
/// @param mintNftOnRegistration If set to true, an nft will be minted on registration to this event
/// @param mintNftOnAttendance If set to true, an nft will be minted on attendance confirmation to the event
/// @param paused If set to true, can't register or resell
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
    // get accounts
    let state = &mut ctx.accounts.state;
    let event = &mut ctx.accounts.event;

    // assign and increment event index
    event.index = state.event_count;
    state.event_count += 1; // increments variable used for event index

    // assign values to event
    event.authority = ctx.accounts.authority.key();
    event.max_registration = max_registration;
    event.registration_count = 0;
    event.registration_price = registration_price;
    event.resell_allowed = resell_allowed;
    event.max_resell_price = max_resell_price;
    event.mint_nft_on_registration = mint_nft_on_registration;
    event.mint_nft_on_attendance = mint_nft_on_attendance;
    event.paused = paused;

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
        space = size_of::<EventAccount>() + 8,
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
}
