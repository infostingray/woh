# World of Hospitality — New Site

A static HTML/CSS/JS rebuild of worldofhospitality.com.qa. No WordPress, no build step, no plugins. Just files that work when you upload them.

---

## What's in this folder

```
woh-site/
├── index.html          ← Home
├── about.html          ← About
├── brands.html         ← Brands (Günaydın, Kumar, Al Beiruti)
├── services.html       ← Services
├── partnerships.html   ← Partnerships
├── contact.html        ← Contact + form + map
├── css/styles.css      ← All styling (one file)
├── js/main.js          ← Nav scroll, mobile menu, reveal animations
└── images/             ← Empty — drop your own photography here later
```

That's the whole site. Eight files. No database.

---

## Before you do anything: BACK UP

Your current site is WordPress on HostGator. Before replacing it, take two backups.

### 1) Back up the files

1. Log in to **HostGator cPanel** (your hosting login, not WordPress).
2. Open **File Manager**.
3. Navigate to `public_html/` (this is the root of worldofhospitality.com.qa).
4. Select everything inside it.
5. Click **Compress** → choose ZIP → name it something like `wordpress-backup-2026-05.zip`.
6. **Download that zip to your computer.** Keep it safe.

### 2) Back up the WordPress database

1. In cPanel, open **phpMyAdmin**.
2. On the left, click your WordPress database (something like `wohqa_wp` or similar).
3. Click the **Export** tab at the top.
4. Method: **Quick**. Format: **SQL**. Click **Export**.
5. Save the `.sql` file with your file backup.

If anything ever goes wrong, you can restore both and you're back where you started.

---

## Deployment: 5-minute version

### Option A — Using cPanel File Manager (easiest, no extra software)

1. Log in to **HostGator cPanel**.
2. Open **File Manager** and go to `public_html/`.
3. **Delete everything inside `public_html/`.** (You backed it up in the previous step.)
   - Select all → Delete → confirm.
   - Don't delete `public_html/` itself, only its contents.
4. On your computer, **zip the whole `woh-site/` folder's *contents*** (not the folder itself — open it, select all files, and zip them). Name the zip `site.zip`.
5. Back in cPanel File Manager, inside `public_html/`, click **Upload** at the top.
6. Drag `site.zip` in. Wait for it to finish (you'll see a progress bar).
7. Go back to File Manager. You should see `site.zip` in `public_html/`.
8. Right-click `site.zip` → **Extract** → confirm path is `/public_html/`.
9. Once extracted, you can delete `site.zip`.
10. Visit `https://worldofhospitality.com.qa` in a browser. Done.

### Option B — Using FTP (if you prefer)

1. Get FTP credentials from cPanel → **FTP Accounts** (or use the main cPanel account).
2. Open an FTP client (FileZilla is free).
   - Host: your domain or `ftp.worldofhospitality.com.qa`
   - Username / password: from cPanel
   - Port: 21
3. Connect. On the right pane, navigate to `public_html/`.
4. Delete everything inside it (after confirming your backup is saved).
5. On the left pane, navigate to your local `woh-site/` folder.
6. Select all the contents (Ctrl/Cmd+A) and drag them to `public_html/`.
7. Wait for the transfer.
8. Visit the site.

---

## Post-launch checklist

- [ ] Site loads at `https://worldofhospitality.com.qa`
- [ ] All five nav links work (Home, About, Brands, Services, Partnerships, Contact)
- [ ] Phone link dials the correct number on mobile (`+974 7032 3311`)
- [ ] Email link opens a draft to `info@worldofhospitality.com.qa`
- [ ] Map renders on Contact page
- [ ] Al Beiruti construction video plays on home page
- [ ] Mobile menu toggle works (resize browser narrow to test)

---

## Swapping in real photography (later)

Right now the site uses high-quality Unsplash stock photography as placeholders. When you have your own venue, food, and team photography, replace them like this:

1. Save your image as a `.jpg` or `.webp`, ideally **under 400 KB** per image.
2. Upload it to the `images/` folder via cPanel File Manager.
3. Open the relevant HTML page in File Manager → **Edit**.
4. Find the existing image URL — search for `images.unsplash.com` in the page.
5. Replace the full `https://images.unsplash.com/...` URL with `images/your-file.jpg`.
6. Save the file.

Example: change
```html
<div class="hero__bg" style="background-image:url('https://images.unsplash.com/photo-1517...');"></div>
```
to
```html
<div class="hero__bg" style="background-image:url('images/hero-gunaydin-night.jpg');"></div>
```

Recommended replacements (in priority order):
1. **Home hero** — your most cinematic venue interior at night
2. **Three brand cards on home + brands page** — one signature shot per brand
3. **About page header** — kitchen, team, or restaurant pass
4. **Services page header** — a styled food or operations moment

---

## Editing copy

All text lives directly in the HTML files. To change a headline or paragraph:

1. cPanel File Manager → open the page → **Edit**.
2. Find the line. Change the words between the tags.
3. Save.

That's it. No WordPress admin, no plugins to update, no security patches to chase.

---

## Things that no longer apply (good news)

Because this is static HTML:

- No WordPress core updates
- No plugin updates
- No theme updates
- No Elementor licensing
- No database backups required (just back up the files if you change them)
- No PHP version issues
- Faster page loads
- Better Google Lighthouse scores out of the box

---

## Contact form note

The form on `contact.html` currently uses `mailto:` — clicking Send opens the user's email client with the message pre-filled to `info@worldofhospitality.com.qa`. This works everywhere but isn't elegant.

When you're ready to upgrade it to a proper form-to-inbox handler, the easiest options are:
- **Formspree** (formspree.io) — free for small volume, change one line in the `<form action="">` attribute
- **Web3Forms** — similar, no account required
- **Custom PHP** — HostGator supports PHP if you want a self-hosted handler

Happy to wire any of those up when you're ready.

---

## Rolling back

If anything looks wrong after deployment and you need the old WordPress site back:

1. cPanel File Manager → `public_html/`
2. Delete everything inside.
3. Upload `wordpress-backup-2026-05.zip` from your computer.
4. Extract it.
5. phpMyAdmin → import the `.sql` file you saved.

You're restored.

---

Built with care. Reach out anytime.
