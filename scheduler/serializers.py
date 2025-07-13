from rest_framework import serializers
from .models import (
    EventCategory, 
    UserPreference,
    TimeSlot,
    )



class EventCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventCategory
        fields = ['id', 'name']

    
class UserPreferenceSerializer(serializers.ModelSerializer):
    categories = EventCategorySerializer(many=True, read_only=True)
    categories_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=EventCategory.objects.all(),
        source='categories',
        write_only=True
    )

    class Meta:
        model = UserPreference
        fields = ['categories', 'categories_ids']

    def update(self, instance, validated_data):
        categories = validated_data.pop('categories', [])
        if categories:
            instance.categories.set(categories)
        instance.save()
        return instance
    

class TimeSlotSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    category_id = serializers.PrimaryKeyRelatedField(queryset=EventCategory.objects.all(), source='category')
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = TimeSlot
        fields = ['id', 'category', 'category_id', 'start_time', 'end_time', 'user']
    

class TimeSlotBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = []

    def update(self, instance, validated_data):
        user = self.context['request'].user

        if instance.user is not None and instance.user != user:
            raise serializers.ValidationError("Slot is already booked by another user.")
        
        instance.user = user
        instance.save()
        return instance


class TimeSlotCreateSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    category_id = serializers.PrimaryKeyRelatedField(queryset=EventCategory.objects.all(), source='category')
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = TimeSlot
        fields = ['id', 'category', 'category_id', 'start_time', 'end_time', 'user']

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("Start time must be before end time")
        return data
    

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        token['username'] = user.username

        return token