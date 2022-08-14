use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Token};
use std::mem::size_of;
use crate::event::EventAccount;

pub fn create_registration(
    ctx: Context<CreateRegistration>,
) -> Result<()> {
    // get accounts
    let event = &mut ctx.accounts.event;
    let registration = &mut ctx.accounts.registration;

    // transfer lamports
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.attendee.key(),
        &ctx.accounts.organizer.key(),
        event.registration_price,
    );
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.attendee.to_account_info(),
            ctx.accounts.organizer.to_account_info(),
        ],
    )?;

    // set RegistrationAccount data
    registration.event = event.index;
    registration.attendee = ctx.accounts.attendee.key();
    registration.status = Status::Registered;
    registration.index = event.registration_count;
    event.registration_count += 1;

    Ok(())
}

/*
pub fn update_registration(
    ctx: Context<UpdateRegistration>,
    price: u64,
) -> Result<()> {
    // getting accounts
    // let event = &ctx.accounts.event;
    let registration = &mut ctx.accounts.registration;

    // **ctx.accounts.buyer.try_borrow_mut_lamports()? -= price;
    // **ctx.accounts.seller.try_borrow_mut_lamports()? += price;

    /*
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
    */

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
*/

#[derive(Accounts)]
pub struct CreateRegistration<'info> {
    // authenticate event account
    #[account(
        mut,
        seeds = [b"event".as_ref(), event.index.to_be_bytes().as_ref()],
        bump,
        constraint = !event.paused || event.registration_count < event.max_registration,
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
        payer = attendee,
        space = size_of::<RegistrationAccount>() + 8,
    )]
    pub registration: Account<'info, RegistrationAccount>,

    // ticket purchaser (signer who paid transaction fee)
    #[account(mut)]
    pub attendee: Signer<'info>,

    // event organizer who created the event
    #[account(constraint = organizer.key == &event.organizer)]
    pub organizer: Signer<'info>,

    pub system_program: Program<'info, System>,

    // Token program
    // #[account(constraint = token_program.key == &token::ID)]
    // pub token_program: Program<'info, Token>,
}

/*
#[derive(Accounts)]
pub struct UpdateRegistration<'info> {
    // authenticate event account
    #[account(
        mut,
        seeds = [b"event".as_ref(), event.index.to_be_bytes().as_ref()],
        bump
    )]
    pub event: Account<'info, EventAccount>,

    // authenticate registration account
    #[account(
        mut,
        seeds = [
            b"registration".as_ref(),
            event.index.to_be_bytes().as_ref(),
            registration.index.to_be_bytes().as_ref()
        ],
        bump,
    )]
    pub registration: Account<'info, RegistrationAccount>,

    // ticket receiver
    #[account(mut)]
    pub buyer: Signer<'info>,

    // ticket seller
    /// CHECK : 
    #[account(mut)]
    pub seller: AccountInfo<'info>,

    pub system_program: Program<'info, System>,

    // Token program
    // #[account(constraint = token_program.key == &token::ID)]
    // pub token_program: Program<'info, Token>,
}
*/

#[account]
pub struct RegistrationAccount {
    pub event: u64,
    pub attendee: Pubkey,
    pub index: u64,
    pub status: Status,
}

// impl RegistrationAccount {
//     const LEN: usize = 32 + 32 + 8 + size_of::<Status>() + 8;
// }

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub enum Status {
    NotRegistered,
    Registered,
    AttendanceConfirmed,
}
