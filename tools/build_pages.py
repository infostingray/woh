#!/usr/bin/env python3
"""Generates about, partnerships, careers, contact. Run from repo root: python3 tools/build_pages.py"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from build_houses import SHELL_HEAD, FOOT, HOUSES, LOGO, mini_wall, MENU_LOGOS, MOTIF, VERSION

def shell(title, desc, current, body, extra_css=""):
    head = SHELL_HEAD.format(title=title, desc=desc).replace('MENU_LOGOS_HERE', MENU_LOGOS)
    head = head.replace('<a href="index.html#houses" aria-current="page">Houses</a>', '<a href="index.html#houses">Houses</a>')
    head = head.replace(f'<a href="{current}.html">', f'<a href="{current}.html" aria-current="page">', 1)
    head = head.replace('<link rel="stylesheet" href="css/house.css">', '<link rel="stylesheet" href="css/house.css">\n<link rel="stylesheet" href="css/pages.css">')
    head = head.replace('class="is-loading house-page"', 'class="is-loading house-page inner-page"')
    return head + body + FOOT.replace('MOTIF_HERE', MOTIF).replace('VERSION_HERE', VERSION)

def opener(title_lines, lede, img, alt=""):
    lines = "".join(f'<span class="line"><span>{l}</span></span>' for l in title_lines)
    media = f'<div class="open__media"><img src="{img}" alt="{alt}"><div class="open__grade"></div></div>' if img else ''
    return f'''
<section class="open{' open--plain' if not img else ''}">
  {media}
  <div class="open__copy">
    <h1 class="open__title">{lines}</h1>
    <p class="open__lede">{lede}</p>
  </div>
</section>'''

PROOF = ''.join(f'<a href="{h["slug"]}.html" class="proof__logo proof__logo--{h["slug"]}">{LOGO[h["slug"]]}</a>' for h in HOUSES)
MINI_ALL = mini_wall(label="Five houses, one standard")

# ---------------------------------------------------------------- ABOUT
about = f"""
<section class="open open--about">
  <div class="open__media"><img src="images/material/room.jpg" alt="An empty dining room before service"><div class="open__grade"></div></div>
  <div class="open__copy">
    <img class="open__mark" src="images/woh-logo.png" alt="World of Hospitality" width="240" height="80" data-reveal>
    <p class="open__kicker">Doha, since 2019</p>
    <h1 class="open__title open__title--lit lit" data-split>A restaurant is a thousand small promises, made nightly. Our job is to keep all of them.</h1>
  </div>
</section>

<section class="reel reel--chapters" aria-label="How we work">
  <div class="reel__slide reel__slide--static">
    <div class="reel__media reel__media--drift"><img src="images/doha/corniche.jpg" alt="Doha, West Bay from the Corniche"></div>
    <div class="reel__copy">
      <span class="reel__kicker">How we work</span>
      <span class="reel__title">Origin first.</span>
      <span class="reel__line">Original recipe, original room. Adapted for Doha, never diluted.</span>
    </div>
    <span class="reel__place">The Corniche, Doha</span><span class="reel__count">1 / 3</span>
  </div>
  <div class="reel__slide reel__slide--static">
    <div class="reel__media reel__media--drift"><img src="images/doha/souq.jpg" alt="A lantern-lit souq alley"></div>
    <div class="reel__copy">
      <span class="reel__kicker">How we work</span>
      <span class="reel__title">Senior people, every shift.</span>
      <span class="reel__line">The people accountable for the result are the people in the building. Not a head office, not a dashboard.</span>
    </div>
    <span class="reel__place">Souq Waqif</span><span class="reel__count">2 / 3</span>
  </div>
  <div class="reel__slide reel__slide--static">
    <div class="reel__media reel__media--drift"><img src="images/doha/lusail.jpg" alt="An arcade in Lusail at dusk"></div>
    <div class="reel__copy">
      <span class="reel__kicker">How we work</span>
      <span class="reel__title">Built to last.</span>
      <span class="reel__line">Group infrastructure, independent attention. Finance, licensing and supply run centrally. Service, kitchen and character stay the house's own.</span>
    </div>
    <span class="reel__place">Lusail</span><span class="reel__count">3 / 3</span>
  </div>
</section>

<section class="proof proof--about">
  <p class="proof__label">The houses</p>
  <div class="proof__row">{PROOF}</div>
</section>

