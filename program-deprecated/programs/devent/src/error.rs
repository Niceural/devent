use anchor_lang::prelude::error_code;

#[error_code]
pub enum Error {
    // state
    // event
    // registration
    #[msg("Event was paused by the organizer")]
    EventPaused,
    #[msg("Event at maximum capacity")]
    MaxCapacity,
    #[msg("Reselling tickets is not allowed by the organizer")]
    ResellingNotAllowed,
    #[msg("Resell price is above the limit set by the organizer")]
    InvalidResellPrice,
    #[msg("Registration status is not registered")]
    InvalidStatus,
}