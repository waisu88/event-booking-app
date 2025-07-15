from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from django.views.generic import TemplateView
from .views import (
    EventCategoryListView, 
    UserPreferenceDetailView,
    RegisterView,
    TimeSlotBookView,
    TimeSlotUnsubscribeView,
    TimeSlotViewSet,
    UserViewSet,
)


router = DefaultRouter()
router.register(r'slots', TimeSlotViewSet, basename='timeslot')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('categories/', EventCategoryListView.as_view(), name='event_category_list'),
    path('preferences/', UserPreferenceDetailView.as_view(), name='user_preference_detail'),
    path('register/', RegisterView.as_view(), name='register'),
    path('slots/<int:pk>/book/', TimeSlotBookView.as_view(), name='timeslot_book'),
    path('slots/<int:pk>/unsubscribe/', TimeSlotUnsubscribeView.as_view(), name='timeslot_unsubscribe'),

    path('', include(router.urls)),
]

