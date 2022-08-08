use anchor_lang::prelude::*;
// use anchor_lang::system_program;
use anchor_spl::token::{self, Token};

/// Initializes the state of the program. 
/// The program state must be created before any event is created.
/// It is used to give a unique event index to each event.
/// An event will then be referenced to using this index.
pub fn create_state(
    ctx: Context<CreateState>,
) -> Result<()> {
    // get state
    let state = &mut ctx.accounts.state;

    // assign to state variables
    state.authority = ctx.accounts.authority.key();
    state.event_count = 0; // used to assign to event index
    
    Ok(())
}

#[derive(Accounts)]
pub struct CreateState<'info> {
    // authenticating state account
    #[account(
        init,
        seeds = [b"state".as_ref()],
        bump,
        payer = authority,
        space = StateAccount::LEN,
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

#[account]
pub struct StateAccount {
    pub authority: Pubkey, // signer address
    pub event_count: u64, // used to assign to event index
}

impl StateAccount {
    // size of StateAccount in bytes
    const LEN: usize = 32 + 8;
}