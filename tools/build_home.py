#!/usr/bin/env python3
"""Generates index.html. Run from repo root: python3 tools/build_home.py"""
import re, ast, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from build_houses import SHELL_HEAD, FOOT, HOUSES, proj, DOHA, LOGO, MENU_LOGOS, MOTIF, VERSION

VID = "https://worldofhospitality.com.qa/wp-content/uploads/"
H = [
 dict(slug="gunaydin", name="Günaydın", logo=LOGO['gunaydin'], cls="",
      video=VID+"2026/03/Gunaydin-Website-Video-1-1.mp4", poster="images/brands/gunaydin-1.jpg", still="images/brands/gunaydin-2.jpg",
      origin="Istanbul, 1961", status="Open", line="Istanbul's celebrated et lokantası, plated in Doha.",
      text="A meat house before it was a restaurant. Dry-aged in its own rooms, butchered by hand, finished over charcoal. The first house we opened in Doha, in 2019, and still open.",
      facts=[("Cuisine","Turkish steakhouse"),("Address","Place Vendôme, Lusail"),("Status","Open")], caps=("The grill","The room")),
 dict(slug="kumar", name="Kumar", logo=LOGO['kumar'], cls="",
      video=VID+"2026/03/Kumar-Website-Video-1-1.mp4", poster="images/brands/kumar-1.jpg", still="images/brands/kumar-2.jpg",
      origin="Kuwait, with MK Group", status="Open", line="A modern Indian table. Regional, warm, considered.",
      text="India by region, not by stereotype. Coastal Kerala, Lucknowi dum biryani, Bombay street plates. Service trained to MK Group's Kuwait standards.",
      facts=[("Cuisine","Modern Indian"),("Address","Place Vendôme, Lusail"),("Status","Open")], caps=("The table","The room")),
 dict(slug="al-beiruti", name="Al Beiruti", logo=LOGO['al-beiruti'], cls="",
      video=VID+"2026/03/IMG_5377-3.mp4", poster="images/brands/al-beiruti-spread.jpg", still="images/brands/al-beiruti-mezze.jpg",
      origin="Beirut", status="Just opened", line="A Beirut neighbourhood story, coming home.",
      text="A long table for the city. Mezze the old way, bread out of the saj every twelve minutes, charcoal until late. One hundred and eighty seats and a terrace.",
      facts=[("Cuisine","Lebanese, Levantine"),("Seating","180 and terrace"),("Status","Just opened")], caps=("The spread","Mezze")),
 dict(slug="eleven-green", name="Eleven Green", logo=LOGO['eleven-green'], cls="",
      video=VID+"2026/05/IMG_7763-1.mp4", poster="images/brands/eleven-green-1.jpg", still="images/brands/eleven-green-2.jpg",
      origin="Dubai, 2023", status="Opening soon", line="The Bull Burger is in town.",
      text="A homegrown burger bistro from Dubai's Chatila family. Hand-pressed patties ground fresh daily, Hokkaido milk bun, house bacon jam, the signature Bull sauce.",
      facts=[("Cuisine","Burger bistro"),("Signature","The Bull Burger"),("Status","Opening soon")], caps=("The Bull","The cut"), ph=True),
 dict(slug="brunch-cake", name="Brunch &amp; Cake", logo=LOGO['brunch-cake'], cls="",
      video="", poster="images/brands/brunch-cake-1.jpg", still="images/brands/brunch-cake-2.jpg",
      origin="Barcelona, 2010", status="Late 2026", line="Grandma's goodness, thoughtfully served.",
      text="Born in Barcelona in 2010, now in twenty-three destinations across Spain, the Gulf, Egypt and India. Wholesome plates, generous portions, unmistakable rooms.",
      facts=[("Cuisine","All-day, Mediterranean"),("Worldwide","23 locations"),("Status","Late 2026")], caps=("The room","The morning"), ph=True),
]

