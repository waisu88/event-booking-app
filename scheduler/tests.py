from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from scheduler.models import TimeSlot, EventCategory, UserPreference
from datetime import timedelta
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

class TimeSlotCRUDTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin = User.objects.create_user(username='admin', password='admin123', is_staff=True)
        self.user = User.objects.create_user(username='user', password='user123')

        self.category = EventCategory.objects.create(name="Category 1", description="Description 1")

        self.slot = TimeSlot.objects.create(
            category=self.category,
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, hours=1)
        )

        self.timeslot_url = reverse('timeslot-list')
        self.detail_url = reverse('timeslot-detail', kwargs={'pk': self.slot.id})

    def get_auth_headers(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'HTTP_AUTHORIZATION': f'Bearer {str(refresh.access_token)}',
            'Content-Type': 'application/json'
        }

    def create_slot_payload(self):
        return {
            'category_id': self.category.id,
            'start_time': (timezone.now() + timedelta(days=2)).isoformat(),
            'end_time': (timezone.now() + timedelta(days=2, hours=1)).isoformat()
        }

    def test_admin_can_create_slot(self):
        response = self.client.post(
            self.timeslot_url,
            data=self.create_slot_payload(),
            **self.get_auth_headers(self.admin)
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_user_cannot_create_slot(self):
        response = self.client.post(
            self.timeslot_url,
            data=self.create_slot_payload(),
            **self.get_auth_headers(self.user)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_can_list_slots(self):
        response = self.client.get(
            self.timeslot_url,
            **self.get_auth_headers(self.user)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_can_update_slot(self):
        payload = {
            'category_id': self.category.id,
            'start_time': (timezone.now() + timedelta(days=3)).isoformat(),
            'end_time': (timezone.now() + timedelta(days=3, hours=1)).isoformat()
        }

        response = self.client.put(
            self.detail_url,
            data=payload,
            **self.get_auth_headers(self.admin)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_cannot_update_slot(self):
        payload = {
            'category_id': self.category.id,
            'start_time': (timezone.now() + timedelta(days=3)).isoformat(),
            'end_time': (timezone.now() + timedelta(days=3, hours=1)).isoformat()
        }

        response = self.client.put(
            self.detail_url,
            data=payload,
            **self.get_auth_headers(self.user)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete_slot(self):
        response = self.client.delete(
            self.detail_url,
            **self.get_auth_headers(self.admin)
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_user_cannot_delete_slot(self):
        response = self.client.delete(
            self.detail_url,
            **self.get_auth_headers(self.user)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TimeSlotBookingTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(username='user', password='user123')
        self.other_user = User.objects.create_user(username='otheruser', password='other123')

        self.category = EventCategory.objects.create(name="Category 1", description="Description 1")

        self.slot = TimeSlot.objects.create(
            category=self.category,
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, hours=1),
            user=None
        )

        self.book_url = reverse('timeslot_book', kwargs={'pk': self.slot.id})
        self.unsubscribe_url = reverse('timeslot_unsubscribe', kwargs={'pk': self.slot.id})

    def get_auth_headers(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'HTTP_AUTHORIZATION': f'Bearer {str(refresh.access_token)}',
            'Content-Type': 'application/json'
        }

    def test_user_can_book_slot(self):
        response = self.client.post(self.book_url, **self.get_auth_headers(self.user))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.slot.refresh_from_db()
        self.assertEqual(self.slot.user, self.user)

    def test_user_cannot_book_taken_slot(self):
        # First user books the slot
        self.slot.user = self.other_user
        self.slot.save()

        # Another user tries to book
        response = self.client.post(self.book_url, **self.get_auth_headers(self.user))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Slot already taken', response.data.get('detail', ''))

    def test_user_cannot_book_twice(self):
        # User books the slot
        self.slot.user = self.user
        self.slot.save()

        # User tries to book again (should fail)
        response = self.client.post(self.book_url, **self.get_auth_headers(self.user))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_can_unsubscribe(self):
        # User books the slot first
        self.slot.user = self.user
        self.slot.save()

        response = self.client.post(self.unsubscribe_url, **self.get_auth_headers(self.user))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.slot.refresh_from_db()
        self.assertIsNone(self.slot.user)

    def test_user_cannot_unsubscribe_if_not_booked(self):
        # Slot is booked by another user
        self.slot.user = self.other_user
        self.slot.save()

        response = self.client.post(self.unsubscribe_url, **self.get_auth_headers(self.user))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('not subscribed', response.data.get('detail', ''))

    def test_user_cannot_unsubscribe_if_not_booked_anymore(self):
        # Slot is free (not booked)
        self.slot.user = None
        self.slot.save()

        response = self.client.post(self.unsubscribe_url, **self.get_auth_headers(self.user))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('not subscribed', response.data.get('detail', ''))

    def test_unauthenticated_user_cannot_book_or_unsubscribe(self):
        # Without auth header
        response = self.client.post(self.book_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.post(self.unsubscribe_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserPreferenceTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='user', password='user123')
        self.category1 = EventCategory.objects.create(name="Category 1", description="Desc 1")
        self.category2 = EventCategory.objects.create(name="Category 2", description="Desc 2")
        self.pref_url = reverse('user_preference_detail')
    
    def get_auth_headers(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'HTTP_AUTHORIZATION': f'Bearer {str(refresh.access_token)}',
            'Content-Type': 'application/json'
        }

    def test_get_user_preference(self):
        pref = UserPreference.objects.create(user=self.user)
        pref.categories.add(self.category1)
        pref.save()

        response = self.client.get(self.pref_url, **self.get_auth_headers(self.user))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        categories = response.data['categories']
        category_ids = [cat['id'] for cat in categories]
        self.assertIn(self.category1.id, category_ids)


class RegisterViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')

    def test_register_success(self):
        payload = {
            "username": "newuser",
            "password": "StrongPass123!"
        }
        response = self.client.post(self.register_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['detail'], "User successfully created.")
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_register_missing_fields(self):
        response = self.client.post(self.register_url, data={}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_existing_username(self):
        User.objects.create_user(username="existing", password="pass123")
        response = self.client.post(self.register_url, data={"username": "existing", "password": "newpass"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Username already exists", response.data['detail'])

    def test_register_weak_password(self):
        payload = {
            "username": "user2",
            "password": "123" 
        }
        response = self.client.post(self.register_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(isinstance(response.data['detail'], list))


class JWTLoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse('token_obtain_pair')  # or your custom URL name
        self.user = User.objects.create_user(username='testuser', password='testpass123')

    def test_login_success(self):
        payload = {
            "username": "testuser",
            "password": "testpass123"
        }
        response = self.client.post(self.login_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_wrong_credentials(self):
        payload = {
            "username": "testuser",
            "password": "wrongpass"
        }
        response = self.client.post(self.login_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
