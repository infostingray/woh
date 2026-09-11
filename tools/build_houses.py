#!/usr/bin/env python3
"""Generates the five house pages. Run from repo root."""
import html, os
VERSION = os.environ.get("WOH_VERSION", "dev")
CB = VERSION.split(" ")[0].lstrip("v") or "dev"

VID = "https://worldofhospitality.com.qa/wp-content/uploads/"

def live_tag(status):
    """Recording-dot style status: pulsing for open houses, hollow standby for the rest."""
    s = status.lower()
    live = s in ("open", "just opened")
    return f'<span class="live{"" if live else " live--soon"}"><i></i>{status}</span>'
DOHA = (25.29, 51.53)

HOUSES = [
 dict(slug="gunaydin", name="Günaydın", short="Günaydın",
      logo="gunaydin",
      origin="Istanbul", founded="1961", lat=41.01, lon=28.98,
      line="Istanbul's celebrated et lokantası, plated in Doha.",
      story=[
        "Günaydın was a meat house before it was a restaurant. Founded in Istanbul in 1961, it dry-ages in its own rooms, butchers by hand and finishes over charcoal.",
        "The Doha kitchen carries the same standards. Same cuts, same fire, same patience. It was the first house we opened here, in 2019, and it is still open.",
      ],
      facts=[("Cuisine","Turkish steakhouse"),("Origin","Istanbul, 1961"),("In Doha","Since 2019"),("Address","Place Vendôme, Lusail"),("Partner","Günaydın Et"),("Status","Open")],
      video=VID+"2026/03/Gunaydin-Website-Video-1-1.mp4", poster="images/brands/gunaydin-1.jpg",
      gallery=[("images/brands/gunaydin-1.jpg","The grill"),("images/brands/gunaydin-2.jpg","The room"),("images/brands/gunaydin-3.jpg","The cut")],
      links=[("Günaydın Et","https://gunaydinet.com/")],
      cta=("Reserve a table","tel:+97470323311"),
      placeholder=False),
 dict(slug="kumar", name="Kumar", short="Kumar",
      logo="kumar",
      origin="Kuwait", founded="MK Group", lat=29.38, lon=47.99,
      line="A modern Indian table. Regional, warm, considered.",
      story=[
        "India by region, not by stereotype. Coastal Kerala, Lucknowi dum biryani, Bombay street plates, each cooked the way it is cooked at home.",
        "Service is trained to MK Group's Kuwait standards: warm, attentive, never performative. A room built for long evenings.",
      ],
      facts=[("Cuisine","Modern Indian"),("Partner","MK Group, Kuwait"),("Address","Place Vendôme, Lusail"),("Status","Open")],
      video=VID+"2026/03/Kumar-Website-Video-1-1.mp4", poster="images/brands/kumar-1.jpg",
      gallery=[("images/brands/kumar-2.jpg","The table"),("images/brands/kumar-1.jpg","The room"),("images/brands/kumar-3.jpg","The pass")],
      links=[("MK Group","https://www.mkgroup.com.kw/")],
      cta=("Reserve a table","tel:+97470323311"),
      placeholder=False),
 dict(slug="al-beiruti", name="Al Beiruti", short="Al Beiruti",
      logo="al-beiruti",
      origin="Beirut", founded="", lat=33.89, lon=35.50,
      line="A Beirut neighbourhood story, coming home.",
      story=[
        "A long table for the city. Mezze the old way, bread out of the saj every twelve minutes, charcoal until late.",
        "One hundred and eighty seats inside, more on the terrace. Just opened in Doha.",
      ],
      facts=[("Cuisine","Lebanese, Levantine"),("Origin","Beirut"),("Seating","180 and terrace"),("Address","Doha"),("Status","Just opened")],
      video=VID+"2026/03/IMG_5377-3.mp4", poster="images/brands/al-beiruti-spread.jpg",
      gallery=[("images/brands/al-beiruti-mezze.jpg","Mezze"),("images/brands/al-beiruti-spread.jpg","The spread")],
      links=[("Instagram","https://www.instagram.com/albeirutiqa")],
      cta=("Reserve a table","tel:+97470323311"),
      placeholder=False),
 dict(slug="eleven-green", name="Eleven Green", short="Eleven Green",
      logo="eleven-green",
      origin="Dubai", founded="2023", lat=25.20, lon=55.27,
      line="The Bull Burger is in town.",
      story=[
        "A homegrown burger bistro from Dubai's Chatila family. Hand-pressed patties, ground fresh every day. Hokkaido milk bun, house bacon jam, the signature Bull sauce.",
        "Ranked third best burger in the world at Dallas, 2022. Now days away from Doha, with the same kitchen rules it left with.",
      ],
      facts=[("Cuisine","Burger bistro"),("Origin","Dubai, 2023"),("Signature","The Bull Burger"),("Address","Doha"),("Status","Opening soon")],
      video="videos/eleven-green.mp4", poster="images/brands/eleven-green-poster.jpg",
      gallery=[("PH_EG_1","The Bull"),("PH_EG_2","The cut")],
      links=[],
      cta=("Be first to know","mailto:info@worldofhospitality.com.qa?subject=Eleven%20Green%20opening"),
      placeholder=True),
 dict(slug="brunch-cake", name="Brunch &amp; Cake", short="Brunch & Cake",
      logo="brunch-cake",
      origin="Barcelona", founded="2010", lat=41.39, lon=2.17,
      line="Grandma's goodness, thoughtfully served.",
      story=[
        "Born in Barcelona in 2010. Now in twenty-three destinations across Spain, the UAE, Saudi Arabia, Bahrain, Egypt, Kuwait and India.",
        "Wholesome dishes, generous portions, interiors you recognise from the door. Coming to Doha at the end of 2026.",
      ],
      facts=[("Cuisine","All-day, Mediterranean"),("Origin","Barcelona, 2010"),("Worldwide","23 locations"),("Address","Doha"),("Status","Late 2026")],
      video="", poster="images/brands/brunch-cake-1.jpg",
      gallery=[("PH_BC_1","The room"),("PH_BC_2","The morning")],
      links=[("Brunch & Cake","https://brunchandcake.com/")],
      cta=("Be first to know","mailto:info@worldofhospitality.com.qa?subject=Brunch%20%26%20Cake%20opening"),
      placeholder=True),
]