def world_svg():
    dx,dy = proj(*DOHA); grid=""
    for lon in range(0,61,10):
        x=lon/60*1000; grid+=f'<line x1="{x}" y1="0" x2="{x}" y2="420"/>'
    for lat in range(20,46,5):
        y=(45-lat)/25*420; grid+=f'<line x1="0" y1="{y}" x2="1000" y2="{y}"/>'
    paths=pts=labs=""
    for h in HOUSES:
        ox,oy=proj(h['lat'],h['lon']); cx,cy=(ox+dx)/2, min(oy,dy)-90
        paths+=f'<path class="route__path" d="M{ox} {oy} Q{cx} {cy} {dx} {dy}" pathLength="1"/>'
        pts+=f'<g class="route__pt"><circle cx="{ox}" cy="{oy}" r="3.5"/></g>'
        anchor="end" if ox>500 and abs(ox-dx)>60 else "start"; ddx=-12 if anchor=="end" else 12; ly=oy-12
        if h['slug']=='eleven-green': anchor="start"; ddx=12; ly=oy+30
        labs+=f'<text class="route__lab" x="{ox+ddx}" y="{ly}" text-anchor="{anchor}">{h["origin"]}</text>'
    return f'''<svg class="route__svg" viewBox="0 0 1000 420" width="1000" height="420" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g class="route__grid">{grid}</g>{paths}{pts}
  <g class="route__pt route__pt--doha"><circle cx="{dx}" cy="{dy}" r="4.5"/><circle class="route__halo" cx="{dx}" cy="{dy}" r="14"/></g>{labs}
  <text class="route__lab" x="{dx+16}" y="{dy+8}">Doha</text>
</svg>'''

VEIL = '''<div class="veil" id="veil" aria-hidden="true">
  <div class="veil__cuts">{CUTS}</div>
  <div class="veil__flash"></div>
  <img class="veil__mark" src="images/woh-logo.png" alt="" width="240" height="80">
</div>'''

def wall_panel(h):
    media = (f'<video muted loop playsinline preload="metadata" poster="{h["poster"]}"><source src="{h["video"]}" type="video/mp4"></video>' if h['video'] else f'<img src="{h["poster"]}" alt="">')
    return f'''  <a class="wall__panel" href="{h['slug']}.html" data-house="{h['slug']}">
    <div class="wall__media">{media}</div>
    <div class="wall__logo {h['cls']}">{h['logo']}</div>
    <div class="wall__foot"><span class="wall__name">{h['name']}</span><span class="wall__meta">{h['origin']}. {h['status']}.</span></div>
  </a>'''

def house_band(h):
    logo = h['logo'].replace('class="wall__logo--type"','class="house__logo house__logo--type"')
    if '<img' in logo: logo = logo.replace('<img ', f'<img class="house__logo house__logo--{h["slug"]}" ')
    facts="".join(f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k,v in h['facts'])
    flag='<span class="house__flag">Placeholder image</span>' if h.get('ph') else ''
    media1 = (f'<video muted loop playsinline preload="none" poster="{h["poster"]}"><source src="{h["video"]}" type="video/mp4"></video>' if h['video'] else f'<img src="{h["poster"]}" alt="{h["name"]}" loading="lazy">')
    return f'''<article class="house" id="{h['slug']}">
  <div class="house__copy" data-reveal>
    {logo}
    <h3 class="house__name"><a href="{h['slug']}.html">{h['name']}</a></h3>
    <p class="house__line">{h['line']}</p>
    <p class="house__text">{h['text']}</p>
    <dl class="house__facts">{facts}</dl>
    <a class="link" href="{h['slug']}.html">Visit the house</a>
  </div>
  <div class="house__media" data-reveal>
    <figure>{media1}{flag}<figcaption>{h['caps'][0]}</figcaption></figure>
    <figure><img src="{h['still']}" alt="{h['name']}, {h['caps'][1].lower()}" loading="lazy">{flag}<figcaption>{h['caps'][1]}</figcaption></figure>
  </div>
</article>'''

def reel_slide(h, i):
    media = f'<img src="{h["poster"]}" alt="" loading="lazy">'
    logo = f'<span class="reel__logo">{h["logo"]}</span>'
    flag = '<span class="house__flag">Placeholder image</span>' if h.get('ph') else ''
    return f'''  <a class="reel__slide" href="{h['slug']}.html" data-house="{h['slug']}">
    <div class="reel__media">{media}{flag}</div>
    <div class="reel__copy">
      {logo}
      <span class="reel__line">{h['line']}</span>
      <span class="reel__meta">{h['origin']}. {h['status']}.</span>
      <span class="reel__go">Enter the house</span>
    </div>
    <span class="reel__count">{i+1} / {len(H)}</span>
  </a>'''

