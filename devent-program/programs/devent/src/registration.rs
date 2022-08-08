use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Token};
use std::mem::size_of;
use crate::event::EventAccount;
use crate::error::Error;

pub fn attendee_registers(
    ctx: Context<AttendeeRegisters>,
) -> Result<()> {
    // get event
    let event = &mut ctx.accounts.event;

    // check if there's some tickets left
    if event.max_registration <= event.registration_count {
        return Err(Error::MaxCapacity.into())
    }

    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.authority.to_account_info(),
                to: ctx.accounts.organizer.to_account_info(),
            }
        ),
        event.lamports_price,
    )?;

    // get registration
    let registration = &mut ctx.accounts.registration;
    registration.authority = ctx.accounts.authority.key();
    registration.status = Status::Registered;
    registration.index = event.registration_count;
    event.registration_count += 1;

    Ok(())
}

#[derive(Accounts)]
pub struct AttendeeRegisters<'info> {
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

#[account]
pub struct RegistrationAccount {
    pub authority: Pubkey,
    pub index: u64,
    pub status: Status,
}

impl RegistrationAccount {
    const LEN: usize = 32 + 8 + size_of::<Status>();
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub enum Status {
    NotRegistered,
    Registered,
    AttendanceVerified,
}
