from django.db import models
from django.contrib.auth.models import User


class EventCategory(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=250)

    class Meta:
        verbose_name_plural = "Event categories"

    def __str__(self):
        return self.name
    

class TimeSlot(models.Model):
    category = models.ForeignKey(EventCategory, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"{self.category.name} | {self.start_time.strftime('%Y-%m-%d %H:%M')}"
    

class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    categories = models.ManyToManyField(EventCategory)

