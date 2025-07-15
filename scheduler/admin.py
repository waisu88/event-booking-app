from django.contrib import admin
from .models import EventCategory, TimeSlot, UserPreference


admin.site.register((EventCategory, TimeSlot, UserPreference))
