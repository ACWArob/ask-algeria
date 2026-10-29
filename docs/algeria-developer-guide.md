# Ask Algeria: tasks for our developer in Algeria

Thank you for helping! **Ask Algeria** is an independent (non-government) assistant that answers questions about Algerian administrative procedures in English, French, Arabic and Darija, using **only official websites**.

Many official `.dz` sites **block visitors from outside Algeria**, so we can't read them. You can, because you're in Algeria. That's why your help matters so much.

- **Demo:** https://ask-algeria.vercel.app (password shared with you separately)
- **Spreadsheet:** https://docs.google.com/spreadsheets/d/1b6oM09R6yjt-80jXDWRK6exIzSOWHJMmVlZ98w_s4sY/edit
- **Contact:** Adam (ACWA), on WhatsApp

Do the parts in order. Part 3 (the crawler) is the most valuable.

---

## Part 0: Setup (10 min)

- [ ] Open the spreadsheet and check you can **edit** it (ask Adam for Editor access if not)
- [ ] Install **Node.js 18 or newer**: https://nodejs.org (check with `node -v`)
- [ ] Get the project code, **either**:
  - [ ] clone it: `git clone https://github.com/ACWArob/ask-algeria.git` (ask Adam to add your GitHub account), **or**
  - [ ] unzip the copy Adam sends you
- [ ] Make sure you're on a **normal Algerian connection**, with **no VPN** (the whole point is an Algerian IP)

---

## Part 1: Test the websites (Websites tab)

The **Websites** tab lists 176 official sites. Column **H (Status)** says whether we could reach each one from abroad.

- [ ] Filter column **H** to **Blocked** (Data → Create a filter), then do the same for **Partly blocked**
- [ ] For each site, click the link in column **F** and fill in the last 3 columns:

| Column | What to write |
|---|---|
| **N: Works from inside Algeria?** | `Yes`, `No`, or `Partly` (some pages load) |
| **O: Tester notes** | Short: "loads fine", "very slow", "login only", "error 403", "empty page", "redirects to …" |
| **P: Tested on (date)** | e.g. `2026-11-02` |

- [ ] When you're done, clear the filter so the sheet looks normal again

---

## Part 2: Check embassy and consulate details (Embassies & consulates tab)

The **Embassies & consulates** tab lists 145 Algerian missions abroad.

- [ ] Start with rows where column **O (Details status)** is "Verified" and check the address, phone and hours against the official site in column **H**
- [ ] Fill in the last 2 columns:

| Column | What to write |
|---|---|
| **R: Verified from Algeria?** | `Yes` (details correct), `No` (something wrong), or `Site down` |
| **S: Tester notes** | What's wrong or missing, e.g. "new phone: +33 …", "site moved to …" |

- [ ] If you find an official website for a mission that has none in column **H**, put it in column **S**

---

## Part 3: Run the crawler from Algeria ⭐ (the big one)

This downloads the **public text** of the official sites we can't reach, so the assistant can answer from the real pages.

**Rules:** official sites only, one site at a time at about 1 page per second (polite), never logs in, skips forms and files, stores **page text only** (no cookies, no personal data).

### Steps

- [ ] Open a terminal in the project folder (`ask-algeria`)
- [ ] **Preview** which sites it will visit (nothing is downloaded):
  ```bash
  node scripts/crawl-local.mjs --dry-run
  ```
  It should list about **158 sites**: the ones we have no live pages for.
- [ ] **Run it:**
  ```bash
  node scripts/crawl-local.mjs
  ```
  - Takes about **1–2 hours** for everything (up to 30 pages per site). Leave the laptop on and plugged in.
  - Progress is saved **after every site**, so you can stop with `Ctrl+C` and run the same command again later. It continues in the same file for that day.
- [ ] *(Optional)* Do it in smaller batches instead:
  ```bash
  node scripts/crawl-local.mjs --domains=dgsn.dz,aadl.dz,anem.dz,cnas.dz
  ```
- [ ] *(Optional)* Crawl an official site that isn't in our list (e.g. a wilaya portal you found):
  ```bash
  node scripts/crawl-local.mjs --url=https://www.wilaya-xxxx.dz/
  ```
- [ ] When it finishes, it prints two file names in the `data/` folder:
  - `data/algeria-crawl-YYYY-MM-DD.json` (the pages)
  - `data/algeria-crawl-YYYY-MM-DD-report.json` (which sites worked)
- [ ] **Send both files back**: WhatsApp (as documents), Google Drive, or commit them to the repo on a branch and open a pull request

### If something goes wrong