<section class="people overfilm" id="leadership">
  <div class="overfilm__media overfilm__media--material"><img src="images/material/bronze.jpg" alt="" loading="lazy"></div>
  <div class="people__copy" data-reveal>
    <h2 class="sec__title">Operators, not consultants.</h2>
    <p>Our team has opened, run and turned around restaurants across the Gulf, the Levant and Europe. Leadership profiles are being prepared. Until then, ask us directly.</p>
    <a class="visit__cta" href="contact.html">Get in touch</a>
  </div>
</section>
"""

# ---------------------------------------------------------------- PARTNERSHIPS
services = [
 ("Concept and brand strategy","Assessing fit. Keeping what is untouchable. Refining what is not."),
 ("Site selection","Trade-area work, landlord relationships, the right shortlist."),
 ("Design and fit-out","Brand-led design, local contracting, kitchen build, FF&amp;E, on-schedule delivery."),
 ("Licensing","Commercial registration, municipality, food safety, labour, alcohol where applicable."),
 ("Recruitment and training","Senior team first. Pre-opening training to the brand's own standards."),
 ("Pre-opening and launch","Soft launch, PR, media, opening-week operations."),
 ("Daily operations","Service. Kitchen. Supply. Inventory. Weekly reviews. Monthly P&amp;L."),
 ("Finance and reporting","Centralised. Transparent. No mystery in the numbers."),
 ("Marketing and growth","In-market campaigns, loyalty, partnerships, the second location."),
]
stages = [
 ("Introduction call","You tell us what you are imagining. We tell you honestly if it works.","Same week"),
 ("Market and feasibility","Locations, positioning, financials, timeline.","6 to 10 weeks"),
 ("Commercial structure","Franchise, management contract or joint venture. Heads of terms in writing.","2 to 4 weeks"),
 ("Build and open","Site to launch. Published timeline. Weekly reporting.","9 to 14 months"),
 ("Operate and grow","We run it. You see the numbers. Location two comes when it is earned.","Ongoing"),
]
models = [
 ("Franchise and operate","We hold the licence. We run the venue. Royalties on revenue, brand controls retained."),
 ("Management contract","You own it. We operate it. Fixed and incentive fees, monthly reporting."),
 ("Joint venture","Aligned capital, aligned outcomes. Co-investment, shared upside."),
]
svc = "".join(f'<li class="svc" data-reveal><h3>{t}</h3><p>{d}</p></li>' for t,d in services)
stg = "".join(f'<li class="stage" data-reveal><span class="stage__when">{w}</span><div><h3>{t}</h3><p>{d}</p></div></li>' for t,d,w in stages)
mdl = "".join(f'<div class="model" data-reveal><h3>{t}</h3><p>{d}</p></div>' for t,d in models)

partnerships = opener(
    ["Your brand, in Doha,", "exactly as it is."],
    "We partner with established concepts looking at Qatar and the wider Gulf. If the idea is proven at home, we handle the rest of the journey.",
    "images/brands/al-beiruti-spread.jpg", "Al Beiruti, the spread") + f'''

<section class="proof" data-reveal>
  <p class="proof__label">Trusted with</p>
  <div class="proof__row">{PROOF}</div>
</section>

<section class="gets overfilm">
  <div class="overfilm__media overfilm__media--material"><img src="images/material/plaster.jpg" alt="" loading="lazy"></div>
  <div class="gets__head" data-reveal><h2 class="sec__title">What you get.</h2></div>
  <div class="tenets__list">
    <div class="tenet" data-reveal><h3>Real relationships.</h3><p>Landlords. Regulators. Suppliers. Built over years in Doha, not over a network.</p></div>
    <div class="tenet" data-reveal><h3>We do not dilute.</h3><p>Adaptation, not reinvention. Trusted with flagship concepts from Istanbul, Kuwait, Beirut, Dubai and Barcelona.</p></div>
    <div class="tenet" data-reveal><h3>The day-to-day is handled.</h3><p>Monthly numbers you trust. One point of accountability. You stay the brand.</p></div>
  </div>
</section>

<section class="svcs" id="services">
  <div class="svcs__head" data-reveal>
    <h2 class="sec__title">End to end. Same team.</h2>
    <p class="sec__lede">Nine disciplines, one point of contact, from the first conversation to the monthly P&amp;L.</p>
  </div>
  <ol class="svcs__list">{svc}</ol>
</section>

<section class="stages" id="journey">
  <div class="stages__head" data-reveal>
    <h2 class="sec__title">How a partnership unfolds.</h2>
  </div>
  <ol class="stages__list">{stg}</ol>
</section>

<section class="models" id="models">
  <div class="models__head" data-reveal><h2 class="sec__title">Three ways to work together.</h2></div>
  <div class="models__grid">{mdl}</div>
</section>

<section class="ask">
  <p class="ask__lines">
    <span class="line"><span>A first call costs nothing.</span></span>
    <span class="line"><span>Tell us about your brand.</span></span>
    <span class="line"><span>We will tell you honestly whether we are right for it.</span></span>
  </p>
  <a href="contact.html" class="visit__cta">Start the conversation</a>
</section>
'''

# ---------------------------------------------------------------- CAREERS
roles = [
 ("Sous Chef","Günaydın","Kitchen","Lead the line under our Executive Chef. Turkish steakhouse experience preferred; charcoal discipline essential.","Sous Chef, Günaydın"),
 ("Floor Manager","Kumar","Service","Run service from open to close to MK Group standards. Senior hospitality background required; regional Indian familiarity a plus.","Floor Manager, Kumar"),
 ("General Manager, pre-opening","Al Beiruti","Pre-opening","Build the team. Set the standard. Open the doors. Lebanese hospitality background essential; new-restaurant openings preferred.","General Manager, Al Beiruti"),
 ("Operations Analyst","Head office","Operations","Weekly KPIs. Monthly P&amp;L. Quarterly brand health. F&amp;B operations experience and serious comfort with numbers.","Operations Analyst"),
 ("Brand and Content Lead","Head office","Marketing","Own the voice across five brands. Editorial sensibility, social fluency and an unshakable taste filter.","Brand &amp; Content Lead"),
]
def role_logo(house):
    m = {"Günaydın":"gunaydin","Kumar":"kumar","Al Beiruti":"al-beiruti"}
    if house in m: return f'<span class="role__logo role__logo--{m[house]}">{LOGO[m[house]]}</span>'
    return f'<span>{house}</span>'
role_html = "".join(f'''<li class="role" data-reveal>
  <div class="role__meta">{role_logo(h)}<span>{d}</span><span>Full-time, Doha</span></div>
  <div class="role__body"><h3>{t}</h3><p>{desc}</p></div>
  <a class="link role__apply" href="#apply" data-prefill-role="{v}">Apply</a>
</li>''' for t,h,d,desc,v in roles)
role_opts = "".join(f'<option>{v}</option>' for *_,v in roles)
codes = "".join(f'<option value="{c}"{" selected" if c=="+974" else ""}>{c}</option>' for c in ["+974","+971","+966","+965","+973","+968","+961","+962","+20","+90","+91","+92","+63","+44","+33","+34","+49","+1"])

careers = opener(
    ["A career, not a shift."],
    "Five houses in Doha, all of them growing. If hospitality is a craft to you, we want to hear from you.",
    "images/brands/gunaydin-3.jpg", "Günaydın, the cut") + f'''

<section class="roles" id="roles">
  <div class="roles__head" data-reveal>
    <h2 class="sec__title">Open roles.</h2>
    <p class="sec__lede">Senior-led teams, every shift. We reply to every application within two working days.</p>
  </div>
  <ol class="roles__list">{role_html}
  <li class="role role--open" data-reveal>
    <div class="role__meta"><span>Any house</span><span>Any role</span></div>
    <div class="role__body"><h3>Nothing fits, but you are good?</h3><p>Send your CV and one paragraph about the kind of room you want to be in. If you are the right person, we will make space.</p></div>
    <a class="link role__apply" href="#apply" data-prefill-role="Open application">Open application</a>
  </li>
  </ol>
</section>

<section class="apply" id="apply">
  <div class="apply__head" data-reveal>
    <h2 class="sec__title">Apply.</h2>
    <p class="sec__lede">Tell us who you are and which role you are after.</p>
  </div>
  <form class="form" id="applyForm" action="apply.php" method="post" enctype="multipart/form-data" novalidate data-reveal>
    <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" class="form__hp">
    <div class="form__row">
      <label class="field"><span>Full name</span><input id="appName" name="name" type="text" required autocomplete="name" maxlength="80"></label>
      <label class="field"><span>Email</span><input id="appEmail" name="email" type="email" required autocomplete="email" maxlength="120"></label>
    </div>
    <div class="form__row">
      <div class="field field--phone"><span>Phone</span><div><select name="phoneCode" aria-label="Country code">{codes}</select><input id="appPhone" name="phone" type="tel" required autocomplete="tel" maxlength="20" inputmode="numeric"></div></div>
      <label class="field"><span>LinkedIn, optional</span><input id="appLinkedin" name="linkedin" type="url" autocomplete="url" maxlength="200" placeholder="https://linkedin.com/in/"></label>
    </div>
    <label class="field"><span>Applying for</span><select id="appRole" name="role" required><option value="">Select a role</option>{role_opts}<option>Open application</option></select></label>
    <label class="field"><span>Cover note, optional</span><textarea id="appMessage" name="message" rows="5" maxlength="5000" placeholder="A paragraph about the kind of room you want to be in. We read every one."></textarea></label>
    <label class="field field--file"><span>CV</span><input id="appCv" name="cv" type="file" accept=".pdf,.doc,.docx,.rtf" required><em class="form__file-name">Choose a file</em><small>PDF, DOC, DOCX or RTF, 5 MB max</small></label>
    <div class="form__foot">
      <button type="submit" class="visit__cta">Send application</button>
      <p class="form__status" aria-live="polite"></p>
    </div>
    <p class="form__legal">By submitting, you consent to us reviewing your application and contacting you about hiring.</p>
  </form>
</section>
'''

# ---------------------------------------------------------------- CONTACT
topics = ["A brand partnership or Qatar expansion","Career opportunities","Media and press","Supplier and vendor enquiries","Something else"]
topic_opts = "".join(f'<option>{t}</option>' for t in topics)
contact = opener(
    ["Let's talk."],
    "Brand owner, future colleague, curious guest. The right person will get back to you within two working days.",
    "images/brands/al-beiruti-mezze.jpg", "Al Beiruti, mezze") + f'''

<section class="reach">
  <div class="reach__col" data-reveal>
    <a class="reach__big" href="tel:+97470323311">+974 7032 3311</a>
    <a class="reach__big reach__big--mail" href="mailto:info@worldofhospitality.com.qa">info@worldofhospitality.com.qa</a>
    <dl class="story__facts reach__facts">
      <div><dt>Head office</dt><dd>Landmark Mall, 1st Floor<br>Building 442, Street 380, Zone 31<br>P.O. Box 785, Doha, Qatar</dd></div>
      <div><dt>Hours</dt><dd>Sunday to Thursday, 9am to 6pm</dd></div>
      <div><dt>Follow</dt><dd><a class="link" href="https://www.instagram.com/albeirutiqa" target="_blank" rel="noopener">Instagram</a> &nbsp; <a class="link" href="https://www.linkedin.com/company/worldofhospitalityqa" target="_blank" rel="noopener">LinkedIn</a></dd></div>
    </dl>
  </div>
  <form class="form reach__form" id="contactForm" data-reveal>
    <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" class="form__hp">
    <div class="form__row">
      <label class="field"><span>Name</span><input name="name" type="text" required autocomplete="name" maxlength="80"></label>
      <label class="field"><span>Company, optional</span><input name="company" type="text" autocomplete="organization" maxlength="120"></label>
    </div>
    <div class="form__row">
      <label class="field"><span>Email</span><input name="email" type="email" required autocomplete="email" maxlength="120"></label>
      <label class="field"><span>Phone, optional</span><input name="phone" type="tel" autocomplete="tel" maxlength="24"></label>
    </div>
    <label class="field"><span>I am getting in touch about</span><select name="topic" required><option value="">Select</option>{topic_opts}</select></label>
    <label class="field"><span>Message</span><textarea name="message" rows="5" required maxlength="3000" placeholder="A few sentences is plenty. We will come back with the right questions."></textarea></label>
    <div class="form__foot">
      <button type="submit" class="visit__cta">Send message</button>
      <p class="form__status" aria-live="polite"></p>
    </div>
    <p class="form__legal">By submitting, you agree we may contact you about your enquiry.</p>
  </form>
</section>

<section class="map" aria-label="Map">
  <iframe title="Landmark Mall, Doha" src="https://maps.google.com/maps?q=Landmark%20Mall%2C%20Doha%2C%20Qatar&z=14&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
</section>
'''

PAGES = [
 ("about", "About", "World of Hospitality. Operators, not licensors. How the group works and who runs it.", about),
 ("partnerships", "Partnerships", "Bring your brand to Doha with World of Hospitality. Franchise, management contract or joint venture.", partnerships),
 ("careers", "Careers", "Open roles across World of Hospitality's five houses in Doha.", careers),
 ("contact", "Contact", "Contact World of Hospitality, Landmark Mall, Doha.", contact),
]
if __name__ == "__main__":
    for slug, title, desc, body in PAGES:
        open(f"{slug}.html", "w").write(shell(title, desc, slug, body))
        print("wrote", slug + ".html")
