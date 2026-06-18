# RateHouse — Store Rating Platform

A full-stack web app where normal users rate stores (1–5), store owners track
their store's reputation, and a system administrator manages the whole
platform. Built to the FullStack Intern Coding Challenge spec.

**Stack:** Express.js · MySQL (Sequelize) · React (Vite) · JWT auth

## Project structure

```
store-rating-app/
├── backend/            Express API, MySQL via Sequelize
│   ├── src/
│   │   ├── config/database.js
│   │   ├── models/             User, Store, Rating + associations
│   │   ├── middleware/auth.js  JWT auth + role authorization
│   │   ├── controllers/        auth, admin, store, store-owner logic
│   │   ├── routes/
│   │   ├── utils/validators.js shared validation rules
│   │   ├── app.js
│   │   └── server.js           connects DB, seeds default admin, starts server
│   └── .env.example
├── frontend/           React app (Vite)
│   ├── src/
│   │   ├── api/axios.js        API client with JWT interceptor
│   │   ├── context/AuthContext.jsx
│   │   ├── components/         AppLayout, DataTable, StarRating, RatingRing, etc.
│   │   └── pages/
│   │       ├── Login.jsx, Signup.jsx, Account.jsx
│   │       ├── admin/           Dashboard, Users, Stores
│   │       ├── user/            Browse & rate stores
│   │       └── storeOwner/      Store dashboard
│   └── .env.example
└── database/schema.sql Reference SQL schema (Sequelize creates this for you)
```

## 1. Backend setup

Prerequisites: Node.js 18+, MySQL 8+ running locally (or any reachable instance).

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set your real `DB_NAME`, `DB_USER`, `DB_PASSWORD`. Then create
the database (Sequelize creates the tables for you, not the database itself).
Log into MySQL and run:

```sql
CREATE DATABASE store_rating_db;
```

You can do this from the `mysql` command line, MySQL Workbench, or any other
GUI you prefer.

Start the API:

```bash
npm run dev      # nodemon, auto-restarts on changes
# or: npm start
```

On first run the server automatically creates a default administrator so you
have a way in:

```
Email:    admin@storerating.com
Password: Admin@1234
```

**Log in and change this password immediately** (use "My Account" once
logged in, or create your own admin via the seed env vars before first run).
The API listens on `http://localhost:5000` by default.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env    # points VITE_API_URL at your backend
npm run dev
```

Visit `http://localhost:5173`.

## Roles & what each one can do

**System Administrator** — dashboard with total users/stores/ratings; add
users of any role (admin, normal user, store owner); add stores and
optionally link them to an existing store-owner account; filterable,
sortable listings of users and stores; view full details of any user
(including their store's rating, if they're a store owner).

**Normal User** — sign up, log in, update password; browse and search
stores by name/address; see each store's overall rating alongside their own
submitted rating; submit a rating (1–5) or change it any time.

**Store Owner** — log in, update password; dashboard showing their store's
average rating and the list of customers who've rated it.

## Validation rules (enforced on both client and server)

| Field    | Rule                                                              |
|----------|--------------------------------------------------------------------|
| Name     | 20–60 characters                                                  |
| Address  | Up to 400 characters                                              |
| Password | 8–16 characters, at least one uppercase letter, one special char  |
| Email    | Standard email format                                              |

## API overview

```
POST   /api/auth/signup              Normal user self-registration
POST   /api/auth/login                Single login for all roles
PUT    /api/auth/password             Update password (any authenticated role)
GET    /api/auth/me                   Current user

GET    /api/admin/dashboard           Stats: total users/stores/ratings
POST   /api/admin/users               Create a user (any role)
GET    /api/admin/users               List + filter (name/email/address/role) + sort
GET    /api/admin/users/:id           Full user detail
POST   /api/admin/stores              Create a store (optionally linked to an owner)
GET    /api/admin/stores              List + filter (name/email/address) + sort
GET    /api/admin/store-owners-available   Store-owner users not yet linked to a store

GET    /api/stores                    List/search stores (name/address) + sort — normal user
POST   /api/stores/:id/rating         Submit or update a rating — normal user

GET    /api/store-owner/dashboard     Average rating + list of raters — store owner
```

All routes except signup/login require `Authorization: Bearer <token>`.

## Notes on design choices

* **Single users table + role enum** implements the "single login system"
  requirement directly: one `/auth/login` endpoint, one JWT, the frontend
  branches on `role` to route to the right dashboard.
* **Ratings are an upsert** (`UNIQUE(user_id, store_id)`), so "submit a
  rating" and "modify your submitted rating" are the same backend operation.
* **Sequelize `sync({ alter: true })`** is used for convenience in this
  challenge context so the schema appears automatically; `database/schema.sql`
  documents the equivalent hand-written schema for review. For a real
  production app you'd swap this for versioned migrations.
