from django.core.management.commands.runserver import Command as BaseCommand

class Command(BaseCommand):
    help = 'Runs the development server with a default port of 8080.'

    def add_arguments(self, parser):
        parser.add_argument('addrport', nargs='?', default='8080', help='Optional port number, or ipaddr:port')

    def handle(self, *args, **options):
        # Ensure 'use_ipv6' is set to False in the options dictionary
        options['use_ipv6'] = False
        options['use_reloader'] = True
        options['use_threading'] = False
        options['skip_checks'] = True

        # Call the base class's handle method
        super().handle(*args, **options)
