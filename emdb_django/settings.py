# Django settings for development project.
# -*- coding: utf-8 -*-
import os
from datetime import datetime, date, timedelta
from pytz import timezone, utc

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('Andrii Iudin', ''),
)

# SERVER_EMAIL = "andrii@ebi.ac.uk"
SERVER_EMAIL = ""

MANAGERS = ADMINS

DATABASES = {
}

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
)


# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'Europe/London'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale
USE_L10N = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = ''

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = ''

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = ''

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = '/static/'

# URL prefix for admin static files -- CSS, JavaScript and images.
# Make sure to use a trailing slash.
# Examples: "http://foo.com/static/admin/", "/static/admin/".
ADMIN_MEDIA_PREFIX = '/static/admin/'

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    '/nfs/public/ro/pdbe_shape/static',
    os.path.join(os.path.dirname(__file__), 'static').replace('\\', '/'),
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'ii-5a0r=u1q@219@$g+tcqil(!w-54wj)x=_$krsd1ua@!8skk'

ROOT_URLCONF = 'urls'

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(os.path.dirname(__file__), 'templates').replace('\\', '/'),
    os.path.join(os.path.dirname(__file__), 'empiar', 'templates').replace('\\', '/'),
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.request',
    'django.contrib.auth.context_processors.auth',
    'django.contrib.messages.context_processors.messages',
)

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(os.path.dirname(__file__), 'templates').replace('\\', '/'),
            os.path.join(os.path.dirname(__file__), 'core', 'templates').replace('\\', '/'),
            os.path.join(os.path.dirname(__file__), 'empiar', 'templates').replace('\\', '/'),

        ],
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.i18n',
                'django.template.context_processors.media',
                'django.template.context_processors.static',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
            'loaders': [
                'django.template.loaders.filesystem.Loader',
                'django.template.loaders.app_directories.Loader',
            ]
        },
    }
]

# List of test users' emails that should not be displayed in rights granting menu
TESTUSER_LIST = []

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'empiar',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'sslserver',
)

LOCAL_HOSTS = ()

ALLOWED_HOSTS = [
    '127.0.0.1',
    'localhost'
]


# Type of cookie: it specifies where the content associated with the cookie is stored.
SESSION_ENGINE = 'django.contrib.sessions.backends.signed_cookies'
SESSION_COOKIE_HTTPONLY = True

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

# Values for IP-specific throttling using django-ratelimit package
RATE_LIMIT = '24000/h'
BURST_RATE_LIMIT = '5000/m'

