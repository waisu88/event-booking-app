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

## Future Development Ideas 

- Add event descriptions visible in the calendar view to provide more context to users.
- Allow customization of the UI color scheme, e.g., implementing a dark mode.
- Implement validation to prevent users from booking slots that have already passed.
- Migrate to an external database like PostgreSQL for better scalability and performance in production environments.
- Enhance user profiles by requiring email at registration and integrating asynchronous email notifications (reminders) for upcoming booked slots using Celery with RabbitMQ or Redis.
- Containerize the application using Docker and deploy it to a cloud platform for easier scaling and management.

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

    python manage.py loaddata backend/fixtures/initial_data.json

    OR
6. (Optional) Create admin user:

    python manage.py createsuperuser

7. Run the development server:

    python manage.py runserver

8. Open a browser and go to:

    http://127.0.0.1:8000/

9. Neccessary access data (from initial_data.json):

    Admin -> password: superhardpass
    Testuser1 -> password: testpass1234
    Testuser2 -> password: testpass1234