MOTIF = '''<svg class="motif" viewBox="0 0 220 120" width="220" height="120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g fill="none" stroke="#c4965b" stroke-width="1" vector-effect="non-scaling-stroke">
    <path d="M20 20 Q110 20 175 96"/><path d="M60 8 Q120 30 175 96"/><path d="M110 4 Q135 40 175 96"/><path d="M160 8 Q168 50 175 96"/><path d="M205 30 Q192 70 175 96"/>
  </g>
  <g fill="#c4965b"><circle cx="20" cy="20" r="2"/><circle cx="60" cy="8" r="2"/><circle cx="110" cy="4" r="2"/><circle cx="160" cy="8" r="2"/><circle cx="205" cy="30" r="2"/><circle cx="175" cy="96" r="3.5"/></g>
  <circle cx="175" cy="96" r="10" fill="none" stroke="#c4965b" stroke-width="1" opacity="0.5"/>
</svg>'''

LOGO = {
 "gunaydin": '<img class="logo logo--gunaydin" src="images/brands/gunaydin.png" alt="Günaydın" width="700" height="699">',
 "kumar": '<img class="logo logo--kumar" src="images/brands/kumar.png" alt="Kumar" width="1200" height="356">',
 "al-beiruti": '<img class="logo logo--al-beiruti" src="images/brands/al-beiruti.png" alt="Al Beiruti" width="900" height="466">',
 "eleven-green": '<img class="logo logo--eleven-green" src="images/brands/eleven-green.png" alt="Eleven Green" width="1200" height="114">',
 "brunch-cake": '<img class="logo logo--brunch-cake" src="images/brands/brunch-cake.png" alt="Brunch &amp; Cake" width="1200" height="404">',
}
WIDE = {"kumar", "eleven-green", "brunch-cake"}
STILL = {"gunaydin":"images/brands/gunaydin-1.jpg","kumar":"images/brands/kumar-1.jpg","al-beiruti":"images/brands/al-beiruti-spread.jpg","eleven-green":"images/brands/eleven-green-1.jpg","brunch-cake":"images/brands/brunch-cake-1.jpg"}

