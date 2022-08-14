use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Token};
use std::mem::size_of;
use crate::error::Error;
use crate::event::EventAccount;
use crate::registration::{RegistrationAccount, Status};

pub fn resell_ticket(
    ctx: Context<ResellTicket>,
    resell_price: u64,
) -> Result<()> {
    // getting accounts
    let event = &ctx.accounts.event;
    let registration = &mut ctx.accounts.registration;

    // check that event is not paused
    if event.paused {
        return Err(Error::EventPaused.into());
    }
    // check that organizer allowed reselling tickets
    if !event.resell_allowed {
        return Err(Error::ResellingNotAllowed.into());
    }
    // check that resell price matches allowed resell price
    if event.max_resell_price < resell_price {
        return Err(Error::InvalidResellPrice.into());
    }
    // check that the event has not been attended already
    if registration.status != Status::Registered {
        return Err(Error::InvalidStatus.into());
    }

    // transfer lamports
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.from.to_account_info(),
                to: ctx.accounts.to.to_account_info(),
            }
        ),
        resell_price,
    )?;

    // modify RegistrationAccount data
    registration.authority = ctx.accounts.to.key();

    Ok(())
}

#[derive(Accounts)]
pub struct ResellTicket<'info> {
    // authenticate event account
    #[account(
        seeds = [b"event".as_ref(), event.index.to_be_bytes().as_ref()],
        bump,
        constraint = event.key() == registration.event,
    )]
    pub event: Account<'info, EventAccount>,

    // authenticate registration account
    #[account(
        mut,
        seeds = [
            b"registration".as_ref(),
            event.index.to_be_bytes().as_ref(),
            event.registration_count.to_be_bytes().as_ref()
        ],
        bump,
        constraint = from.key == &registration.authority,
    )]
    pub registration: Account<'info, RegistrationAccount>,

    // ticket seller
    pub from: Signer<'info>,

    // ticket receiver
    pub to: Signer<'info>,

    /// CHECK: System program
    pub system_program: UncheckedAccount<'info>,

    // Token program
    #[account(constraint = token_program.key == &token::ID)]
    pub token_program: Program<'info, Token>,
}
