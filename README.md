# KenteKart

A modern marketplace platform for buying, selling, and swapping items in Ghana. Built with React, TypeScript, and Supabase.

## Features

- 🛍️ Buy and sell items across multiple categories
- 🔄 Swap items with other users
- 💬 Real-time messaging between buyers and sellers
- ⭐ User ratings and reviews
- 🏪 Featured stores and verified distributors
- 📱 Fully responsive design
- 🔐 Secure authentication with Supabase
- 💳 Multiple payment options (Stripe, Mobile Money)
- 🎯 Item promotions and featured listings
- 👨‍💼 Admin dashboard for platform management

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd kentekart
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up Supabase:
   - Create a new Supabase project
   - Run the migrations from `supabase/migrations/`
   - Update the Supabase configuration in `src/integrations/supabase/client.ts`

4. Configure environment secrets in Supabase:
   - `STRIPE_SECRET_KEY` - For payment processing
   - `STRIPE_WEBHOOK_SECRET` - For Stripe webhooks
   - `RESEND_API_KEY` - For email notifications

5. Start the development server:
```bash
npm run dev
# or
bun dev
```

## Project Structure

```
src/
├── components/        # React components
│   ├── admin/        # Admin-specific components
│   └── ui/           # Reusable UI components (shadcn)
├── pages/            # Page components
├── hooks/            # Custom React hooks
├── stores/           # Zustand state stores
├── utils/            # Utility functions
├── integrations/     # Third-party integrations
└── styles/           # Global styles

supabase/
├── functions/        # Edge functions
└── migrations/       # Database migrations
```

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
