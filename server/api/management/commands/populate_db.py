from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import Player, Team, Announcement, Match, Tournament


class Command(BaseCommand):
    help = 'Populate database with dummy data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating dummy data...')

        # Clear existing data (optional)
        Match.objects.all().delete()
        Tournament.objects.all().delete()
        Announcement.objects.all().delete()
        Team.objects.all().delete()
        Player.objects.filter(is_superuser=False).delete()

        # Create Players
        players = []
        player_names = [
            'john_doe', 'jane_smith', 'mike_ross', 'sarah_connor', 'tony_stark',
            'bruce_wayne', 'peter_parker', 'clark_kent', 'diana_prince', 'barry_allen',
            'hal_jordan', 'wade_wilson', 'steve_rogers', 'natasha_romanoff', 'clint_barton',
            'wanda_maximoff', 'vision_android', 'sam_wilson', 'bucky_barnes', 'scott_lang'
        ]
        
        for name in player_names:
            player = Player(
                username=name,
                phone_number=f'+1234567{players.__len__():04d}'
            )
            # Use a simple password for testing
            player.password = 'pbkdf2_sha256$600000$test$test'  # Dummy hash
            player.save()
            players.append(player)
            self.stdout.write(f'Created player: {name}')

        # Create Teams
        teams = []
        team_data = [
            ('Raptors', players[0:4]),
            ('Warriors', players[4:8]),
            ('Lakers', players[8:12]),
            ('Bulls', players[12:16]),
            ('Heat', players[16:20]),
            ('Celtics', players[0:4]),
            ('Nets', players[4:8]),
            ('Mavericks', players[8:12]),
        ]

        for team_name, team_members in team_data:
            team = Team.objects.create(name=team_name, passcode=f'{team_name.lower()}123')
            team.members.set(team_members)
            teams.append(team)
            self.stdout.write(f'Created team: {team_name} with {len(team_members)} members')

        # Create Announcements
        announcements_data = [
            {
                'title': 'Welcome to DLS 2026!',
                'content': 'We are excited to announce the start of the 2026 tournament season. Register your teams now and compete for amazing prizes!',
                'expires_at': timezone.now() + timedelta(days=30)
            },
            {
                'title': 'New Tournament Rules',
                'content': 'Please review the updated tournament rules. All teams must comply with the new fair play guidelines.',
                'expires_at': timezone.now() + timedelta(days=15)
            },
            {
                'title': 'Prize Pool Increased!',
                'content': 'Great news! The prize pool for the Central Finest tournament has been increased to $10,000. Don\'t miss your chance to win!',
                'expires_at': timezone.now() + timedelta(days=20)
            },
            {
                'title': 'Registration Deadline Reminder',
                'content': 'Only 5 days left to register for the upcoming tournaments. Make sure your team is signed up before the deadline!',
                'expires_at': timezone.now() + timedelta(days=5)
            },
            {
                'title': 'Match Schedule Updated',
                'content': 'The match schedule has been updated. Please check your team\'s schedule and confirm your availability.',
                'expires_at': timezone.now() + timedelta(days=10)
            },
        ]

        for ann_data in announcements_data:
            announcement = Announcement.objects.create(**ann_data)
            self.stdout.write(f'Created announcement: {announcement.title}')

        # Create Matches
        matches = []
        for i in range(12):
            match = Match.objects.create(
                team_a=teams[i % len(teams)],
                team_b=teams[(i + 1) % len(teams)],
                scheduled_time=timezone.now() + timedelta(days=i+1, hours=i*2),
                location=f'Court {(i % 4) + 1}',
                is_completed=i < 6,  # First 6 matches are completed
                result=f'{teams[i % len(teams)].name} wins' if i < 6 else None
            )
            matches.append(match)
            self.stdout.write(f'Created match: {match}')

        # Create Tournaments
        tournaments_data = [
            {
                'title': 'Central Finest',
                'start_date': timezone.now().date(),
                'end_date': (timezone.now() + timedelta(days=30)).date(),
                'entry_fee': 700.00,
                'teams': teams[0:5],
                'matches': matches[0:4]
            },
            {
                'title': 'Happy New 2026',
                'start_date': (timezone.now() + timedelta(days=10)).date(),
                'end_date': (timezone.now() + timedelta(days=40)).date(),
                'entry_fee': 850.00,
                'teams': teams[2:7],
                'matches': matches[4:8]
            },
            {
                'title': 'Best of the Best',
                'start_date': (timezone.now() + timedelta(days=20)).date(),
                'end_date': (timezone.now() + timedelta(days=50)).date(),
                'entry_fee': 1000.00,
                'teams': teams[3:8],
                'matches': matches[8:12]
            },
            {
                'title': 'Winter Championship',
                'start_date': (timezone.now() + timedelta(days=5)).date(),
                'end_date': (timezone.now() + timedelta(days=35)).date(),
                'entry_fee': 500.00,
                'teams': teams[0:6],
                'matches': []
            },
        ]

        for tourn_data in tournaments_data:
            tournament = Tournament.objects.create(
                title=tourn_data['title'],
                start_date=tourn_data['start_date'],
                end_date=tourn_data['end_date'],
                entry_fee=tourn_data['entry_fee']
            )
            tournament.teams.set(tourn_data['teams'])
            tournament.matches.set(tourn_data['matches'])
            self.stdout.write(f'Created tournament: {tournament.title}')

        self.stdout.write(self.style.SUCCESS('Successfully populated database with dummy data!'))
