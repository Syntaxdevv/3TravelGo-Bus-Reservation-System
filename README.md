# 3TravelGo

<p align="left">
  <img src="https://img.shields.io/badge/3TravelGo-Bus%20Reservation-008C89?style=for-the-badge" alt="3TravelGo">
  <img src="https://img.shields.io/badge/Status-Development-blue?style=for-the-badge">
</p>

## Your Journey, Better Organized.

A web-based Bus Reservation Management System designed to make bus booking, trip scheduling, and transportation operations more organized.

<p align="left">
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white">
  <img src="https://img.shields.io/badge/CodeIgniter-EF4223?style=flat-square&logo=codeigniter&logoColor=white">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white">
</p>

---

## Project Preview

<p align="center">
  <img src="docs/3travelgo.png" width="100%" alt="3TravelGo Customer Landing Page">
</p>

---

## About the Project

3TravelGo is a web-based bus reservation system that provides customers with a convenient way to explore bus trips and make reservations.

It also provides administrative and staff interfaces for managing reservations, trips, passengers, payments, and other transportation operations.

## System Modules

### Customer Portal
- Browse available bus trips
- View trip schedules and details
- Select bus seats
- Submit passenger information
- Make reservations
- View reservation and payment information

### Admin Portal
- Dashboard overview
- Manage bus trips
- Manage bus operators
- Manage terminals
- Manage seats
- Manage passengers
- Manage reservations
- Manage payments
- View reports

### Staff Portal
- Staff dashboard
- View reservations
- Monitor trip schedules
- Check seat availability
- Verify payments
- Scan passenger QR codes
- View check-in history
- Monitor trips

## Technologies Used

| Technology | Purpose |
|---|---|
| React | Frontend library |
| TypeScript | Frontend programming language |
| Tailwind CSS | Interface styling |
| Vite | Frontend development and build tool |
| PHP | Backend programming language |
| CodeIgniter 4 | Backend framework |
| PostgreSQL | Database management system |

## Project Structure

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
│   └── 3travelgo-preview.png
│
└── README.md
```

## Installation Guide

### Requirements

- PHP
- Composer
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Syntaxdevv/3TravelGo-Bus-Reservation-System.git

cd 3TravelGo-Bus-Reservation-System
```

### 2. Backend Setup

```bash
cd BACKEND
composer install
php spark serve
```

Configure your CodeIgniter environment and PostgreSQL database connection before running the backend.

### 3. Frontend Setup

Open another terminal:

```bash
cd FRONTEND
npm install
npm run dev
```

Open the local development URL displayed by Vite.

## Database

3TravelGo uses PostgreSQL to store and manage application data, including:

- Bus operators
- Trips and schedules
- Terminals
- Seats
- Passengers
- Reservations
- Payments

## Repository

[GitHub – 3TravelGo Bus Reservation Management System](https://github.com/Syntaxdevv/3TravelGo-Bus-Reservation-System)

---

<p align="center">
  <strong>3TravelGo</strong><br>
  Making bus reservations more organized.
</p>