def build():
    head = SHELL_HEAD.format(title="Home", desc="World of Hospitality operates five restaurant houses in Doha. Günaydın, Kumar, Al Beiruti, Eleven Green, Brunch &amp; Cake.")
    head = head.replace('MENU_LOGOS_HERE', MENU_LOGOS).replace('<title>Home · World of Hospitality</title>','<title>World of Hospitality</title>')
    head = head.replace('class="is-loading house-page"','class="is-loading"')
    head = head.replace('<a href="index.html#houses" aria-current="page">Houses</a>','<a href="index.html#houses">Houses</a>')
    cuts = ''.join(f'<div class="veil__cut" data-house="{x["slug"]}"><img src="{x["poster"]}" alt=""><span class="veil__cutlogo">{x["logo"]}</span></div>' for x in H)
    head = head.replace('<div class="veil veil--quick" id="veil" aria-hidden="true"></div>', VEIL.replace('{CUTS}', cuts))
    panels="\n".join(wall_panel(h) for h in H); reel="\n".join(reel_slide(h,i) for i,h in enumerate(H))
    marq=''.join(f'<a href="{x["slug"]}.html" class="marquee__item proof__logo proof__logo--{x["slug"]}">{LOGO[x["slug"]].replace("wall__logo--type","proof__type")}</a><span class="marquee__dot"></span>' for x in HOUSES) + '<a href="partnerships.html" class="marquee__item marquee__next">More houses to come<em>Yours, if it belongs here</em></a><span class="marquee__dot"></span>'
    logos=''.join(f'<a href="{x["slug"]}.html" class="proof__logo proof__logo--{x["slug"]}">{LOGO[x["slug"]].replace("wall__logo--type","proof__type")}</a>' for x in HOUSES)
    body = f"""
<!-- ============ WALL: the five houses ============ -->
<section class="wall" id="wall" aria-label="The houses">
{panels}
</section>

<!-- ============ NUMBERS over film ============ -->
<section class="numbers" id="ledger">
  <div class="numbers__media"><img src="images/material/stone.jpg" alt="" loading="lazy"></div>
  <div class="numbers__motif" data-reveal>{MOTIF}</div>
  <div class="numbers__row">
    <div data-reveal><span class="numbers__num" data-count="5">0</span><span class="numbers__lab">houses in Doha</span></div>
    <div data-reveal><span class="numbers__num" data-count="2019">2000</span><span class="numbers__lab">first house, still open</span></div>
    <div data-reveal><span class="numbers__num" data-count="5">0</span><span class="numbers__lab">cities brought to Qatar</span></div>
    <div data-reveal><span class="numbers__num" data-count="0">0</span><span class="numbers__lab">concepts closed</span></div>
  </div>
</section>

<!-- ============ REEL: each house, full screen ============ -->
<section class="reel" id="houses" aria-label="The houses, one by one">
{reel}
</section>

<!-- ============ MARQUEE: the houses, and the next one ============ -->
<section class="marquee" id="about" aria-label="The houses">
  <div class="marquee__track">{marq}{marq}</div>
</section>

<!-- ============ CLOSE over film ============ -->
<section class="finale" id="close">
  <div class="finale__media">
    <video muted loop playsinline preload="none" poster="images/brands/al-beiruti-spread.jpg"><source src="{VID}2026/03/IMG_5377-3.mp4" type="video/mp4"></video>
  </div>
  <div class="finale__copy">
    <img src="images/woh-logo.png" alt="World of Hospitality" width="240" height="80" data-reveal>
    <p data-reveal>Bringing a brand to Doha?</p>
    <a href="partnerships.html" class="close__cta" data-reveal>Start with a call</a>
  </div>
  <div class="finale__logos" data-reveal>{logos}</div>
</section>
"""
    return head + body + FOOT.replace('js/site.js','js/home.js').replace('MOTIF_HERE', MOTIF)

if __name__ == "__main__":
    open("index.html","w").write(build()); print("wrote index.html")
