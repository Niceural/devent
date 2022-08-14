use anchor_lang::prelude::*;

pub mod collection_nft; use collection_nft::*;
pub mod regular_nft; use regular_nft::*;
pub mod sell; use sell::*;

declare_id!("8sLvi7QKCyEyc7VtSGvGU1Vwos5GwmJ8q9wSRcNHhWNS");

#[program]
pub mod devent {
    use super::*;

    pub fn mint_collection_nft(
        ctx: Context<MintCollectionNft>,
        name: String,
        symbol: String,
        uri: String
    ) -> Result<()> {
        collection_nft::mint_collection_nft(ctx, name, symbol, uri)
    }

    pub fn mint_regular_nft(
        ctx: Context<MintRegularNft>,
        name: String,
        symbol: String,
        uri: String
    ) -> Result<()> {
        regular_nft::mint_regular_nft(ctx, name, symbol, uri)
    }

    pub fn sell_nft(
        ctx: Context<SellNft>,
        price_lamports: u64,
    ) -> Result<()> {
        sell::sell_nft(ctx, price_lamports)
    }
}
