# ICEbreaker

# 🎓 AlumniBridge

> **A Student–Alumni Mentorship, Career Guidance & Referral Platform**

AlumniBridge is a web-based platform designed to connect university students with alumni for **career mentorship, one-to-one guidance sessions, professional networking, and job referral requests**.

The project provides separate portals for **Students** and **Alumni**, with server-side authentication, profile management, mentorship scheduling, availability management, referral workflows, and notifications.

---

## 📌 Project Overview

University students often need practical career guidance, industry insights, interview preparation, and professional connections. AlumniBridge provides a structured platform where students can discover relevant alumni and interact with them without relying on informal communication channels.

### Main goals

- Connect students with experienced alumni.
- Help students find mentors based on company, job title, and skills.
- Allow alumni to publish their available mentoring time.
- Let students request mentorship sessions.
- Allow alumni to accept, decline, or cancel sessions.
- Provide a structured job-referral request system.
- Keep both students and alumni informed through notifications.
- Provide profile pages for maintaining professional information.

---

## ✨ Key Features

### 👨‍🎓 Student Portal

Students can:

- Create a student account.
- Log in securely.
- View a personalized dashboard.
- Search and browse alumni mentors.
- Search mentors by:
  - Name
  - Company
  - Job title / role
  - Skills
- View alumni profiles.
- Request mentorship sessions.
- Track pending, confirmed, declined, and cancelled sessions.
- Cancel their own session requests where allowed.
- Submit job-referral requests to alumni.
- Track referral request status.
- View referral proof submitted by alumni.
- Update their profile.
- Manage CV and portfolio links.
- Receive and manage notifications.

### 👨‍💼 Alumni Portal

Alumni can:

- Create an alumni account.
- Log in securely.
- View their dashboard.
- Manage their professional profile.
- Add:
  - Job title
  - Company
  - Skills
  - Bio
  - LinkedIn profile
  - Portfolio / GitHub link
- Publish mentoring availability.
- Remove available time slots when permitted.
- Review student mentorship requests.
- Accept or decline session requests.
- Cancel sessions.
- Review incoming referral requests.
- Decline referral requests.
- Mark a referral as completed/referred.
- Submit referral proof notes and links.
- Receive and manage notifications.

### 🔔 Notifications

The system supports server-side notifications for important events such as:

- New mentorship requests.
- Accepted mentorship requests.
- Declined mentorship requests.
- Cancelled sessions.
- New referral requests.
- Referral status updates.
- Referral proof submissions.
- Availability-related changes.

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | PHP |
| Database | MySQL / MariaDB |
| Database API | PHP `mysqli` |
| Authentication | PHP Sessions |
| Password Security | PHP `password_hash()` / `password_verify()` |
| Styling | Custom CSS |
| Development Environment | XAMPP / Apache + PHP + MySQL/MariaDB |

No frontend framework or PHP framework is required.

---

## 📂 Project Structure

```text
ICEbreaker/
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── styles.css
│
├── Project.zip
│
├── alumni_bridge.sql
│
└── README.md
```

### Backend files inside `Project.zip`

```text
Project/
├── index.html
├── script.js
├── styles.css
│
├── db.php
├── helpers.php
├── auth.php
│
├── student_login.php
├── student_register.php
├── student_profile.php
│
├── alumni_login.php
├── alumni_register.php
├── alumni_profile.php
│
├── get_alumni.php
├── get_availability.php
├── get_sessions.php
├── get_referrals.php
│
├── availability.php
├── sessions.php
├── referrals.php
├── notifications.php
│
├── test.php
└── alumni_bridge.sql
```

> **Note:** `Project.zip` contains the PHP backend/API implementation and an additional database dump. The root `alumni_bridge.sql` is also included for database setup.

---

# 🔐 Authentication & Security

AlumniBridge uses **server-side PHP sessions** for authentication.

After successful login, the server stores:

```text
$_SESSION["role"]
$_SESSION["user_id"]
```

The role is either:

```text
student
alumni
```

### Security measures implemented

