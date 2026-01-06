from django.urls import path, include
from api.views import *

urlpatterns = [
    path('announcements/', AnnouncementView.as_view(), name='announcements'),
    path('tournaments/', TournamentView.as_view(), name='tournaments'),
    path('tournaments/<int:tournament_id>/', TournamentDetailView.as_view(), name='tournament_detail'),
    path('tournaments/<int:tournament_id>/fixtures/', FixturesView.as_view(), name='tournament_fixtures'),
    path('teams/', TeamView.as_view(), name='teams'),
    path('register/', PlayerRegistrationView.as_view(), name='register'),
    path('login/', PlayerLoginView.as_view(), name='login'),
    path('join-tournament/', JoinTournamentView.as_view(), name='join_tournament'),
    path('report/', ReportView.as_view(), name='report'),
    path('standings/', StandingsView.as_view(), name='standings'),
    path('standings/<int:tournament_id>/', StandingsView.as_view(), name='tournament_standings'),
]

