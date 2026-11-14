

<p align="center">
  <img src="docs/3travelgo.png" width="100%" alt="3TravelGo Project Preview">
</p>

<h1 align="center">🚌 3TravelGo</h1>

<p align="center">
  <strong>Your Journey, Better Organized.</strong>
</p>

<p align="center">
  A Web-Based Bus Reservation Management System
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Development-blue?style=flat-square" alt="Development Status">
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white" alt="PHP">
  <img src="https://img.shields.io/badge/CodeIgniter-EF4223?style=flat-square&logo=codeigniter&logoColor=white" alt="CodeIgniter">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
</p>

---

## 📌 About the Project

3TravelGo is a web-based Bus Reservation Management System designed to provide customers with a convenient way to explore available bus trips, check schedules, select seats, and make reservations.

The system also provides dedicated interfaces for administrators and staff to manage reservations, trips, passengers, payments, and other transportation operations.

Its goal is to make bus reservation and transportation management more organized, accessible, and efficient.

## 🚀 System Modules

### 👤 Customer Portal

- 🚌 Browse available bus trips
- 📅 View trip schedules and details
- 💺 Select available bus seats
- 📝 Submit passenger information
- 🎫 Make reservations
- 💳 View reservation and payment information
- 📱 Generate and view reservation QR codes

### 🛠️ Admin Portal

- 📊 Dashboard overview
- 🚌 Manage bus trips
- 🏢 Manage bus operators
- 📍 Manage terminals
- 💺 Manage seats
- 👥 Manage passengers
- 🎫 Manage reservations
- 💳 Manage payments
- 📈 View reports

### 👨‍💼 Staff Portal

- 📊 Staff dashboard
- 🎫 View reservations
- 📅 Monitor trip schedules
- 💺 Check seat availability
- 💳 Verify payments
- 📱 Scan passenger QR codes
- ✅ Verify passenger check-in using QR codes
- 📋 View check-in history
- 🚌 Monitor trips

## 💻 Technologies Used

| Technology | Purpose |
|---|---|
| ⚛️ React | Frontend library |
| 🔷 TypeScript | Frontend programming language |
| 🎨 Tailwind CSS | Interface styling |
| ⚡ Vite | Frontend development and build tool |
| 🐘 PHP | Backend programming language |
| 🔥 CodeIgniter 4 | Backend framework |
| 🐘 PostgreSQL | Database management system |

## 📂 Project Structure

```text
3TravelGo-Bus-Reservation-System/
│
├── BACKEND/
│   ├── app/
│   ├── public/
│   ├── tests/
│   └── writable/
│
├── FRONTEND/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       └── services/
│
├── docs/
│   └── 3travelgo.png
│
└── README.md
```

## ⚙️ Installation Guide

### 📋 Requirements

Make sure the following tools are installed:

- 🐘 PHP
- 📦 Composer
- 🟢 Node.js and npm
- 🐘 PostgreSQL
- 🌐 Git

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Syntaxdevv/3TravelGo-Bus-Reservation-System.git

cd 3TravelGo-Bus-Reservation-System
```

### 2️⃣ Backend Setup

Navigate to the backend directory:

```bash
cd BACKEND
```

Install the required dependencies:

```bash
composer install
```

Configure your CodeIgniter environment and PostgreSQL database connection before running the backend.

Start the backend development server:

```bash
php spark serve
```

### 3️⃣ Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd FRONTEND
```

Install the required packages:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

Open the local development URL provided by Vite.

## 🗄️ Database

3TravelGo uses PostgreSQL as its database management system to store and manage application data, including:

- 🚌 Bus operators
- 📅 Trips and schedules
- 📍 Terminals
- 💺 Seats
- 👥 Passengers
- 🎫 Reservations
- 💳 Payments

## 📄 License
This project is licensed under the MIT License.
