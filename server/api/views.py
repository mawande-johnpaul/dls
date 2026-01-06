try:
    from rest_framework.views import APIView
    from rest_framework.response import Response
    from rest_framework import status
except Exception:
    from django.views import View as APIView
    from django.http import JsonResponse as Response
    status = None

from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Q, Count, Sum
from api.models import Announcement, Tournament, Team, Player, Match
import json


class AnnouncementView(APIView):
    def get(self, request):
        announcements = Announcement.objects.filter(
            Q(expires_at__gte=timezone.now()) | Q(expires_at__isnull=True)
        ).order_by('-created_at').values(
            'id', 'title', 'content', 'created_at', 'expires_at'
        )
        return JsonResponse(list(announcements), safe=False)


class TournamentView(APIView):
    def get(self, request):
        tournaments = Tournament.objects.all().order_by('-start_date')
        
        tournament_list = []
        for tournament in tournaments:
            teams = tournament.teams.all()
            tournament_data = {
                'id': tournament.id,
                'title': tournament.title,
                'start_date': tournament.start_date.isoformat(),
                'end_date': tournament.end_date.isoformat(),
                'entry_fee': float(tournament.entry_fee),
                'teams': [{'id': team.id, 'name': team.name} for team in teams],
                'team_count': teams.count()
            }
            tournament_list.append(tournament_data)
        
        return JsonResponse(tournament_list, safe=False)


class TournamentDetailView(APIView):
    def get(self, request, tournament_id):
        try:
            tournament = Tournament.objects.get(id=tournament_id)
            teams = tournament.teams.all()
            matches = tournament.matches.all()
            
            tournament_data = {
                'id': tournament.id,
                'title': tournament.title,
                'start_date': tournament.start_date.isoformat(),
                'end_date': tournament.end_date.isoformat(),
                'teams': [
                    {
                        'id': team.id,
                        'name': team.name,
                        'members': [{'username': player.username} for player in team.members.all()]
                    } for team in teams
                ],
                'matches': [
                    {
                        'id': match.id,
                        'team_a': match.team_a.name,
                        'team_b': match.team_b.name,
                        'scheduled_time': match.scheduled_time.isoformat(),
                        'location': match.location,
                        'is_completed': match.is_completed,
                        'result': match.result
                    } for match in matches
                ]
            }
            
            return JsonResponse(tournament_data, safe=False)
        except Tournament.DoesNotExist:
            return JsonResponse({'error': 'Tournament not found'}, status=404)


