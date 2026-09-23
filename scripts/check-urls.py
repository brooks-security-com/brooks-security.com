#!/usr/bin/env python3
"""Check a Hugo build for the URLs the site promises to keep.

  python3 scripts/check-urls.py [hugo/public]

Fails (exit 1) when any of these is missing from the build output:
  - a URL in the redesign's URL map (specs/site-redesign/README.md)
  - a page listed in sitemap.xml, or one of the site's feeds
  - the target of an internal link, #anchor, image, poster, script, or
    stylesheet on any page, or of a url() in the CSS
  - a graph node's URL or #anchor (js/graph.*.js)
Paths are matched case-sensitively, as S3 keys are. It also fails on an internal
page link without a trailing slash (the CloudFront function turns /posts into
/postsindex.html, a 403) and on a graph label that still carries HTML or Go
format junk. Standard library only.
"""
import glob, html.parser, json, os, re, sys, urllib.parse

PUBLIC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'hugo', 'public')
CONTENT = os.path.join(os.path.dirname(__file__), '..', 'hugo', 'content')
SITE_HOSTS = {'www.brooks-security.com', 'brooks-security.com'}

URL_MAP = [
    '/', '/docs/curriculum-vitae/', '/docs/curriculum-vitae/work-experience/',
    '/docs/curriculum-vitae/credentials/', '/docs/curriculum-vitae/platforms/',
    '/docs/portfolio/', '/docs/portfolio/gitops/', '/docs/portfolio/security/',
    '/docs/portfolio/ai-agents/', '/docs/portfolio/automation/', '/docs/portfolio/x-as-code/',
    '/docs/portfolio/speaking/', '/docs/portfolio/running-a-poc/', '/posts/',
    '/docs/contact/', '/resume/',
    # Not in the map, but live today and linked from outside:
    '/docs/', '/tags/', '/categories/', '/404.html',
    '/posts/how-im-developing-my-career-the-power-of-goal-oriented-learning-copy/',
    '/index.xml', '/posts/index.xml', '/sitemap.xml', '/downloads/graham-brooks-resume.txt',
    '/posts/page/1/', '/posts/page/2/', '/images/presentation-poster.jpg', '/grahambrooks.png',
]

failures = []
fail = failures.append
# Every published key, exactly as S3 would store it (so /Docs/ and /docs/ differ even on macOS).
KEYS = {os.path.relpath(os.path.join(d, f), PUBLIC).replace(os.sep, '/') for d, _, fs in os.walk(PUBLIC) for f in fs}


def key_for(path):
    """The S3 key CloudFront would fetch for a URL path, after its pretty-URL rewrite."""
    path = urllib.parse.unquote(path)
    return path.lstrip('/') + ('index.html' if path.endswith('/') else '')


def file_for(path):
    return os.path.join(PUBLIC, key_for(path))


class Page(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links = set(), []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.add(a['id'])
        if tag == 'a' and a.get('href'):
            self.links.append(a['href'])
        for attr in ('src', 'poster') + (('href',) if tag == 'link' else ()):
            if a.get(attr):
                self.links.append(a[attr])
        for part in (a.get('srcset') or '').split(','):
            if part.strip():
                self.links.append(part.split()[0])


pages = {}
def parse(path):
    if path not in pages:
        p = Page()
        with open(file_for(path), encoding='utf-8') as f:
            p.feed(f.read())
        pages[path] = p
    return pages[path]


def check(url, where, fragment=True):
    """url is a site path, optionally with a #fragment."""
    path, _, frag = url.partition('#')
    if key_for(path) not in KEYS:
        fail(f'{where}: {url} is not in the build')
    elif not fragment:
        return
    elif frag and path.endswith('/') and urllib.parse.unquote(frag) not in parse(path).ids:
        fail(f'{where}: {url} points at a missing #{frag}')


# 1. The URL map and the other promised URLs.
for url in URL_MAP:
    check(url, 'URL map')

# 2. Every page in the sitemap, and every post in the content.
with open(os.path.join(PUBLIC, 'sitemap.xml'), encoding='utf-8') as f:
    locs = [urllib.parse.urlparse(u).path for u in re.findall(r'<loc>([^<]+)</loc>', f.read())]
for path in locs:
    check(path, 'sitemap.xml')
posts = [p for p in glob.glob(os.path.join(CONTENT, 'posts', '*.md')) if not p.endswith('_index.md')]
if len({p for p in locs if re.fullmatch(r'/posts/[^/]+/', p)}) < len(posts):
    fail(f'sitemap.xml lists fewer post pages than hugo/content/posts has posts ({len(posts)})')

# 3. Every internal link and anchor on every page.
for file in glob.glob(os.path.join(PUBLIC, '**', '*.html'), recursive=True):
    page = '/' + os.path.relpath(file, PUBLIC).replace(os.sep, '/').removesuffix('index.html')
    for href in parse(page).links:
        u = urllib.parse.urlparse(href)
        if u.scheme in ('mailto', 'tel') or (u.netloc and u.netloc not in SITE_HOSTS):
            continue
        if u.path.startswith('/downloads/') and u.path.endswith('.mp4'):
            continue  # uploaded out of band, excluded from hugo deploy
        path = urllib.parse.urljoin(page, u.path) if u.path else page
        if path.startswith('/api/'):
            continue  # served by API Gateway, not the bucket
        if not path.endswith('/') and '.' not in path.rsplit('/', 1)[-1]:
            fail(f'{page}: link {href} has no trailing slash, which CloudFront turns into a 403')
            continue
        check(path + ('#' + u.fragment if u.fragment else ''), page)

# 4. Every url() in the stylesheets (the self-hosted fonts).
for css in glob.glob(os.path.join(PUBLIC, 'css', '*.css')):
    with open(css, encoding='utf-8') as f:
        for ref in re.findall(r'url\(\s*["\']?(/[^)"\']+)', f.read()):
            check(ref, os.path.relpath(css, PUBLIC))

# 5. Every graph node, and its labels.
manifests = glob.glob(os.path.join(PUBLIC, 'js', 'graph.*.js'))
if len(manifests) != 1:
    fail(f'expected one js/graph.*.js manifest, found {len(manifests)}')
else:
    with open(manifests[0], encoding='utf-8') as f:
        text = f.read()
    graph = json.loads(text[text.index('=') + 1:text.rindex(';')])
    for n in graph['nodes']:
        # Contact items highlight their link (n.match) rather than an id, so their #fragment has no target.
        check(n['url'], f'graph node {n["id"]}', fragment='match' not in n)
        for key in ('label', 'short', 'meta'):
            if re.search(r'&[a-z#0-9]+;|<|%!', n.get(key) or ''):
                fail(f'graph node {n["id"]}: {key} is not clean text: {n.get(key)!r}')

if failures:
    print('\n'.join(failures))
    print(f'\n{len(failures)} problem(s)')
    sys.exit(1)
print(f'OK: the URL map, {len(locs)} sitemap pages, links on {len(pages)} pages, and every graph node resolve.')
