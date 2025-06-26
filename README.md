# Gradient Subscription

A simple subscription backend built using **NestJS**, implementing basic subscription features such as creating invoice, viewing current plan, and cancelling subscription.

---

## 🌐 Deployed WebApp

You can try the deployed frontend at:  
**https://xenshop-frontend.vercel.app**  

---

## ☁️ Deployed Backend (Cloud Run)

The backend API is deployed using **Docker on Google Cloud Run**.  
Endpoint base URL:  
**https://backend-xenshop-237541474823.asia-southeast2.run.app**

The container is built with a custom Dockerfile and deployed directly via Cloud Build or local `gcloud` CLI.

---

## 🧩 Features

- View all invoices
- Subscribe to a plan
- Cancel subscription
- Fetch current active subscription

---

## ⚙️ Tech Stack

- [NestJS](https://nestjs.com/) – backend framework
- [TypeScript](https://www.typescriptlang.org/) – typed JS
- [Vercel](https://vercel.com/) – frontend hosting
- [PostgreSQL](https://www.postgresql.org/) – database

---

## 🚀 How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/fathanadhitama/gradient-subscription.git
cd gradient-subscription
```

### 2. Install Dependencies

```bash
npm install
```
### 3. Set Up Environment Variables
Create a .env file and add the following:

```bash
PORT=8080
APP_WHITELIST=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```
> Adjust database config as needed
### 4. Run The App

```bash
npm run start:dev
```

API will run on http://localhost:8080

## 📌 Note
- The app does not implement authentication. User is identified using a simple user_id header or local storage key.
- For demo purposes only.