MENU_LOGOS = "".join(f'<a href="{s}.html" class="proof__logo proof__logo--{s}">{LOGO[s].replace("wall__logo--type","proof__type")}</a>' for s in ["gunaydin","kumar","al-beiruti","eleven-green","brunch-cake"])

def mini_wall(exclude=None, label=None):
    """The hero wall, smaller, as a component: every house except `exclude`."""
    panels = ""
    for h in HOUSES:
        if h['slug'] == exclude: continue
        cls = "wall__logo--wide" if h['slug'] in WIDE else ""
        status = dict(h['facts'])['Status']
        panels += f"""  <a class="wall__panel" href="{h['slug']}.html" data-house="{h['slug']}">
    <div class="wall__media"><img src="{STILL[h['slug']]}" alt="" loading="lazy"></div>
    <div class="wall__logo {cls}">{LOGO[h['slug']]}</div>
    <div class="wall__foot"><span class="wall__name">{h['name']}</span><span class="wall__meta">{h['origin']}. {live_tag(status)}</span></div>
  </a>\n"""
    head = f'<div class="wall__label">{label}</div>\n' if label else ''
    return f'<section class="wall wall--mini" aria-label="The houses">\n{head}{panels}</section>'

# Map projection for the route: lon 0..60, lat 20..45 onto 1000x420
def proj(lat, lon):
    return round(lon/60*1000, 1), round((45-lat)/25*420, 1)

def fmt(lat, lon):
    return f"{lat:.2f}° N, {lon:.2f}° E"

def route_svg(h, doha_label=True):
    ox, oy = proj(h['lat'], h['lon']); dx, dy = proj(*DOHA)
    # control point lifted north so the arc reads like a flight path
    cx, cy = (ox+dx)/2, min(oy, dy) - 90
    grid = ""
    for lon in range(0, 61, 10):
        x = lon/60*1000; grid += f'<line x1="{x}" y1="0" x2="{x}" y2="420"/>'
    for lat in range(20, 46, 5):
        y = (45-lat)/25*420; grid += f'<line x1="0" y1="{y}" x2="1000" y2="{y}"/>'
    lab_o_anchor = "end" if ox > 500 else "start"
    lab_o_dx = -14 if ox > 500 else 14
    return f'''<svg class="route__svg" viewBox="0 0 1000 420" width="1000" height="420" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g class="route__grid">{grid}</g>
  <path class="route__path" d="M{ox} {oy} Q{cx} {cy} {dx} {dy}" pathLength="1"/>
  <g class="route__pt route__pt--origin"><circle cx="{ox}" cy="{oy}" r="3.5"/><circle class="route__halo" cx="{ox}" cy="{oy}" r="10"/></g>
  <g class="route__pt route__pt--doha"><circle cx="{dx}" cy="{dy}" r="3.5"/><circle class="route__halo" cx="{dx}" cy="{dy}" r="10"/></g>
  <text class="route__lab" x="{ox+lab_o_dx}" y="{oy-12}" text-anchor="{lab_o_anchor}">{html.escape(h['origin'])}</text>
  <text class="route__lab route__lab--co" x="{ox+lab_o_dx}" y="{oy+6}" text-anchor="{lab_o_anchor}">{fmt(h['lat'],h['lon'])}</text>
  <text class="route__lab" x="{dx+14}" y="{dy+22}">Doha</text>
  <text class="route__lab route__lab--co" x="{dx+14}" y="{dy+40}">{fmt(*DOHA)}</text>
</svg>'''

SHELL_HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · World of Hospitality</title>
<meta name="description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Instrument+Sans:wght@400;500&display=swap">
<link rel="stylesheet" href="css/home.css?v=CB_HERE">
<link rel="stylesheet" href="css/house.css?v=CB_HERE">
</head>
<body class="is-loading house-page">

<div class="veil veil--quick" id="veil" aria-hidden="true"></div>
<div class="grain" aria-hidden="true"></div>

