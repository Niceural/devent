use {
    anchor_lang::{
        prelude::*,
        solana_program::program::invoke,
        system_program,
    },
    anchor_spl::{
        associated_token,
        token,
    },
    mpl_token_metadata::{
        ID as TOKEN_METADATA_ID,
        instruction as token_instruction,
        state::CollectionDetails,
        state::Metadata,
        state::MasterEditionV2,
        state::CollectionAuthorityRecord,
    },
};

/// Mints a Collection NFT.
/// A Collection NFT has the CollectionDetails field of its Metadata Account set.
pub fn mint_regular_nft(
    ctx: Context<MintRegularNft>, 
    name: String, 
    symbol: String, 
    uri: String,
) -> Result<()> {

    // creating Mint Account
    // msg!("Creating mint account...");
    // msg!("Mint: {}", &ctx.accounts.mint.key());
    system_program::create_account(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(), // token program Account
            system_program::CreateAccount {
                from: ctx.accounts.mint_authority.to_account_info(), // the wallet is paying
                to: ctx.accounts.mint.to_account_info(), // creating the Mint account
            },
        ),
        100000000, // 0.1 SOL, amount of lamports to transfer to the Mint Account
        82,
        &ctx.accounts.token_program.key(), // token program is the owner of the Mint account
    )?;

    // initializing Mint account
    // msg!("Initializing mint account...");
    // msg!("Mint: {}", &ctx.accounts.mint.key());
    token::initialize_mint(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::InitializeMint {
                mint: ctx.accounts.mint.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ),
        0,
        &ctx.accounts.mint_authority.key(),
        Some(&ctx.accounts.mint_authority.key()), // freeze authority, maybe set it to the organizer
    )?;

    // create Token Account...
    // msg!("Creating token account...");
    // msg!("Token Address: {}", &ctx.accounts.token_account.key());    
    associated_token::create(
        CpiContext::new(
            ctx.accounts.associated_token_program.to_account_info(),
            associated_token::Create {
                payer: ctx.accounts.mint_authority.to_account_info(),
                associated_token: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ),
    )?;

    // mint 1 token to Token account
    // msg!("Minting token to token account...");
    // msg!("Mint: {}", &ctx.accounts.mint.to_account_info().key());   
    // msg!("Token Address: {}", &ctx.accounts.token_account.key());     
    token::mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            },
        ),
        1,
    )?;

    // create metadata Account...
    // msg!("Creating metadata account...");
    // msg!("Metadata account address: {}", &ctx.accounts.metadata.to_account_info().key());
    invoke(
        &token_instruction::create_metadata_accounts_v3(
            TOKEN_METADATA_ID, 
            ctx.accounts.metadata.key(), 
            ctx.accounts.mint.key(), 
            ctx.accounts.mint_authority.key(), 
            ctx.accounts.mint_authority.key(), 
            ctx.accounts.mint_authority.key(),
            name, 
            symbol, 
            uri, 
            None,
            1, // u16, Royalty basis points that goes to creators in secondary sales (0-10000)
            true, 
            false, // Whether you want your metadata to be updateable in the future.
            // As such, the Collection field contains two nested fields:
            // Key: This field points to the Collection NFT the NFT belongs to. More precisely, it points to the public key of the Mint Account of the Collection NFT. This Mint Account must be owned by the SPL Token program.
            // Verified: This boolean is very important as it is used to verify that the NFT is truly part of the collection it points to. More on that below.
            None,
            None,
            // if set to None, regular NFT, else Collection NFT
            // gives info on size of the collection
            Some(CollectionDetails::V1 { size: 0 }),
        ),
        &[
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
    )?;

    msg!("Creating master edition metadata account...");
    msg!("Master edition metadata account address: {}", &ctx.accounts.master_edition.to_account_info().key());
    invoke(
        &token_instruction::create_master_edition_v3(
            TOKEN_METADATA_ID, 
            ctx.accounts.master_edition.key(), 
            ctx.accounts.mint.key(), 
            ctx.accounts.mint_authority.key(), 
            ctx.accounts.mint_authority.key(), 
            ctx.accounts.metadata.key(), 
            ctx.accounts.mint_authority.key(), 
            Some(0),
        ),
        &[
            ctx.accounts.master_edition.to_account_info(),
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
    )?;

    // verify the collection item
    invoke(
        &token_instruction::verify_sized_collection_item(
            TOKEN_METADATA_ID,
            ctx.accounts.metadata.key(),
            ctx.accounts.collection_authority.key(),
            ctx.accounts.mint_authority.key(),
            ctx.accounts.collection_mint.key(),
            ctx.accounts.collection_metadata.key(),
            ctx.accounts.collection_master_edition.key(),
            None, // ctx.accounts.collection_authority_record.key(),
        ),
        &[
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.collection_authority.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.collection_mint.to_account_info(),
            ctx.accounts.collection_metadata.to_account_info(),
            ctx.accounts.collection_master_edition.to_account_info(),

        ]
    )?;

    msg!("Token mint process completed successfully.");

    Ok(())
}

/// Accounts required to mint an NFT.
/// It takes the following Accounts as arguments:
/// 
/// - metadata: this account is responsible for storing additional data attached to the token.
///   It derives from the Mint Account of the token, using a PDA.
/// - token_metadata_program: 
/// - master_edition:
/// - mint:
/// - token_account:
/// - mint-authority: 
/// - rent:
/// - system_program:
/// - token_program:
/// - associated_token_program:
#[derive(Accounts)]
pub struct MintRegularNft<'info> {
    /// CHECK: This Account will be created with Metaplex.
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: This Account will be created with Metaplex.
    pub token_metadata_program: UncheckedAccount<'info>,

    /// Metaplex's Master Edition account
    /// This account is a proof of the Non-Fungibility of the token.
    /// It is derived from the Mint Account.
    /// CHECK: This Account will be created with Metaplex.
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,

    /// Mint Account.
    #[account(mut)]
    pub mint: Signer<'info>,

    /// CHECK: This Account will be created with Anchor.
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,

    /// Wallet signing the transaction and paying the transaction fees.
    #[account(mut)]
    pub mint_authority: Signer<'info>,

    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,

    // to verify collection
    pub collection_authority: Signer<'info>,
    pub collection_mint: Account<'info, token::Mint>,
    /// CHECK: no clue what im doing
    #[account(mut)]
    pub collection_metadata: UncheckedAccount<'info>, // Account<'info, Metadata>,
    /// CHECK: no clue what im doing
    pub collection_master_edition: UncheckedAccount<'info>, // Account<'info, MasterEditionV2>,
    /// CHECK: no clue what im doing
    pub collection_authority_record: UncheckedAccount<'info>, // Account<'info, CollectionAuthorityRecord>,
}