- Passwords are stored using PHP's `password_hash()`.
- Password verification uses `password_verify()`.
- Session IDs are regenerated after successful login.
- Session cookies use `HttpOnly`.
- `SameSite=Lax` is configured for the session cookie.
- HTTPS-aware `Secure` cookie configuration is used.
- Password hashes are never returned to the frontend.
- Prepared SQL statements are used throughout the backend.
- Role-based access checks prevent users from performing restricted actions.
- Server-side validation is applied to important inputs.
- URLs are validated to allow only `http://` and `https://`.
- JSON responses are used consistently by API endpoints.
- Database errors are logged rather than exposed directly to users.
- Important multi-step operations use database transactions.
- Session ownership is checked on the server rather than trusting IDs supplied by the browser.

---

# 🗄️ Database Design

The database is named:

```text
alumni_bridge
```

The main tables are:

### `students`

Stores student account and profile information.

Important fields include:

- `student_id`
- `name`
- `email`
- `password`
- `student_id_no`
- `department`
- `university`
- `graduation_year`
- `phone`
- `skills`
- `cv_link`
- `portfolio_link`

### `alumni`

Stores alumni account and professional information.

Important fields include:

- `alumni_id`
- `name`
- `email`
- `password`
- `department`
- `job_title`
- `company`
- `skills`
- `bio`
- `linkedin_link`
- `portfolio_link`

### `availability`

Stores mentoring time slots created by alumni.

Important fields:

- `availability_id`
- `alumni_id`
- `available_date`
- `start_time`
- `end_time`
- `status`

Availability status can be:

```text
available
booked
cancelled
```

### `sessions`

Stores mentorship session requests and their statuses.

Important fields:

- `session_id`
- `student_id`
- `alumni_id`
- `availability_id`
- `topic`
- `message`
- `session_date`
- `start_time`
- `end_time`
- `status`

Session status can be:

```text
pending
confirmed
cancelled
declined
```

### `referral_requests`

Stores job referral requests between students and alumni.

Important fields:

- `referral_id`
- `student_id`
- `alumni_id`
- `company`
- `position`
- `cv_link`
- `portfolio_link`
- `message`
- `status`
- `proof_note`
- `proof_link`

Referral status can be:

```text
pending
declined
referred
```

### `notifications`

Stores notifications for students and alumni.

Important fields:

- `notification_id`
- `student_id`
- `alumni_id`
- `title`
- `message`
- `is_read`
- `created_at`

---

# 🔗 Database Relationships

The major relationships are:

```text
Students
   │
   ├───────────────┐
   │               │
   ▼               ▼
Sessions      Referral Requests
   │               │
   ▼               ▼
Alumni          Alumni
   │
   ▼
Availability
```

More specifically:

- One **student** can have many mentorship sessions.
- One **alumni** can have many mentorship sessions.
- One **alumni** can create many availability slots.
- A session can reference one availability slot.
- One **student** can create many referral requests.
- One **alumni** can receive many referral requests.
- Notifications can belong to either a student or an alumni.
- Foreign keys use cascading behavior where appropriate.

---

# 🔄 Main Application Workflows

## 1. Student Registration

```text
Student
   ↓
Select Student Role
   ↓
Enter Name + Email + Password
   ↓
Server Validation
   ↓
Password Hashing
   ↓
Insert into students table
   ↓
Account Created
```

---

## 2. Alumni Registration

```text
Alumni
   ↓
Select Alumni Role
   ↓
Enter Name + Email + Password
   ↓
Server Validation
   ↓
Password Hashing
   ↓
Insert into alumni table
   ↓
Account Created
```

---

## 3. Student Finds a Mentor

```text
Student Login
   ↓
Find Mentors
   ↓
Search / Browse Alumni
   ↓
View Alumni Profile
   ↓
Select Available Time
   ↓
Request Mentorship Session
```

---

## 4. Mentorship Session Workflow

```text
Student creates request
          ↓
       PENDING
       ↙      ↘
  DECLINED   ACCEPTED
                 ↓
             CONFIRMED
                 ↓
             COMPLETED
```

The current database explicitly stores `pending`, `confirmed`, `cancelled`, and `declined` session states. Completion is represented by the broader referral/session workflow rather than a dedicated `completed` enum value.

---

## 5. Referral Workflow

```text
Student
   ↓
Select Alumni
   ↓
Enter Company + Position
   ↓
Attach CV / Portfolio
   ↓
Send Referral Request
   ↓
      PENDING
      ↙    ↘
 DECLINED  REFERRED
              ↓
       Alumni submits
       proof note/link
```

---

# 🔌 Backend API / PHP Endpoints

