import logging
import socket

from django import template
from django.conf import settings

register = template.Library()

logger = logging.getLogger(__name__)

AllowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789"


def specialchar2under(value):
    for ch in value:
        if ch not in AllowedChars:
            value = value.replace(ch, "_")
    return value


register.filter('specialchar2under', specialchar2under)


def is_valid_ipv4(ip_str):
    """
    Check the validity of an IPv4 address
    """
    try:
        socket.inet_pton(socket.AF_INET, ip_str)
    except AttributeError:
        try:  # Fall-back on legacy API or False
            socket.inet_aton(ip_str)
        except (AttributeError, socket.error):
            return False
        return ip_str.count('.') == 3
    except socket.error:
        return False
    return True


def is_valid_ipv6(ip_str):
    """
    Check the validity of an IPv6 address
    """
    try:
        socket.inet_pton(socket.AF_INET6, ip_str)
    except socket.error:
        return False
    return True


def is_valid_ip(ip_str):
    """
    Check the validity of an IP address
    """
    return is_valid_ipv4(ip_str) or is_valid_ipv6(ip_str)


# Search for the real IP address in the following order
# Configurable via settings.py
IPWARE_META_PRECEDENCE_ORDER = getattr(settings,
                                       'IPWARE_META_PRECEDENCE_ORDER', (
                                           'HTTP_X_FORWARDED_FOR',
                                           # (client, proxy1, proxy2) OR (proxy2, proxy1, client)
                                           'HTTP_CLIENT_IP',
                                           'HTTP_X_REAL_IP',
                                           'HTTP_X_FORWARDED',
                                           'HTTP_X_CLUSTER_CLIENT_IP',
                                           'HTTP_FORWARDED_FOR',
                                           'HTTP_FORWARDED',
                                           'HTTP_VIA',
                                           'REMOTE_ADDR',
                                       )
                                       )

# Private IP addresses
# http://en.wikipedia.org/wiki/List_of_assigned_/8_IPv4_address_blocks
# http://www.ietf.org/rfc/rfc3330.txt (IPv4)
# http://www.ietf.org/rfc/rfc5156.txt (IPv6)
# Regex would be ideal here, but this is keeping it simple
# as fields are configurable via settings.py
IPWARE_PRIVATE_IP_PREFIX = getattr(settings,
                                   'IPWARE_PRIVATE_IP_PREFIX', (
                                       '0.',  # externally non-routable
                                       '10.',  # class A private block
                                       '169.254.',  # link-local block
                                       '172.16.', '172.17.', '172.18.', '172.19.',
                                       '172.20.', '172.21.', '172.22.', '172.23.',
                                       '172.24.', '172.25.', '172.26.', '172.27.',
                                       '172.28.', '172.29.', '172.30.', '172.31.',  # class B private blocks
                                       '192.0.2.',  # reserved for documentation and example code
                                       '192.168.',  # class C private block
                                       '255.255.255.',  # IPv4 broadcast address
                                   ) + (
                                       '2001:db8:',  # reserved for documentation and example code
                                       'fc00:',  # IPv6 private block
                                       'fe80:',  # link-local unicast
                                       'ff00:',  # IPv6 multicast
                                   )
                                   )

IPWARE_LOOPBACK_PREFIX = (
    '127.',  # IPv4 loopback device
    '::1',  # IPv6 loopback device
)

IPWARE_NON_PUBLIC_IP_PREFIX = IPWARE_PRIVATE_IP_PREFIX + IPWARE_LOOPBACK_PREFIX

NON_PUBLIC_IP_PREFIX = tuple([ip.lower() for ip in IPWARE_NON_PUBLIC_IP_PREFIX])


def is_internal_ip(rMeta):
    """
    Returns client's best-matched ip-address, or None
    """
    for key in IPWARE_META_PRECEDENCE_ORDER:
        try:
            value = rMeta.get(key, '').strip()
        except AttributeError:
            return False
        if value != '':
            ips = [ip.strip().lower() for ip in value.split(',')]
            for ip_str in ips:
                if ip_str and is_valid_ip(ip_str):
                    loopback = IPWARE_LOOPBACK_PREFIX
                    if ip_str.startswith(NON_PUBLIC_IP_PREFIX) or ip_str.startswith(loopback):
                        try:
                            hostname = socket.gethostbyaddr(ip_str)
                            if isinstance(hostname, tuple) and hostname[0] and hostname[0].endswith("ebi.ac.uk"):
                                return True
                        except socket.herror as e:
                            logger.error(e)
                            return False

    return False


register.filter('is_internal_ip', is_internal_ip)
