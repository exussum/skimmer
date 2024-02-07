from urllib.parse import urlencode, urlsplit, urlunsplit


def build_url(base, **params):
    parts = urlsplit(base)
    return urlunsplit(parts[:3] + (urlencode(tuple(params.items())),) + parts[4:])
