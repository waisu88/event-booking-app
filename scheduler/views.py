from django.shortcuts import render
from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from .models import EventCategory, UserPreference, TimeSlot
from .serializers import (EventCategorySerializer, 
                          UserPreferenceSerializer, 
                          TimeSlotSerializer, 
                          TimeSlotCreateSerializer,
                          UserSerializer,
                          )


def index(request):
    return render(request, 'index.html')


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"detail": "Username and password are required."}, status=400)
        
        if User.objects.filter(username=username).exists():
            return Response({"detail": "Username already exists."}, status=400)
        
        try:
            validate_password(password)
        except ValidationError as e:
            return Response({"detail": e.messages}, status=400)
        
        user = User.objects.create_user(username=username, password=password)
        return Response({"detail": "User successfully created."}, status=201)



class EventCategoryListView(generics.ListAPIView):
    queryset = EventCategory.objects.all()
    serializer_class = EventCategorySerializer
    permission_classes = [permissions.AllowAny]


class UserPreferenceDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj, created = UserPreference.objects.get_or_create(user=self.request.user)
        return obj


class TimeSlotBookView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            slot = TimeSlot.objects.get(pk=pk)
        except TimeSlot.DoesNotExist:
            return Response({"detail": "Slot not found."}, status=404)

        if slot.user is not None:
            return Response({"detail": "Slot already taken."}, status=400)

        slot.user = request.user
        slot.save()
        return Response({"detail": "Successfully booked."}, status=200)


class TimeSlotUnsubscribeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(Self, request, pk):
        try:
            slot = TimeSlot.objects.get(pk=pk)
        except TimeSlot.DoesNotExist:
            return Response({"detail": "Slot not found."}, status=404)
        
        if slot.user != request.user:
            return Response({"detail": "You are not subscribed to this slot."}, status=403)

        slot.user = None
        slot.save()
        return Response({"detail": "Unsubscribed."}, status=200)
    

class TimeSlotViewSet(viewsets.ModelViewSet):
    queryset = TimeSlot.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TimeSlotCreateSerializer
        return TimeSlotSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        qs = super().get_queryset()
        week = self.request.query_params.get('week')
        if week is not None:
            try:
                week_offset = int(week)
            except ValueError:
                week_offset = 0
            today = timezone.now().date()
            start_of_week = today - timedelta(days=today.weekday())
            start_of_week = start_of_week + timedelta(weeks=week_offset)
            end_of_week = start_of_week + timedelta(days=7)

            qs = qs.filter(start_time__gte=start_of_week, start_time__lte=end_of_week)
        return qs
    

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer