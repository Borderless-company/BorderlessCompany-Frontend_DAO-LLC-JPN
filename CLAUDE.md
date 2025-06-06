# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Borderless DAO v0.2 - A Next.js Web3 application for creating and managing DAO-LLC hybrid structures in Japan. Combines traditional corporate governance with blockchain technology for token-based membership and voting.

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Generate Supabase TypeScript types
pnpm supabase:type
```

## Architecture

- **Frontend:** Next.js 14.2.1 (Page Router) + React 18 + TypeScript
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL) + MongoDB integration
- **Web3:** Thirdweb SDK + Account Abstraction on Soneium Minato testnet
- **UI:** HeroUI component library + Tailwind CSS
- **State Management:** Jotai + TanStack Query
- **Internationalization:** Japanese/English support via next-i18next

## Environment Setup

Required environment variables in `.env.local`:

- `NEXT_PUBLIC_CHAIN_ID` - Blockchain network ID (currently Soneium Minato)
- `NEXT_PUBLIC_BASE_URL` - Application domain
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` - Thirdweb client ID
- Plus Stripe, SendGrid, and other service API keys

## Database Management

```bash
# Login to Supabase CLI
npx supabase login

# Generate types from remote database
pnpm supabase:type

# Local Supabase development
npx supabase start
```

## Key Directories

- `/src/pages/` - Next.js pages and API routes
- `/src/components/` - React components organized by feature (company, estuary, tokens, etc.)
- `/src/hooks/` - Custom React hooks for data fetching and business logic
- `/src/utils/` - Utility functions, API clients, Web3 helpers
- `/src/types/` - TypeScript type definitions
- `/src/atoms/` - Jotai global state atoms
- `/public/locales/` - i18n translation files (ja/en)

## Smart Contracts

- **Network:** Soneium Minato testnet
- **Account Factory:** 0x6a66e6930BDDd1eab827Fd33d012D0ac3443332D
- **Contract addresses:** Defined in `/src/constants/index.ts`
- **ABIs:** Stored in `/src/utils/abi/`

## Core Application Features

1. **Company Creation:** DAO-LLC hybrid entity setup with document generation
2. **Token Management:** Executive/non-executive token creation and sales
3. **Member Onboarding:** "Estuary" system with KYC + payment flow
4. **Document Generation:** Articles of Incorporation, governance agreements
5. **Payment Processing:** Stripe integration for token purchases
6. **Web3 Integration:** Wallet connection with account abstraction (gasless transactions)

## Development Notes

- Uses Next.js Page Router (not App Router)
- HeroUI components with "bls" prefix theming
- Custom JWT + Web3 signature authentication
- Account abstraction enables sponsored gas transactions
- Supabase Row Level Security (RLS) for data protection
- Default locale is Japanese with English translations
- Package manager is pnpm (use pnpm for all commands)

## Deployment Environments

- **Production:** apps.borderless.company
