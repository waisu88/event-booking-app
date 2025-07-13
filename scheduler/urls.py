from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventCategoryListView, 
    UserPreferenceDetailView,
    RegisterView,
    TimeSlotBookView,
    TimeSlotUnsubscribeView,
    TimeSlotViewSet,
)


router = DefaultRouter()
router.register(r'slots', TimeSlotViewSet, basename='timeslot')

urlpatterns = [
    path('categories/', EventCategoryListView.as_view(), name='event_category_list'),
    path('preferences/', UserPreferenceDetailView.as_view(), name='user_preference_detail'),
    path('register/', RegisterView.as_view(), name='register'),
    path('slots/<int:pk>/book/', TimeSlotBookView.as_view(), name='timeslot_book'),
    path('slots/<int:pk>/unsubscribe/', TimeSlotUnsubscribeView.as_view(), name='timeslot_unsubscribe'),

    path('', include(router.urls)),
]