| Endpoint | Purpose |
|---|---|
| `auth.php` | Login, logout, current session, forgot-password response |
| `student_register.php` | Register a student |
| `student_login.php` | Student login compatibility endpoint |
| `student_profile.php` | Read/update student profile |
| `alumni_register.php` | Register an alumni |
| `alumni_login.php` | Alumni login compatibility endpoint |
| `alumni_profile.php` | Read/update alumni profile |
| `get_alumni.php` | Retrieve alumni for students |
| `get_availability.php` | Retrieve availability slots |
| `availability.php` | Add/delete alumni availability |
| `sessions.php` | Create, accept, decline, and cancel sessions |
| `get_sessions.php` | Retrieve session data for the logged-in user |
| `referrals.php` | Create/update referral requests |
| `get_referrals.php` | Retrieve referral requests |
| `notifications.php` | Retrieve/update/clear notifications |
| `db.php` | Database connection |
| `helpers.php` | Shared authentication, validation, response, transaction, and notification helpers |

---

# ⚙️ Backend Architecture

The backend follows a lightweight API architecture:

```text
Browser
   │
   ▼
JavaScript API Request
   │
   ▼
PHP Endpoint
   │
   ├── Authentication / Authorization
   ├── Input Validation
   ├── Database Query
   ├── Transaction (when required)
   └── JSON Response
   │
   ▼
Frontend UI Update
```

`helpers.php` acts as the common backend utility layer and provides:

- Database access.
- Session management.
- Authentication checks.
- Input validation.
- JSON responses.
- Exception handling.
- URL validation.
- Date/time validation.
- Database transactions.
- Server-side notification creation.

---

# 🚀 Installation & Setup

## Prerequisites

Install:

- XAMPP, or another Apache + PHP + MySQL/MariaDB environment.
- PHP 8.x recommended.
- MySQL or MariaDB.
- A modern web browser.

---

## Step 1 — Extract the Project

Extract the project into your web server directory.

For XAMPP on Windows, for example:

```text
C:\xampp\htdocs\
```

You can place the project as:

```text
C:\xampp\htdocs\ICEbreaker\
```

---

## Step 2 — Set Up the Database

Open **phpMyAdmin**.

Create a database named:

```text
alumni_bridge
```

Then import:

```text
alumni_bridge.sql
```

The SQL dump creates the required tables, indexes, auto-increment fields, and foreign-key constraints.

> The SQL file contains development/sample data in the packaged backend version. Do not use those sample credentials or data as production accounts.

---

## Step 3 — Configure Database Connection

Open:

```text
Project/db.php
```

The current development configuration uses:

```php
$host = "localhost";
$username = "root";
$password = "";
$database = "alumni_bridge";
```

If your MySQL/MariaDB setup uses a different username, password, host, or database name, update these values.

For production, credentials should not be hard-coded in a publicly accessible source repository.

---

## Step 4 — Start Apache and MySQL

From XAMPP Control Panel, start:

```text
Apache
MySQL
```

Make sure both services are running before opening the application.

---

## Step 5 — Open the Application

Open the project through Apache rather than directly opening the HTML file.

Example:

```text
http://localhost/ICEbreaker/
```

or, if the application is placed under a different folder:

```text
http://localhost/<your-project-folder>/
```

Using Apache/PHP is required because the application communicates with PHP endpoints and PHP sessions.

---

# 🧪 Testing the Database Connection

The project includes:

```text
test.php
```

It can be used during development to verify that PHP can connect to the database.

If successful, it reports:

```text
Database connected successfully!
```

### ⚠️ Important

`test.php` is a development helper. Remove it or restrict access before deploying the application publicly.

---

# 👤 Example User Journey

## Student

```text
Register
  ↓
Login
  ↓
Dashboard
  ↓
Find Mentor
  ↓
View Alumni
  ↓
Request Session
  ↓
Track Session
  ↓
Request Referral
  ↓
Track Referral
```

## Alumni

```text
Register
  ↓
Login
  ↓
Complete Profile
  ↓
Add Availability
  ↓
Receive Session Request
  ↓
Accept / Decline
  ↓
Receive Referral Request
  ↓
Decline / Refer
  ↓
Submit Referral Proof
```

---

# 🎨 Frontend

The frontend is built with plain HTML, CSS, and JavaScript.

### HTML

`index.html` contains:

- Authentication screens.
- Student dashboard.
- Alumni dashboard.
- Navigation.
- Profile forms.
- Mentor cards.
- Session views.
- Referral views.
- Notification panels.
- Modals.