| Problem | What to do |
|---|---|
| `node: command not found` | Install Node.js 18+ and reopen the terminal |
| Lots of "not reachable" | Check you're on an Algerian connection with no VPN. Some sites are really down, which is useful to know too |
| A site shows a "verify you're human" / captcha page | Skip it (don't try to get around it) and note it in the sheet |
| It's very slow | Normal for `.dz` sites; run it overnight or in batches |

---

## Part 4: Save pages from login-only portals

Some services are portals behind a login, so the crawler can't see them. **Don't log in for us.** But their **public** pages (instructions, FAQ, required documents, fees) are very useful.

- [ ] For each portal below, open it and save every **public** instruction page as PDF (`Ctrl+P` → *Save as PDF*):
  - [ ] passeport.interieur.gov.dz (passport / biometric ID)
  - [ ] etatcivil.interieur.gov.dz, services.interieur.gov.dz, prestations.interieur.gov.dz (civil status, e-services)
  - [ ] portail.mjustice.dz (casier judiciaire, nationality certificate)
  - [ ] rdvpp.anpp.dz, rdvdm.anpp.dz (appointments)
  - [ ] minha.anem.dz (unemployment allowance)
  - [ ] damancom.casnos.dz (CASNOS)
  - [ ] jibayatic.mf.gov.dz, nifenligne.mf.gov.dz (tax)
  - [ ] sidjilcom.cnrc.dz (commercial register)
  - [ ] progres.mesrs.dz, bac.mesrs.dz, bac.onec.dz, bem.onec.dz (education and exams)
  - [ ] tawdif.education.gov.dz, awlya.education.gov.dz (education services)
- [ ] Name files like `passeport.interieur.gov.dz - documents a fournir.pdf`
- [ ] Put them all in one Google Drive folder and share it with Adam
- [ ] ⚠️ Never save a page that shows **your own** name, ID number or account details

---

## Part 5: Flag problems

- [ ] **Hacked or broken official sites:** e.g. `wilaya-guelma.dz` seems to contain hidden spam links. Tell us any others you notice
- [ ] **Wilayas with no website found yet (19).** If you find the official portal (often on the wilaya's Facebook page or the Ministry of Interior site), send us the link:
  - 23 Annaba · 33 Illizi · 34 Bordj Bou Arréridj · 49 Timimoun · 50 Bordj Badji Mokhtar · 53 In Salah · 54 In Guezzam · 56 Djanet
  - New wilayas (2025): 59 Aflou · 60 Barika · 61 El Kantara · 62 Bir El Ater · 63 El Aricha · 64 Ksar Chellala · 65 Aïn Oussera · 66 Messaad · 67 Ksar El Boukhari · 68 Bou Saâda · 69 El Abiodh Sidi Cheikh
- [ ] **Wilaya websites we're unsure about (18).** Can you confirm these are the real official sites?
  - Laghouat `wilaya-laghouat.dz` · Oum El Bouaghi `wilaya-oeb.dz` · Tamanrasset `wilaya-tamanrasset.dz` · Tébessa `wilaya-tebessa.dz` · Alger `wilaya-alger.dz` · Jijel `wilaya-jijel.dz` · Skikda `wilaya-skikda.dz` · Ouargla `wilaya-ouargla.dz` · El Tarf `wilaya-eltarf.dz` · Tindouf `wilaya-tindouf.dz` · Khenchela `wilaya-khenchela.dz` · Souk Ahras `wilaya-soukahras.dz` · Mila `wilaya-mila.dz` · Ghardaïa `wilaya-ghardaia.dz` · Béni Abbès `wilaya-beniabbes.dz` · Touggourt `wilaya-touggourt.dz` · El M'Ghair `wilaya-elmeghaier.dz` · El Meniaa `wilaya-meniaa.dz`
- [ ] **Try the demo** in Darija and French with real questions people around you ask. When an answer is wrong, press 👎 and say what's wrong. It goes straight to us

---

## Part 6: Send back

- [ ] Spreadsheet filled in (Parts 1, 2, 5)
- [ ] `algeria-crawl-….json` + `algeria-crawl-…-report.json` (Part 3)
- [ ] Drive folder of saved portal pages (Part 4)
- [ ] A short WhatsApp message to Adam: what you did, and anything surprising

**Merci beaucoup / شكرا بزاف!** 🇩🇿

---

<details>
<summary>For maintainers: importing the crawl</summary>

```bash
node scripts/import-apify.mjs data/algeria-crawl-YYYY-MM-DD.json   # only domains in data/sources.json are accepted
npm run index && npm test && npm run build
```
Pages are stored under their official URL as live pages. Existing corpus records with the same URL are kept, so remove an archived duplicate first if the live copy should win.
</details>
