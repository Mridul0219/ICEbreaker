<div align="center">

# 🎓 AlumniBridge

**Connecting students with alumni mentors — for mentorship, referrals, and real career guidance.**

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Security](#-security)
- [Contributing](#-contributing)
- [Author](#-author)

---

## 🔭 Overview

**AlumniBridge** gives universities a simple, dependency-light way to keep their student and alumni communities connected. Students can discover alumni mentors by skill, company, or department; request one-on-one mentorship sessions; and ask for job referrals with a single click. Alumni manage their own availability, respond to requests, and track referrals they've submitted — all from a clean, responsive dashboard.

The project is built with no frameworks or build tools — just HTML/CSS/vanilla JavaScript on the frontend and plain PHP with PDO on the backend — making it easy to read, extend, and deploy anywhere PHP + MySQL is available.

---

## ✨ Features

<table>
<tr>
<td valign="top" width="50%">

### 🎓 For Students
- 🔍 Search and filter alumni mentors by skill, company, or department
- 📅 Request mentorship sessions against an alumni's live availability
- 📄 Request job referrals with CV and portfolio links attached
- 📊 Personal dashboard tracking sessions and referral history
- 🔔 Real-time in-app notifications on every status change

</td>
<td valign="top" width="50%">

### 💼 For Alumni
- 🗓️ Publish and manage mentorship availability slots
- ✅ Accept, decline, or cancel session requests
- 🤝 Review referral requests and submit proof of referral
- 👤 Maintain a public profile — bio, company, role, skills, LinkedIn
- 🔔 Instant notifications for new requests

</td>
</tr>
</table>

### ⚙️ Platform-wide
| | |
|---|---|
| 🔐 **Secure auth** | Hashed passwords, PHP sessions, role-based access control |
| ⚡ **No page reloads** | Fully AJAX-driven via the Fetch API |
| 🧩 **Clean architecture** | One responsibility per API endpoint, PDO prepared statements everywhere |
| 📱 **Responsive UI** | Works smoothly across desktop and mobile |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript (Fetch API) |
| Backend | PHP 8+ (no frameworks) |
| Database | MySQL / MariaDB |
| Data Access | PDO with prepared statements |
| Auth | PHP Sessions, `password_hash()` / `password_verify()` |
| Environment | XAMPP, or any Apache + PHP + MySQL stack |

---

## 📁 Project Structure

```
alumnibridge/
├── index.html                  # Single-page frontend (all views/modals)
├── script.js                   # Frontend logic — fetch-based API client + UI rendering
├── styles.css                  # Styling
├── README.md
│
└── backend/
    ├── database/
    │   └── alumni_bridge.sql   # Full schema, importable directly into phpMyAdmin
    │
    ├── config/
    │   └── database.php        # PDO connection
    │
    ├── helpers/
    │   ├── response.php        # JSON response + request-parsing helpers
    │   ├── session_helper.php  # Auth/session guards, current-user resolver
    │   ├── id_helper.php       # Encodes/decodes role-aware IDs (student:5, alumni:5)
    │   └── notification_helper.php
    │
    └── api/
        ├── auth/                # register, login, logout, me, forgot_password
        ├── students/            # update_profile
        ├── alumni/              # list, get, update_profile
        ├── availability/        # list, create, delete
        ├── sessions/            # create, list, accept, decline, cancel
        ├── referrals/           # create, list, update_status, submit_proof
        └── notifications/       # list, mark_read, clear
```

---

## 🗄 Database Schema

| Table | Purpose |
|---|---|
| `students` | Student accounts and profile data |
| `alumni` | Alumni accounts and profile data |
| `availability` | Alumni-published mentorship time slots |
| `sessions` | Mentorship session requests and their status |
| `referral_requests` | Job referral requests and their status |
| `notifications` | In-app notifications for both roles |

Full definitions, indexes, and foreign keys are in [`backend/database/alumni_bridge.sql`](backend/database/alumni_bridge.sql).

---

## 🚀 Getting Started

### Prerequisites
- [XAMPP](https://www.apachefriends.org/) (or any Apache + PHP 8+ + MySQL setup)
- A modern web browser

### Installation

1. **Clone the repository** into your server's web root:
   ```bash
   git clone https://github.com/<your-username>/alumnibridge.git
   ```
   Move the folder into `C:\xampp\htdocs\` (Windows), `/Applications/XAMPP/htdocs/` (macOS), or `/opt/lampp/htdocs/` (Linux).

2. **Start Apache and MySQL** from the XAMPP control panel.

3. **Import the database**
   - Open `http://localhost/phpmyadmin`
   - Go to **Import** → select `backend/database/alumni_bridge.sql` → **Go**
   - This creates the `alumni_bridge` database and all required tables automatically.

4. **Configure the database connection** (only needed if your MySQL credentials differ from the XAMPP default) in `backend/config/database.php`:
   ```php
   $host     = "localhost";
   $dbname   = "alumni_bridge";
   $username = "root";
   $password = "";
   ```

5. **Open the app**
   ```
   http://localhost/alumnibridge/
   ```

That's it — no `composer install`, no build step.

---

## 🔒 Security

- Passwords are hashed with `password_hash()` and verified with `password_verify()` — never stored in plaintext.
- All database queries use **PDO prepared statements** to prevent SQL injection.
- Every state-changing endpoint is gated behind a session/role check (`require_login()` / `require_role()`).
- Database credentials live only in `backend/config/database.php` and are never exposed to the client.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please keep PHP code style consistent with the existing files (PDO + prepared statements, one responsibility per endpoint).

---

## 👨‍💻 Author

**Md. Sajid Hasan**

CSE Student, United International University (UIU), Dhaka, Bangladesh
- GitHub: [@sajid-github](https://github.com/mohammadsajidhasan)
- LinkedIn: [sajid-linkedin](www.linkedin.com/in/md-sajid-hasan-cse)

**Md. Mahmudul Hasan**

CSE Student, United International University (UIU), Dhaka, Bangladesh
- GitHub: [@mridul-github](https://github.com/Mridul0219)

**Taseen Mahmud**

CSE Student, United International University (UIU), Dhaka, Bangladesh
- GitHub: [@taseen-github](https://github.com/mmahmud2310218-rgb)

**Anas Ahmed**

CSE Student, United International University (UIU), Dhaka, Bangladesh
- GitHub: [@anas-github](https://github.com/Anas-xy)

*Feel free to reach out for questions, suggestions, or collaboration!*

---

<p align="center">AlumniBridge — Connecting Students with Experience. 🎓</p>
