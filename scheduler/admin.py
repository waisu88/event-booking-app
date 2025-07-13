from django.contrib import admin
from .models import EventCategory, TimeSlot


admin.site.register((EventCategory, TimeSlot, ))
