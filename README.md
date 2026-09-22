# 🌆 Thane Explorer Hub

**Thane Explorer Hub** is a modern, full-stack web application designed to help users discover local spots, food joints, events, and community posts across Thane city. Built with TypeScript and TanStack Start, it features authenticated user routes, interactive map/list views, and seamless integration with Supabase for data management.

---

## 🚀 Tech Stack

### **Frontend**
* **React**: Component-based user interface library.
* **TypeScript**: End-to-end type safety for routes, components, and APIs.
* **TanStack Router / Start**: File-based full-stack routing with layout support (`src/routes`).
* **Tailwind CSS**: Utility-first CSS framework for custom responsive styling.
* **Vite**: Ultra-fast build tool and development server.

### **Backend & Database**
* **Supabase**: Open-source backend suite providing:
  * **PostgreSQL Database**: Relational storage for users, places, posts, and comments.
  * **Supabase Auth**: JWT-based session management and user authentication.
  * **Database Client (`@supabase/supabase-js`)**: Type-safe SDK to interact with backend services.
* **JSON Server**: Local mock server for testing endpoints during development.

---

## 🏗️ How the Architecture & APIs Work
┌─────────────────────────────────────────────────────────────┐
│                    Client (React + Vite)                    │
│                                                             │
│   ┌───────────────────┐              ┌──────────────────┐   │
│   │  Public Routes    │              │ Auth Protected   │   │
│   │  (/, /explore)    │              │ Routes           │   │
│   └─────────┬─────────┘              └────────┬─────────┘   │
└─────────────┼─────────────────────────────────┼─────────────┘
│                                 │
│ Fetch / Mutate Data             │ JWT Auth Verification
▼                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend Service                 │
│                                                             │
│   ┌───────────────────┐              ┌──────────────────┐   │
│   │  Supabase Auth    │              │ PostgreSQL DB    │   │
│   │  (JWT Sessions)   │              │ (Tables & RLS)   │   │
│   └───────────────────┘              └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘

### **1. File-Based Routing**
* Navigation is handled by **TanStack Router**. Public routes (like `/explore` and `/posts/$id`) are accessible to everyone, while protected management routes are grouped inside the `_authenticated` layout folder.

### **2. Authentication & Authorization**
* Users sign in or register through Supabase Auth (`src/routes/auth.tsx`).
* Once logged in, a JSON Web Token (JWT) is stored client-side. Router guards evaluate this token before allowing access to private dashboard routes.

### **3. Data Fetching & Security**
* All database queries and mutations (e.g., creating posts or loading spot details) execute through the initialized Supabase client (`src/supabase/client.ts`).
* **Row-Level Security (RLS)** policies inside PostgreSQL ensure that users can only modify or delete their own contributions.

---

## 📁 Repository Structure

```text
thane-explorer-hub/
├── src/
│   ├── components/       # Reusable React UI components
│   ├── hooks/            # Custom hooks for state & API fetching
│   ├── integrations/     # Third-party integrations (Supabase setup)
│   ├── routes/           # File-based route definitions
│   │   ├── _authenticated/ # Protected dashboard & admin routes
│   │   ├── api/          # Server API route handlers
│   │   ├── auth.tsx      # Login and signup route
│   │   ├── explore.tsx   # Discovery/exploration route
│   │   └── index.tsx     # Landing page
│   └── supabase/         # Supabase client instance and types
├── .gitignore            # Files excluded from Git tracking (.env, node_modules)
├── package.json          # Node dependencies and npm scripts
└── vite.config.ts        # Vite dev server configuration

🛠️ Local Development Instructions
Clone the repository:

Bash
git clone [https://github.com/pranay-44/thane-explorer-hub.git](https://github.com/pranay-44/thane-explorer-hub.git)
cd thane-explorer-hub
Install dependencies:

Bash
npm install
# or using bun
bun install
Configure Environment Variables:
Create a .env file in the project root directory and add your Supabase keys:

Code snippet
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Start the development server:

Bash
npm run dev
# or using bun
bun dev
Open in browser:
Go to http://localhost:3000 or http://localhost:5173 to view the application.


---


