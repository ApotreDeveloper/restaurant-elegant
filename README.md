
# Le Gourmet Élégant - Restaurant Management System

A modern, responsive, and full-featured web application for a high-end gastronomic restaurant. Includes a public-facing website and a comprehensive admin dashboard.

## 🌟 Features

### Public Website
- **Home**: Hero slider, featured dishes, and testimonials.
- **Menu**: Categorized menu with filtering (allergens, search), details modal, and cart system.
- **Reservation**: Multi-step booking form with real-time availability check.
- **Online Ordering**: Complete flow for delivery or pickup orders.
- **Gallery**: Masonry layout with lightbox and featured carousel.
- **Blog**: Articles with categories and reading time.
- **About**: Story, team, and values.
- **SEO Optimized**: Dynamic meta tags and titles for search engine visibility.

### Admin Dashboard
- **Dashboard**: Real-time overview of revenue, orders, and reservations.
- **Reservations Management**: Calendar and list views, status updates, new booking creation.
- **Orders Management**: Order processing pipeline, status tracking, receipts printing.
- **Menu Management**: Drag-and-drop category and item reordering, CRUD operations.
- **Gallery Management**: Bulk upload, drag-and-drop sorting, featured image selection.
- **Blog Management**: Rich text editor (Quill), publishing workflow.
- **Reviews Management**: Moderation system (approve/reject) for customer reviews.
- **Settings**: Restaurant info, opening hours, social links.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons
- **State Management**: Zustand (with persistence for cart/auth)
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Forms**: React Hook Form, Zod
- **Utils**: Date-fns, Dnd-Kit, Recharts, React Helmet Async

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- NPM or Yarn
- A Supabase project

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/le-gourmet-elegant.git
   cd le-gourmet-elegant
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure Environment Variables
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run Development Server
   ```bash
   npm run dev
   ```

## 📦 Deployment

This project is optimized for deployment on **Vercel**.

1. Connect your GitHub repository to Vercel.
2. Add the Environment Variables in Vercel settings.
3. Deploy!

## 🔐 Admin Access

To access the admin panel:
1. Navigate to `/admin/login`.
2. Use the credentials created in your Supabase Auth (see `ADMIN_SETUP.md`).

## 📂 Project Structure

- `src/components/public`: Components for the customer-facing site.
- `src/components/admin`: Components specific to the dashboard.
- `src/components/shared`: Reusable UI components (Button, Input, Modal, etc.).
- `src/pages`: Route components split by `public` and `admin`.
- `src/services`: API calls and Supabase client.
- `src/stores`: Zustand stores.
- `src/utils`: Helpers, validation, and constants.

## 📄 License

MIT License.