### CSS

`styles.css` provides:

- Responsive layouts.
- Authentication UI.
- Navigation.
- Cards.
- Buttons.
- Forms.
- Dashboards.
- Notifications.
- Modals.
- Mobile-friendly styling.

### JavaScript

`script.js` handles:

- API requests.
- Login/logout.
- Registration.
- Session restoration.
- Student dashboard loading.
- Mentor searching.
- Session requests.
- Session cancellation.
- Alumni availability.
- Referral workflows.
- Profile updates.
- Notifications.
- Modal handling.
- Client-side UI rendering.
- Basic HTML escaping and URL validation before rendering dynamic content.

---

# 📱 Responsive Design

The CSS uses responsive layouts including:

- CSS Grid.
- Flexible navigation.
- Auto-fitting card grids.
- Mobile breakpoints.
- Responsive forms and modals.

The application is intended to work across desktop and smaller screen sizes.

---

# 🛡️ Validation & Data Integrity

The backend validates important data before database operations.

Examples include:

- Email format.
- Password length.
- Maximum input lengths.
- Integer IDs.
- Dates.
- Times.
- Availability duration.
- HTTP/HTTPS URLs.
- Required fields.
- User role.
- Session ownership.
- Referral ownership.

Database transactions are used for operations where multiple related changes need to remain consistent.

For example, deleting availability can involve cancelling pending session requests and creating notifications, so the operation is handled transactionally.

---

# 🔒 Important Production Considerations

This project is suitable as a university/project prototype, but additional hardening should be considered before public deployment.

Recommended improvements include:

1. Use environment variables or a secret manager for database credentials.
2. Use HTTPS in production.
3. Remove development helpers such as `test.php`.
4. Configure production error logging carefully.
5. Add explicit CSRF tokens for state-changing requests.
6. Add rate limiting for authentication endpoints.
7. Add email infrastructure for real password-reset functionality.
8. Add stronger password policy if required.
9. Add server-side checks for overlapping availability slots.
10. Add database-level or transactional protection against conflicting bookings where necessary.
11. Add audit logging for sensitive actions.
12. Review sample/development data before deployment.
13. Restrict direct access to configuration and development files.
14. Consider moving backend files outside the publicly served directory where architecture permits.

---

# ⚠️ Current Limitations

The current implementation has several prototype-level limitations:

- The forgot-password endpoint returns a generic success message but does not actually send an email because no mail server is configured.
- `test.php` is intended only for development.
- The project does not use a dependency manager or framework.
- There is no dedicated production deployment configuration.
- Availability and booking rules can be expanded further for production-scale concurrency.
- The database dump may contain development/sample records and should be cleaned before production use.

These limitations do not prevent the application from functioning as a university project, but they should be addressed before real-world deployment.

---

# 🧑‍💻 Authors

## Md. Mahmudul Hasan

**Student, Department of Computer Science & Engineering (CSE)**  
**United International University (UIU)**

## Mohammad Taseen Mahmud

**Student, Department of Computer Science & Engineering (CSE)**  
**United International University (UIU)**

---

# 🎓 Academic Project

AlumniBridge was developed as a software project to demonstrate practical implementation of:

- Web application development.
- Frontend development.
- Backend API development.
- PHP session-based authentication.
- MySQL/MariaDB database management.
- Relational database design.
- CRUD operations.
- Role-based authorization.
- Mentorship scheduling.
- Job referral workflows.
- Notification systems.
- Input validation.
- Secure password handling.
- Transaction-based database operations.

---

# 📄 License

No explicit open-source license is currently included in the project.

If this project is intended for public distribution, the authors should add an appropriate license file such as:

```text
LICENSE
```

---

# 🙌 Acknowledgements

Developed as an academic project by students of the **Department of Computer Science & Engineering (CSE), United International University (UIU)**.

---

## 📌 Quick Start

```text
1. Install XAMPP
2. Start Apache + MySQL
3. Create database: alumni_bridge
4. Import alumni_bridge.sql
5. Configure Project/db.php if required
6. Place the project inside htdocs
7. Open http://localhost/ICEbreaker/
8. Register as Student or Alumni
9. Explore mentorship, sessions, referrals, and notifications
```

---

**AlumniBridge — Connecting Students with Experience. 🎓🤝**