class TeamView(APIView):
    def get(self, request):
        teams = Team.objects.all()
        team_list = [
            {
                'id': team.id,
                'name': team.name,
                'member_count': team.members.count(),
                'created_at': team.created_at.isoformat()
            } for team in teams
        ]
        return JsonResponse(team_list, safe=False)
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            name = data.get('name')
            passcode = data.get('passcode')
            
            if not name:
                return JsonResponse({'error': 'Team name is required'}, status=400)
            
            if not passcode:
                return JsonResponse({'error': 'Team passcode is required'}, status=400)
            
            if Team.objects.filter(name=name).exists():
                return JsonResponse({'error': 'Team name already exists'}, status=400)
            
            team = Team.objects.create(name=name, passcode=passcode)
            
            return JsonResponse({
                'id': team.id,
                'name': team.name,
                'created_at': team.created_at.isoformat()
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


class PlayerRegistrationView(APIView):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            phone_number = data.get('phone_number')
            password = data.get('password')
            
            if not username or not phone_number or not password:
                return JsonResponse({
                    'error': 'Username, phone number, and password are required'
                }, status=400)
            
            if Player.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username already exists'}, status=400)
            
            if Player.objects.filter(phone_number=phone_number).exists():
                return JsonResponse({'error': 'Phone number already exists'}, status=400)
            
            player = Player(username=username, phone_number=phone_number)
            player.password = 'pbkdf2_sha256$600000$test$test'  # Dummy hash for now
            player.save()
            
            return JsonResponse({
                'id': player.id,
                'username': player.username,
                'message': 'Registration successful!'
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


class JoinTournamentView(APIView):
    def post(self, request):
        try:
            data = json.loads(request.body)
            tournament_id = data.get('tournament_id')
            team_id = data.get('team_id')
            passcode = data.get('passcode', '')
            
            if not tournament_id or not team_id:
                return JsonResponse({
                    'error': 'Tournament ID and Team ID are required'
                }, status=400)
            
            tournament = Tournament.objects.get(id=tournament_id)
            team = Team.objects.get(id=team_id)
            
            # Verify team passcode if team has one
            if team.passcode and team.passcode != passcode:
                return JsonResponse({'error': 'Invalid team passcode'}, status=403)
            
            if team in tournament.teams.all():
                return JsonResponse({'error': 'Team already joined this tournament'}, status=400)
            
            tournament.teams.add(team)
            
            return JsonResponse({
                'message': f'{team.name} successfully joined {tournament.title}!',
                'tournament_id': tournament.id,
                'team_id': team.id
            }, status=200)
        except Tournament.DoesNotExist:
            return JsonResponse({'error': 'Tournament not found'}, status=404)
        except Team.DoesNotExist:
            return JsonResponse({'error': 'Team not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


class ReportView(APIView):
    def post(self, request):
        try:
            data = json.loads(request.body)
            report_type = data.get('type')  # 'player', 'rule', 'bug'
            description = data.get('description')
            reporter_name = data.get('reporter_name', 'Anonymous')
            
            if not report_type or not description:
                return JsonResponse({
                    'error': 'Report type and description are required'
                }, status=400)
            
            # For now, we'll just acknowledge the report
            # In a real app, you'd save this to a Reports model
            
            return JsonResponse({
                'message': f'Your {report_type} report has been submitted successfully!',
                'reporter': reporter_name,
                'type': report_type
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


class StandingsView(APIView):
    def get(self, request, tournament_id=None):
        # This is a simplified standings calculation
        # In a real app, you'd have a more sophisticated system
        
        if tournament_id:
            try:
                tournament = Tournament.objects.get(id=tournament_id)
                teams = tournament.teams.all()
            except Tournament.DoesNotExist:
                return JsonResponse({'error': 'Tournament not found'}, status=404)
        else:
            teams = Team.objects.all()[:10]
        
        standings = []
        for idx, team in enumerate(teams):
            # Calculate points based on wins (this is simplified)
            wins = Match.objects.filter(
                Q(team_a=team, result__icontains=team.name) |
                Q(team_b=team, result__icontains=team.name),
                is_completed=True
            ).count()
            
            standings.append({
                'rank': idx + 1,
                'team_id': team.id,
                'team_name': team.name,
                'points': 40 - idx,  # Dummy calculation
                'wins': wins,
                'played': Match.objects.filter(
                    Q(team_a=team) | Q(team_b=team),
                    is_completed=True
                ).count()
            })
        
        return JsonResponse(standings, safe=False)


class PlayerLoginView(APIView):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return JsonResponse({
                    'error': 'Username and password are required'
                }, status=400)
            
            try:
                player = Player.objects.get(username=username)
                # For now, we'll just check if player exists
                # In production, you'd verify the password properly
                
                return JsonResponse({
                    'id': player.id,
                    'username': player.username,
                    'message': 'Login successful!'
                }, status=200)
            except Player.DoesNotExist:
                return JsonResponse({'error': 'Invalid username or password'}, status=401)
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


class FixturesView(APIView):
    def get(self, request, tournament_id):
        try:
            tournament = Tournament.objects.get(id=tournament_id)
            matches = tournament.matches.all().order_by('scheduled_time')
            
            fixtures = [
                {
                    'id': match.id,
                    'team_a': {
                        'id': match.team_a.id,
                        'name': match.team_a.name
                    },
                    'team_b': {
                        'id': match.team_b.id,
                        'name': match.team_b.name
                    },
                    'scheduled_time': match.scheduled_time.isoformat(),
                    'location': match.location,
                    'is_completed': match.is_completed,
                    'result': match.result
                } for match in matches
            ]
            
            return JsonResponse(fixtures, safe=False)
        except Tournament.DoesNotExist:
            return JsonResponse({'error': 'Tournament not found'}, status=404)