class EMDBGlobal:
    """
    Stores global constants used by EMDB Python files.
    These are class variables, not instance variables and should be used as:
    EMDBGlobal.xxxx. In other words - DO NOT DEFINE AN INSTANCE OF EMDBGlobal!!
    """

    # prod, dev, stag, empiar_deposition_dev, empiar_deposition_prod, Japan
    emdb_env = 'Japan'
    
    # mysql db name
    pdbeshape_db = 'pdbeshapedev'
    
    # Emails
    help_email = '    @ebi.ac.uk'
    empiar_help_email = 'empdep-help@ebi.ac.uk'
    
    # Helpful constants and lists
    lte = u"\u2264"
    angstrom = u"\u212B"
    today = date.today()

    release_date = today - timedelta(days=(7 + (today.weekday()-2) % 7))

    local_tz = timezone('Europe/London')
    naive_release_datetime = datetime.combine(release_date, datetime.min.time())
    local_release_datetime = local_tz.localize(naive_release_datetime, is_dst=None)
    utc_release_datetime = local_release_datetime.astimezone(utc).strftime("%Y-%m-%dT%H:%M:00.000Z")
    
    # List of years since EMDB started - useful for statistics queries
    year_list = [y for y in range(2002, date.today().year + 1)]

    # List of years since EMPIAR started - useful for statistics queries
    empiar_year_list = [y for y in range(2013, date.today().year + 1)]
    
    # Google analytics
    google_analytics_id = 'UA-16614786-X'
    
    # External links
    ncbiTaxIdPrefix = "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id="

    # Paths
    ebi_root = '//127.0.0.1:8000'
    srv_root = '//wwwdev.ebi.ac.uk/pdbe'
    project_root = '//127.0.0.1:8000'
    project_rel_root = ''
    host = project_root
    static_rel_path = '/static'

    static_images = os.path.join(static_rel_path, 'images')

    emdb_entry_path = '/pdbe/entry'
    pdb_entry_path = '/pdbe-srv/view/entry'

    # Short form pdbe URLs
    pdbe_short = '//pdbe.org'
    pdbe_emdb = os.path.join(pdbe_short, 'emdb')
    pdbe_empiar = os.path.join(pdbe_short, 'empiar')

    # Paths for publications
    doi_prefix = '//dx.doi.org/doi:'
    pubmed_prefix = '//europepmc.org/abstract/MED/'

    # Ftp site
    ftp_server = 'ftp.ebi.ac.uk'
    ftp_dir = '/pub/databases/emtest'
    ftp_path = '/nfs/ftp/pub/databases/emtest'

    # Javascript libraries
    jquery_dir = os.path.join(static_rel_path, 'inc/jquery')
    jquery = os.path.join(jquery_dir, 'jquery-1.11.1.min.js')
    jquery_datatables = os.path.join(jquery_dir, 'extlib', 'DataTables-1.10.1', 'media/js/jquery.dataTables.min.js')
    jquery_extlib = os.path.join(jquery_dir, 'extlib')

    # EMPIAR settings
    # *_dir is for FTP access, *_path* - for NFS access, *_dep - a separate set of variables for Deposition/Annotation
    # system, that have analagous values in the main EMPIAR page/entry pages to allow testing of the
    # Deposition/Annotation while still having the functionality of the main EMPIAR page/entry pages
    static_empiar_path = os.path.join(static_rel_path, 'empiar')
    aspera_download_connect_path = 'http://downloads.asperasoft.com/download_connect/'
    empiar_icon_url = os.path.join(srv_root, 'emdb-empiar/entryIcons')
    empiar_json_dir = os.path.join(ftp_dir, 'empiar')

    ftp_empiar_public_host = 'ftp.ebi.ac.uk'
    ftp_empiar_public_dir = '/pub/databases/empiar'
    empiar_public_archive_dir = os.path.join(ftp_empiar_public_dir, 'archive')
    empiar_obsolete_archive_dir = os.path.join(ftp_empiar_public_dir, 'obsolete_archive')

    empiar_emp_dep_path = '/nfs/production3/pdbe-empiar/aspera/emp_dep/'
    ftp_empiar_public_archive = os.path.join('ftp://', ftp_empiar_public_host, empiar_public_archive_dir.strip(os.sep))
    ftp_empiar_obsolete_archive = os.path.join('ftp://', ftp_empiar_public_host,
                                               empiar_obsolete_archive_dir.strip(os.sep))
    empiar_archive_path = os.path.join('/nfs/ftp', empiar_public_archive_dir.strip(os.sep))
    empiar_thumbnails_path = os.path.join('/nfs/ftp', ftp_empiar_public_dir.strip(os.sep), 'thumbnails')

    ftp_empiar_public_path = '/nfs/ftp/pub/databases/empiar'

    empiar_json_file = 'empiar_out.json'
    empiar_json_path = os.path.join('/nfs/ftp/pub/databases/emtest/empiar', empiar_json_file)
    empiar_json_path_dep = '/nfs/tmp/test.json'
    empiar_json_url = os.path.join(project_root, 'empiar_json')
    empiar_json_dirstruct_dir = os.path.join(ftp_dir, 'empiar/directoryStructures')
    empiar_json_dirstruct_path = os.path.join(ftp_path, 'empiar/directoryStructures')
    empiar_headers_dir = os.path.join(ftp_dir, 'empiar/headers')
    empiar_headers_path = '/nfs/tmp/headers'
    empiar_entry = os.path.join(project_root, 'empiar/entry/')

    aspera_token_username = ''
    aspera_token_password = ''
    aspera_token_url = ''

    # EMPIAR 3D settings
    static_empiar3d_path = os.path.join(static_rel_path, 'empiar3d')
    omero_database_string = "dbname='' user='' password='' host='' port=''"

    # Important urls for Japan
    empiar_citations_url = 'https://www.ebi.ac.uk/pdbe/emdb/empiar/api/latest_citations/'
    empiar_deposition_url = 'https://www.ebi.ac.uk/pdbe/emdb/empiar/deposition/'
    empiar_api_doc_url = 'https://www.ebi.ac.uk/pdbe/emdb/empiar/api/documentation/'
    empiar_api_url = 'https://www.ebi.ac.uk/pdbe/emdb/empiar/api/'
    empiar_api_entry_url = os.path.join(empiar_api_url, 'entry/')

    aspera_token_username = ''
    aspera_token_password = ''
    aspera_token_url = ''
    aspera_upload_server = ''
    aspera_download_authentication = ''
    apsera_target_rate_kbps = 200000
    aspera_rate_policy = ''
    aspera_cipher = ''
    aspera_download_connect_path = ''
    aspera_upload_directory_prefix = ''