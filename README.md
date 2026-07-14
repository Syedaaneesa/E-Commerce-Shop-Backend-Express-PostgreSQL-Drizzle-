# 🛒 E-Commerce Shop Backend

A modern, production-ready **E-Commerce Backend API** built with **Express.js**, **PostgreSQL**, **Drizzle ORM**, **TypeScript**, **Clerk Authentication**, and **Pino Logger**. Designed with scalability, security, and maintainability in mind, this backend provides everything needed to power a modern online store.

---

## ✨ Features

* 🔐 Secure authentication with Clerk
* 👤 User and role-based access control
* 📦 Product management
* 🗂️ Category management
* 🛍️ Shopping cart
* ❤️ Wishlist
* ⭐ Product reviews and ratings
* 🎟️ Coupon management
* 📋 Order management
* 📊 Inventory tracking
* 🚀 RESTful API architecture
* 📝 Structured request logging with Pino
* ⚡ Built with TypeScript
* 🗄️ PostgreSQL database
* 🔄 Drizzle ORM for type-safe database operations
* 🧩 Modular and scalable project structure
* 🌍 Environment-based configuration

---

## 🛠️ Tech Stack

| Technology  | Purpose                          |
| ----------- | -------------------------------- |
| Express.js  | Backend Framework                |
| TypeScript  | Type Safety                      |
| PostgreSQL  | Database                         |
| Drizzle ORM | Database ORM                     |
| Clerk       | Authentication & User Management |
| Pino        | High-performance Logging         |
| Node.js     | Runtime                          |

---

## 📁 Project Structure

```text
src/
├── config/
├── controllers/
├── database/
├── middleware/
├── routes/
├── services/
├── utils/
├── types/
├── app.ts
└── server.ts
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/E-Commerce-Shop-Backend.git
cd E-Commerce-Shop-Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=postgresql://username:password@localhost:5432/ecommerce

CLERK_SECRET_KEY=23846dgafu2fg8342687ebd36qr3xb6er12e78xb3e3r21ex8398c
CLERK_PUBLISHABLE_KEY=ebtr8b73brt7ctqc6r3qr78eqewc9dyfnewr9

LOG_LEVEL=info
```

---

## 🗄️ Database

Generate migrations:

```bash
npm run db:generate
```

Apply migrations:

```bash
npm run db:migrate
```

Open Drizzle Studio:

```bash
npm run db:studio
```

---

## ▶️ Development

Start the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Run the production build:

```bash
npm start
```

---

## 📌 API Modules

* Authentication
* Users
* Products
* Categories
* Orders
* Cart
* Wishlist
* Coupons
* Reviews
* Health Check

---

## 🔒 Authentication

Authentication is powered by **Clerk**, providing:

* Secure Sign In
* User Sessions
* JWT Verification
* Role-based Authorization
* Protected Routes

---

## 📈 Logging

Application logs are handled by **Pino**, offering:

* Fast structured logging
* Request logging
* Error tracking
* Production-ready performance

---

## 🎯 Goals

This project aims to provide a clean, scalable backend architecture suitable for:

* E-Commerce Websites
* Marketplace Platforms
* Headless Commerce
* Mobile Applications
* SaaS Commerce Solutions

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a new feature branch
3. Commit your changes
4. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Syeda Aneesa**

Full-Stack Web Developer

* Portfolio: https://aneesa.zeestmedia.com
* Website: https://zeestmedia.com

---

## ⭐ Support

If you found this project helpful, consider giving it a **⭐ Star**. Your support helps motivate future improvements and new open-source projects.

Happy Coding! 🚀
