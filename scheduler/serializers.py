from rest_framework import serializers
from .models import (
    EventCategory, 
    UserPreference,
    TimeSlot,
    )
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


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
    category = EventCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=EventCategory.objects.all(), source='category')
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = TimeSlot
        fields = ['id', 'category', 'category_id', 'start_time', 'end_time', 'user']
    

class TimeSlotBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ['id', 'category', 'category_id', 'start_time', 'end_time', 'user']

    def update(self, instance, validated_data):
        user = self.context['request'].user

        if instance.user is not None and instance.user != user:
            raise serializers.ValidationError("Slot is already booked by another user.")
        
        instance.user = user
        instance.save()
        return instance


class TimeSlotCreateSerializer(serializers.ModelSerializer):
    category = EventCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=EventCategory.objects.all(), source='category')
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        allow_null=True,
        required=False
    )

    class Meta:
        model = TimeSlot
        fields = ['id', 'category', 'category_id', 'start_time', 'end_time', 'user', 'user_id']

    def validate(self, data):
        start_time = data.get('start_time', getattr(self.instance, 'start_time', None))
        end_time = data.get('end_time', getattr(self.instance, 'end_time', None))

        if start_time and end_time and start_time >= end_time:
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
    
    