<header class="nav" id="nav">
  <a href="index.html" class="nav__brand" aria-label="World of Hospitality home">
    <img src="images/woh-logo.png" alt="World of Hospitality" class="nav__logo" width="150" height="50">
  </a>
  <nav class="nav__links" aria-label="Primary">
    <a href="about.html">About</a>
    <a href="index.html#houses" aria-current="page">Houses</a>
    <a href="careers.html">Careers</a>
    <a href="contact.html">Contact</a>
  </nav>
  <a href="partnerships.html" class="nav__cta">Partner with us</a>
  <button class="nav__toggle" id="navToggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
  <span class="nav__rule" aria-hidden="true"></span>
</header>

<div class="menu" id="menu" aria-hidden="true">
  <nav class="menu__links" aria-label="Mobile">
    <a href="about.html">About</a>
    <a href="index.html#houses">Houses</a>
    <a href="careers.html">Careers</a>
    <a href="contact.html">Contact</a>
    <a href="partnerships.html">Partner with us</a>
  </nav>
  <div class="menu__houses">MENU_LOGOS_HERE</div>
  <p class="menu__foot">Landmark Mall, Doha<br>+974 7032 3311</p>
</div>
'''

FOOT = '''
<footer class="foot">
  <div class="foot__top">
    <a href="index.html" class="foot__brand" aria-label="World of Hospitality home">
      <img src="images/woh-logo.png" alt="World of Hospitality" width="150" height="50">
    </a>
    <div class="foot__contact">
      <span class="foot__eyebrow">Enquiries</span>
      <a class="foot__mail" href="mailto:info@worldofhospitality.com.qa">info@worldofhospitality.com.qa</a>
      <a class="foot__tel" href="tel:+97470323311">+974 7032 3311</a>
    </div>
  </div>
  <div class="foot__grid">
    <div class="foot__col foot__col--office">
      <span class="foot__eyebrow">Office</span>
      <address>Landmark Mall, 1st Floor<br>Building 442, Street 380, Zone 31<br>P.O. Box 785, Doha, Qatar</address>
    </div>
    <div class="foot__col">
      <span class="foot__eyebrow">Group</span>
      <a href="about.html">About</a>
      <a href="index.html#houses">Houses</a>
      <a href="careers.html">Careers</a>
      <a href="partnerships.html">Partnerships</a>
      <a href="contact.html">Contact</a>
    </div>
    <div class="foot__col">
      <span class="foot__eyebrow">Houses</span>
      <a href="gunaydin.html">Günaydın</a>
      <a href="kumar.html">Kumar</a>
      <a href="al-beiruti.html">Al Beiruti</a>
      <a href="eleven-green.html">Eleven Green</a>
      <a href="brunch-cake.html">Brunch &amp; Cake</a>
    </div>
    <div class="foot__col">
      <span class="foot__eyebrow">Follow</span>
      <a href="https://www.instagram.com/albeirutiqa" target="_blank" rel="noopener">Instagram</a>
      <a href="https://www.linkedin.com/company/worldofhospitalityqa" target="_blank" rel="noopener">LinkedIn</a>
    </div>
  </div>
  <div class="foot__bottom">
    <span>© <span data-year>2026</span> World of Hospitality</span>
    <span class="foot__bottom-right">Doha, Qatar <span class="foot__ver">VERSION_HERE</span></span>
  </div>
</footer>

