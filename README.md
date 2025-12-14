# Sweet Shop Management System (SSMS) 🍬

A modern, full-stack web application for managing a sweet shop, featuring a beautiful UI, user authentication, product catalog, and shopping cart functionality.

## 🚀 Local Setup Guide

Follow these steps to get the application running on your local machine using SQLite.

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (Node Package Manager)

### 1. Clone & Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the `backend` directory (if not exists) with:
```env
JWT_SECRET=your_secret_key_here
PORT=3000
```
*Note: No `DATABASE_URL` is needed for local development as it uses SQLite (`local.db`).*

### 3. Run the Application

You need to run both the backend and frontend servers.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
*This will start the server at http://localhost:3000 and automatically initialize the `local.db` SQLite database with sample data.*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*This will launch the application at http://localhost:5173*

---

## ✨ Features

- **Authentication**: User registration and login (JWT-based).
- **Product Catalog**: Browse sweets with images and details.
- **Search**: Real-time search functionality.
- **Shopping Cart**: Add items, adjust quantities, and checkout.
- **Order History**: View past orders (coming soon).
- **Admin Panel**: Manage products and stock (for admin users).

---

## 🤖 AI Use Section

This project was actively developed with the assistance of AI. Below are the recent development activities as recorded in the git history:

1. `refactor: switch to SQLite for local dev, fix database schema, repair checkout flow`
2. `fix: resolve checkout error by catching FK constraints and clearing stale sessions`
3. `fix: correct database schema for order_items (price -> price_at_purchase) to fix checkout`
4. `feat: complete local checkout with sqlite, update cart logic`
5. `fix: correct Sweet model mapping and methods to fix missing sweets error`
6. `fix: remove invalid database import causing backend crash`
7. `clean: remove unnecessary files and artifacts after successful sqlite migration`
8. `fix: update User model to use SQLite and fix registration`
