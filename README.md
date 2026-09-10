# World of Hospitality: site

Static HTML, CSS and JS. No build step, no CMS. Push to `main` and GitHub Pages publishes it.

## Pages

| File | What it is |
|---|---|
| `index.html` | Home: the wall of five houses, one-line intro, a full-screen reel of each house, numbers over film, finale over film |
| `gunaydin.html` `kumar.html` `al-beiruti.html` `eleven-green.html` `brunch-cake.html` | One page per house |
| `about.html` `partnerships.html` `careers.html` `contact.html` | Inner pages |
| `brands.html` `services.html` | Redirects only, kept so old links still work |
| `apply.php` | Careers form handler. Works on HostGator (PHP). On GitHub Pages it cannot run, so the form falls back to an email prompt |

Styling: `css/home.css` (tokens, shell, homepage), `css/house.css` (house pages), `css/pages.css` (inner pages).
Motion: `js/home.js` (homepage), `js/site.js` (every other page). Libraries are self-hosted in `js/vendor/`.

## Version stamp
Every page's footer shows a version like `v14 · 10.09.26` (commit number, date). Compare it to what you see live to know whether your browser has the latest build. `tools/push.sh "message"` rebuilds all pages with a fresh stamp, commits and pushes in one go.

## How to update content

The house pages and the four inner pages are generated from two Python files so all pages stay consistent. Edit the data, run the script, commit the output.

```
python3 tools/build_home.py      # rebuilds index.html
python3 tools/build_houses.py    # rebuilds the five house pages
python3 tools/build_pages.py     # rebuilds about, partnerships, careers, contact
```

Run all three after any change to a house, since the houses appear on every page (hero wall, mini walls, logo strips, world map).

You need Python 3 installed, nothing else. If you would rather not run scripts, edit the `.html` files directly. They are plain HTML. Just keep the generator files in sync or they will overwrite your edits next time someone runs them.

### A house (name, story, facts, photos, links)
Open `tools/build_houses.py`. Each house is one block in `HOUSES`. Change the text in `line`, `story`, `facts`; change `gallery` to point at new photo files; change `cta` to a reservation link when there is one. Then run the script.

### Placeholders to replace
- **Eleven Green and Brunch & Cake photography** is AI-generated. Files: `images/brands/eleven-green-1.jpg`, `eleven-green-2.jpg`, `brunch-cake-1.jpg`, `brunch-cake-2.jpg`. Drop real photos over those filenames and nothing else needs to change. Then set `placeholder=False` on those two houses in `build_houses.py` and rerun, which removes the "placeholder photography" note from the page.
- **Opening hours** say "to be confirmed" on every house. In `build_houses.py`, the visit block reads `Opening hours to be confirmed.`; replace that string or add an `("Hours", "...")` entry to each house's `facts`.
- **Addresses** for Al Beiruti, Eleven Green and Brunch & Cake are just "Doha". Edit the `("Address", ...)` fact.
- **Leadership** on the About page is a paragraph and one photo. When bios are ready, replace the `people` section in `build_pages.py` with names, titles and portraits.
- **Logos**: all five real marks are in `images/brands/` as transparent PNGs. To swap one, overwrite the file. Sizes per placement live in one table at the bottom of `css/home.css` (search `Logo sizes`).

### Videos
The four hero videos are still loaded from the old WordPress site at `worldofhospitality.com.qa/wp-content/uploads/...`. If that hosting is switched off the videos stop playing. To make them permanent, put the MP4 files in a `videos/` folder and search-and-replace the URLs in `index.html` and `tools/build_houses.py` (the `VID` variable).

### Open roles (careers)
`tools/build_pages.py`, the `roles` list. Each entry is title, house, department, description, and the label that appears in the application form's dropdown. Rerun the script.

### Contact details, address, phone, email
They appear in the footer of every page (`FOOT` in `tools/build_houses.py`), the mobile menu (`SHELL_HEAD`), the contact page (`build_pages.py`), and in `index.html` directly. Search for `7032 3311` to find every instance.

### Forms
- **Contact form** opens the visitor's email app with the message pre-filled. To send server-side instead, point it at a form service or a PHP handler like `apply.php`.
- **Careers form** posts to `apply.php`, which emails `careers@worldofhospitality.com.qa`. Change the recipient at the top of `apply.php`. Requires PHP hosting.

## Adding a sixth house
Copy any block in `HOUSES` inside `tools/build_houses.py`, give it a new `slug`, fill in the fields, set `lat`/`lon` of its origin city, add its logo to `LOGO` and a photo to `STILL`. Then add a matching block to `H` in `tools/build_home.py`. Run all three scripts. The wall, the world map, the logo strips and the mini walls pick it up automatically.

### The road (homepage timeline)
The nodes live in `ROAD` inside `tools/build_home.py`: year, position, logo, running count, unit, note. Placeholders to confirm: Kumar's Doha opening year (set to 2024), and the two projections (10 houses by 2028, 3 Gulf markets by 2030).

### Materials
`images/material/` holds generated backgrounds: three plates (plaster, stone, bronze) and two hospitality scenes (room, stand) used on About used behind the numbers, story, visit and principle sections. Swap the files to change the mood; keep them dark.

## House style rules
No em-dashes in visible copy. No numbered step markers. Every SVG has explicit width and height. Restraint over addition.
