use anchor_lang::prelude::error_code;

#[error_code]
pub enum Error {
    #[msg("Event at maximum capacity")]
    MaxCapacity,
    #[msg("Metadata URL is too long")]
    InvalidUrl,
}