<script src="js/vendor/gsap.min.js?v=CB_HERE"></script>
<script src="js/vendor/ScrollTrigger.min.js?v=CB_HERE"></script>
<script src="js/vendor/lenis.min.js?v=CB_HERE"></script>
<script src="js/site.js?v=CB_HERE"></script>
</body>
</html>
'''

def media_block(h, cls):
    if h['video']:
        poster = f' poster="{h["poster"]}"' if h['poster'] else ''
        return f'<video class="{cls}" muted loop playsinline autoplay preload="auto"{poster}><source src="{h["video"]}" type="video/mp4"></video>'
    return f'<img class="{cls}" src="{h["poster"]}" alt="">'

def logo_block(h, cls):
    return f'<span class="{cls}">{LOGO[h["logo"]]}</span>'

def build(i, h, PH):
    nxt = HOUSES[(i+1) % len(HOUSES)]
    desc = f"{h['short']} in Doha. {html.unescape(h['line'])} A World of Hospitality house."
    facts = "".join(f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k,v in h['facts'])
    gallery = ""
    gal_items = h['gallery']
    for j,(src,cap) in enumerate(gal_items):
        src = PH.get(src, src)
        cls = "gal__cell" + (" gal__cell--wide" if j == 0 else "")
        gallery += f'<figure class="{cls}"><img src="{src}" alt="{h["short"]}, {cap.lower()}" loading="lazy"><figcaption>{cap}</figcaption></figure>\n'
    links = "".join(f'<a class="link" href="{u}" target="_blank" rel="noopener">{html.escape(t)}</a>' for t,u in h['links'])
    ph_note = '<p class="visit__note">Photography shown is placeholder until the house opens.</p>' if h['placeholder'] else ''
    founded = f'<span class="hero__meta-item">{h["origin"]}{", " + h["founded"] if h["founded"] and h["founded"][0].isdigit() else ""}</span>'
    status = dict(h['facts'])['Status']
    nxt_media = nxt['poster'] if nxt['poster'] else PH.get(nxt['gallery'][0][0], nxt['gallery'][0][0])

    body = f'''
<!-- ============ HERO ============ -->
<section class="hero" id="top">
  <div class="hero__media">
    {media_block(h, "hero__film")}
    <div class="hero__grade"></div>
  </div>
  <div class="hero__mark">{logo_block(h, "hero__logo")}</div>
  <div class="hero__copy">
    <h1 class="hero__name" data-chars>{h['name']}</h1>
    <p class="hero__line"><span class="line"><span>{h['line']}</span></span></p>
    <p class="hero__meta"><span class="line"><span>{founded}<span class="hero__meta-item">{live_tag(status)}</span></span></span></p>
  </div>
  <div class="hero__cue" aria-hidden="true"><span></span></div>
</section>

<!-- ============ STORY over film ============ -->
<section class="story" id="story">
  <div class="story__media story__media--material"><img src="images/material/plaster.jpg" alt="" loading="lazy"></div>
  <div class="story__copy">
    <p class="story__lead" data-split>{h['story'][0]}</p>
    <p class="story__more">{h['story'][1]}</p>
  </div>
  <dl class="story__facts">{facts}</dl>
</section>

<!-- ============ GALLERY ============ -->
<section class="gal" id="gallery">
  <div class="gal__grid">
{gallery}  </div>
</section>

<!-- ============ VISIT over film ============ -->
<section class="visit" id="visit">
  <div class="visit__media"><img src="images/material/bronze.jpg" alt="" loading="lazy"></div>
  <div class="visit__inner">
    <div class="visit__col" data-reveal>
      {logo_block(h, "visit__logo")}
      <p class="visit__addr">{dict(h['facts'])['Address']}, Doha</p>
      <p class="visit__hours">Opening hours to be confirmed</p>
      {ph_note}
    </div>
    <div class="visit__col visit__col--act" data-reveal>
      <a class="visit__cta" href="{h['cta'][1]}">{h['cta'][0]}</a>
      <div class="visit__links">{links}<a class="link" href="contact.html">Contact the group</a></div>
    </div>
  </div>
</section>

<!-- ============ THE OTHER HOUSES ============ -->
{mini_wall(exclude=h['slug'], label="The other houses")}
'''
    head = SHELL_HEAD.format(title=h['short'], desc=html.escape(desc)).replace('MENU_LOGOS_HERE', MENU_LOGOS).replace('CB_HERE', CB)
    return head + body + FOOT.replace('MOTIF_HERE', MOTIF).replace('VERSION_HERE', VERSION).replace('CB_HERE', CB)

if __name__ == "__main__":
    import json, sys
    PH = json.load(open("tools/placeholders.json")) if len(sys.argv) < 2 else {}
    for i,h in enumerate(HOUSES):
        open(f"{h['slug']}.html","w").write(build(i,h,PH))
        print("wrote", h['slug'] + ".html")
