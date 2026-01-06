from django.db import models
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.utils import timezone
from server import settings

class PlayerManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, username, phone_number, password=None, **extra_fields):
        if not username:
            raise ValueError("The username must be set")
        if not phone_number:
            raise ValueError("The phone number must be set")
        username = self.model.normalize_username(username)
        user = self.model(username=username, phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, phone_number, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(username, phone_number, password, **extra_fields)


class Player(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=150, unique=True)
    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = PlayerManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["phone_number"]

    def __str__(self):
        return self.username


# Team
class Team(models.Model):
    name = models.CharField(max_length=50, unique=True)
    passcode = models.CharField(max_length=50, null=True, blank=True)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="teams")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# Announcement
class Announcement(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title


# Match
class Match(models.Model):
    team_a = models.ForeignKey(
        Team, related_name="matches_as_team_a", on_delete=models.CASCADE
    )
    team_b = models.ForeignKey(
        Team, related_name="matches_as_team_b", on_delete=models.CASCADE
    )
    scheduled_time = models.DateTimeField()
    location = models.CharField(max_length=100)
    is_completed = models.BooleanField(default=False)
    result = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.team_a} vs {self.team_b} at {self.scheduled_time}"


# Tournament
class Tournament(models.Model):
    title = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    entry_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    teams = models.ManyToManyField(Team, related_name="tournaments")
    matches = models.ManyToManyField(Match, related_name="tournaments", blank=True)

    # Standings system

    def __str__(self):
        return self.title
