# event-booking-app

A full-stack web application that allows users to book events from predefined calendar time slots.

---

## Objective

This project implements a web application for booking events from predefined calendar slots.

Users can:

- Select their preferred event categories.
- View a weekly calendar filtered by preferences.
- Book or unsubscribe from available time slots.

Admins can:

- Add new time slots for event categories.
- Edit existing time slots.
- View all time slots and their bookings.
- Book or unsubscribe users.

---

## Functional Requirements

- User signup for time slots (one user per slot).
- Weekly calendar view with event category filters.
- Admin management of time slots.

---

## Technology Stack

- Backend: Python 3.10.10, Django, Django REST Framework
- Frontend: Integrated with Django templates (no separate frontend server)
- Authentication: JWT (JSON Web Tokens)

---

## How to Run (Windows 10, CMD)

1. Clone the repository:

   git clone https://github.com/waisu88/event-booking-app.git
   cd event-booking-app

2. Create and activate a Python virtual environment:

   python -m venv env
   .\env\Scripts\activate

3. Install dependencies:

    pip install -r requirements.txt

4. Apply migrations:

    python manage.py migrate

5. Load initial data:

    python manage.py loaddata initial_data.json

    OR
6. (Optional) Create admin user:

    python manage.py createsuperuser

7. Run the development server:

    python manage.py runserver

8. Open a browser and go to:

    http://127.0.0.1:8000/
