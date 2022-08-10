use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Token};
use std::mem::size_of;
use crate::event::EventAccount;
use crate::error::Error;

pub fn create_registration(
    ctx: Context<CreateRegistration>,
) -> Result<()> {
    // get accounts
    let event = &mut ctx.accounts.event;
    let registration = &mut ctx.accounts.registration;

    // check if the event is paused
    if event.paused {
        return Err(Error::EventPaused.into());
    }
    // check if there's some tickets left
    if event.max_registration <= event.registration_count {
        return Err(Error::MaxCapacity.into())
    }

    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.authority.key(),
        &ctx.accounts.organizer.key(),
        event.registration_price,
    );
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.organizer.to_account_info(),
        ],
    )?;

    // set RegistrationAccount data
    registration.event = event.key();
    registration.authority = ctx.accounts.authority.key();
    registration.status = Status::Registered;
    registration.index = event.registration_count;
    event.registration_count += 1;

    Ok(())
}

pub fn update_registration(
    ctx: Context<UpdateRegistration>,
    price: u64,
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
    if event.max_resell_price < price {
        return Err(Error::InvalidResellPrice.into());
    }
    // check that the event has not been attended already
    if registration.status != Status::Registered {
        return Err(Error::InvalidStatus.into());
    }

    // transfer lamports
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.buyer.key(),
        &ctx.accounts.seller.key(),
        price,
    );
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.buyer.to_account_info(),
            ctx.accounts.seller.to_account_info(),
        ],
    )?;

    // modify RegistrationAccount data
    registration.authority = ctx.accounts.buyer.key();

    Ok(())
}

#[derive(Accounts)]
pub struct CreateRegistration<'info> {
    // authenticate event account
    #[account(
        mut,
        seeds = [b"event".as_ref(), event.index.to_be_bytes().as_ref()],
        bump
    )]
    pub event: Account<'info, EventAccount>,

    // authenticate registration account
    #[account(
        init,
        seeds = [
            b"registration".as_ref(),
            event.index.to_be_bytes().as_ref(),
            event.registration_count.to_be_bytes().as_ref()
        ],
        bump,
        payer = authority,
        space = RegistrationAccount::LEN,
    )]
    pub registration: Account<'info, RegistrationAccount>,

    // Authority (signer who paid transaction fee)
    #[account(mut)]
    pub authority: Signer<'info>,

    // event organizer who created the event
    #[account(constraint = organizer.key == &event.authority)]
    pub organizer: Signer<'info>,

    /// CHECK: System program
    pub system_program: UncheckedAccount<'info>,

    // Token program
    #[account(constraint = token_program.key == &token::ID)]
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateRegistration<'info> {
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
        constraint = seller.key == &registration.authority,
    )]
    pub registration: Account<'info, RegistrationAccount>,

    // ticket seller
    pub seller: Signer<'info>,

    // ticket receiver
    pub buyer: Signer<'info>,

    /// CHECK: System program
    pub system_program: UncheckedAccount<'info>,

    // Token program
    #[account(constraint = token_program.key == &token::ID)]
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct RegistrationAccount {
    pub event: Pubkey,
    pub authority: Pubkey,
    pub index: u64,
    pub status: Status,
}

impl RegistrationAccount {
    const LEN: usize = 32 + 32 + 8 + size_of::<Status>() + 8;
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub enum Status {
    NotRegistered,
    Registered,
    AttendanceConfirmed,
}
