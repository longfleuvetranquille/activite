# Palmier — CLAUDE.md

> Application web IA qui découvre automatiquement les meilleures activités et événements à Nice et sur la Côte d'Azur, adaptés au profil d'un jeune actif de 25 ans.

---

## 1. Vision produit

**Problème** : Trouver quoi faire à Nice et aux alentours demande de consulter des dizaines de sites différents (Shotgun, Facebook Events, sites locaux…). L'information est éparpillée, non filtrée, et souvent pas adaptée à mes goûts.

**Solution** : Palmier est un agrégateur intelligent qui crawl quotidiennement le web, collecte les événements/activités, les enrichit via IA (tags, scoring d'intérêt), et les présente dans un dashboard propre avec notifications Telegram.

**Utilisateur cible** : Jeune actif (~25 ans) vivant à Nice, intéressé par les sorties, le sport, les événements culturels et les bons plans voyage.

---

## 2. Architecture technique

### 2.1 Vue d'ensemble

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js App    │────▶│    FastAPI        │────▶│   PocketBase     │
│   (Frontend)     │◀────│    (Backend)      │◀────│   (Database)     │
│   React + TW     │     │    + Crawlers     │     │   SQLite         │
└─────────────────┘     │    + IA Tagger     │     └─────────────────┘
                        └──────────────────┘
                              │       │
                    ┌─────────┘       └──────────┐
                    ▼                            ▼
          ┌──────────────┐             ┌──────────────┐
          │  Telegram Bot │             │  Web Crawlers │
          │  (Notifs)     │             │  (Scrapy/     │
          └──────────────┘             │   Playwright) │
                                       └──────────────┘
```

### 2.2 Stack technologique

| Couche        | Technologie             | Justification                                    |
|---------------|-------------------------|--------------------------------------------------|
| Frontend      | Next.js 14 + React 18   | SSR, routing, performance, écosystème riche       |
| Styling       | Tailwind CSS            | Rapide, responsive, design system cohérent        |
| Backend API   | FastAPI (Python 3.12+)  | Async natif, performant, idéal pour les crawlers  |
| Database      | PocketBase              | Léger, self-hosted, auth intégrée, temps réel     |
| Crawling      | Scrapy + Playwright     | Scrapy pour sites statiques, Playwright pour SPAs |
| IA / NLP      | Claude API (Anthropic)  | Tagging, scoring d'intérêt, résumés événements    |
| Scheduler     | APScheduler             | Planification du crawl quotidien                  |
| Notifications | python-telegram-bot     | Bot Telegram pour notifs quotidiennes             |
| Hébergement   | Self-hosted (RPi/NAS)   | Gratuit, contrôle total                           |
| Containerisation | Docker + Docker Compose | Déploiement reproductible                     |

### 2.3 Structure du projet

```
palmier/
├── docker-compose.yml
├── .env.example
├── CLAUDE.md
│
├── backend/                    # FastAPI + Crawlers
│   ├── app/
│   │   ├── main.py             # Point d'entrée FastAPI
│   │   ├── config.py           # Configuration & env vars
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── events.py   # CRUD événements
│   │   │   │   ├── tags.py     # Gestion des tags
│   │   │   │   └── dashboard.py # Endpoints dashboard
│   │   │   └── deps.py         # Dépendances (auth, DB)
│   │   ├── crawlers/
│   │   │   ├── base.py         # Crawler abstrait
│   │   │   ├── shotgun.py      # Crawler Shotgun
│   │   │   ├── google.py       # Crawler recherche Google
│   │   │   ├── facebook.py     # Crawler Facebook Events
│   │   │   ├── nicematin.py    # Crawler Nice-Matin
│   │   │   ├── riviera_buzz.py # Crawler blogs locaux
│   │   │   └── flight_deals.py # Crawler bons plans vols
│   │   ├── ai/
│   │   │   ├── tagger.py       # Système de tagging IA
│   │   │   ├── scorer.py       # Scoring d'intérêt
│   │   │   └── summarizer.py   # Résumés d'événements
│   │   ├── scheduler/
│   │   │   ├── jobs.py         # Jobs planifiés
│   │   │   └── scheduler.py    # Config APScheduler
│   │   ├── telegram/
│   │   │   ├── bot.py          # Bot Telegram
│   │   │   └── templates.py    # Templates messages
│   │   ├── models/
│   │   │   ├── event.py        # Modèle Event
│   │   │   └── schemas.py      # Pydantic schemas
│   │   └── services/
│   │       ├── pocketbase.py   # Client PocketBase
│   │       ├── event_service.py
│   │       └── dedup.py        # Dédoublonnage événements
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                   # Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Dashboard principal
│   │   │   ├── layout.tsx      # Layout global
│   │   │   ├── today/          # Page "Aujourd'hui"
│   │   │   ├── week/           # Page "Cette semaine"
│   │   │   ├── month/          # Page "Ce mois"
│   │   │   ├── event/[id]/     # Détail événement
│   │   │   └── settings/       # Préférences
│   │   ├── components/
│   │   │   ├── EventCard.tsx
│   │   │   ├── TagBadge.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── DailyDigest.tsx
│   │   │   └── MapView.tsx
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── api.ts          # Client API
│   │   │   └── pocketbase.ts   # Client PocketBase
│   │   └── types/
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── Dockerfile
│
└── pocketbase/
    ├── pb_data/                # Données SQLite
    ├── pb_migrations/          # Migrations
    └── Dockerfile
```

---

## 3. Modèle de données (PocketBase)

### 3.1 Collection `events`

| Champ              | Type       | Description                                      |
|--------------------|------------|--------------------------------------------------|
| `id`               | string     | ID auto PocketBase                                |
| `title`            | string     | Nom de l'événement                                |
| `description`      | text       | Description complète                              |
| `summary`          | text       | Résumé IA (2-3 phrases)                           |
| `date_start`       | datetime   | Date/heure de début                               |
| `date_end`         | datetime   | Date/heure de fin (optionnel)                     |
| `location_name`    | string     | Nom du lieu                                       |
| `location_city`    | string     | Ville (Nice, Monaco, Cannes, Antibes…)            |
| `location_address` | string     | Adresse complète                                  |
| `latitude`         | number     | Coordonnée GPS                                    |
| `longitude`        | number     | Coordonnée GPS                                    |
| `price_min`        | number     | Prix minimum (0 = gratuit)                        |
| `price_max`        | number     | Prix maximum                                      |
| `currency`         | string     | EUR par défaut                                    |
| `source_url`       | url        | Lien original                                     |
| `source_name`      | string     | Nom de la source (Shotgun, Google, etc.)          |
| `image_url`        | url        | Image de l'événement                              |
| `tags_type`        | json       | Tags de type d'activité                           |
| `tags_vibe`        | json       | Tags d'ambiance                                   |
| `tags_energy`      | json       | Tags niveau d'énergie                             |
| `tags_budget`      | json       | Tags budget                                       |
| `tags_time`        | json       | Tags temporalité                                  |
| `tags_exclusivity` | json       | Tags exclusivité/rareté                           |
| `tags_location`    | json       | Tags localisation                                 |
| `tags_audience`    | json       | Tags profil public                                |
| `tags_deals`       | json       | Tags bons plans                                   |
| `tags_meta`        | json       | Méta-étiquettes IA                                |
| `interest_score`   | number     | Score d'intérêt IA (0-100)                        |
| `is_featured`      | bool       | Mis en avant (top picks)                          |
| `status`           | select     | `draft` / `published` / `expired` / `cancelled`  |
| `crawled_at`       | datetime   | Date du crawl                                     |
| `hash`             | string     | Hash pour dédoublonnage                           |

### 3.2 Collection `sources`

| Champ           | Type     | Description                                |
|-----------------|----------|--------------------------------------------|
| `id`            | string   | ID auto                                    |
| `name`          | string   | Nom de la source                           |
| `base_url`      | url      | URL de base                                |
| `crawler_type`  | select   | `scrapy` / `playwright` / `api`            |
| `is_active`     | bool     | Source active ou non                       |
| `last_crawl`    | datetime | Dernier crawl réussi                       |
| `crawl_config`  | json     | Configuration spécifique du crawler        |
| `reliability`   | number   | Score de fiabilité (0-100)                 |

### 3.3 Collection `crawl_logs`

| Champ           | Type     | Description                                |
|-----------------|----------|--------------------------------------------|
| `id`            | string   | ID auto                                    |
| `source`        | relation | Relation vers `sources`                    |
| `started_at`    | datetime | Début du crawl                             |
| `finished_at`   | datetime | Fin du crawl                               |
| `status`        | select   | `success` / `partial` / `error`            |
| `events_found`  | number   | Nombre d'événements trouvés                |
| `events_new`    | number   | Nombre de nouveaux événements              |
| `error_message` | text     | Message d'erreur si échec                  |

### 3.4 Collection `user_preferences`

| Champ                | Type   | Description                             |
|----------------------|--------|-----------------------------------------|
| `id`                 | string | ID auto                                 |
| `favorite_tags`      | json   | Tags favoris (boost le scoring)         |
| `blocked_tags`       | json   | Tags exclus                             |
| `favorite_locations` | json   | Villes préférées                        |
| `max_budget`         | number | Budget max par défaut                   |
| `telegram_chat_id`   | string | ID chat Telegram pour notifs            |
| `notif_time`         | string | Heure d'envoi notif (ex: "08:00")       |
| `notif_enabled`      | bool   | Notifications actives                   |

---

## 4. Système de tags complet

### 4.1 Type d'activité (`tags_type`)

| Code              | Emoji | Label                  |
|-------------------|-------|------------------------|
| `party`           | 🎶    | Soirée / Clubbing      |
| `bar_rooftop`     | 🍸    | Bar & Rooftop          |
| `dj_set`          | 🎧    | DJ set                 |
| `concert`         | 🎤    | Concert                |
| `show`            | 🎭    | Spectacle / Show       |
| `conference`      | 🧠    | Conférence / Talk      |
| `poker_games`     | 🃏    | Poker / Jeux           |
| `sport_match`     | ⚽    | Sport – Match          |
| `motorsport`      | 🏎    | Sport mécanique        |
| `watersport`      | 🌊    | Sport nautique         |
| `outdoor`         | 🏕    | Outdoor / Aventure     |
| `gaming`          | 🎮    | Gaming / Esport        |
| `cinema`          | 🎬    | Cinéma / Projection    |
| `food`            | 🍽    | Food / Expérience culinaire |
| `travel`          | ✈️    | Voyage / Escapade      |

### 4.2 Ambiance / Vibe (`tags_vibe`)

| Code           | Emoji | Label            |
|----------------|-------|------------------|
| `festive`      | 🔥    | Festif           |
| `chill`        | 😎    | Chill            |
| `premium`      | 💎    | Premium          |
| `dancing`      | 🕺    | Dansant          |
| `afterwork`    | 🍷    | Afterwork        |
| `intellectual` | 🧠    | Intellectuel     |
| `select`       | 🎩    | Select / Privé   |
| `sunset`       | 🌅    | Sunset           |
| `date`         | ❤️    | Date-friendly    |
| `friends`      | 👯    | Entre amis       |
| `late_night`   | 🌙    | Late night       |

### 4.3 Niveau d'énergie (`tags_energy`)

| Code          | Emoji | Label            |
|---------------|-------|------------------|
| `high`        | ⚡    | High energy      |
| `intense`     | 🔥    | Très intense     |
| `low`         | 😌    | Low energy       |
| `relax`       | 💤    | Repos / détente  |

### 4.4 Budget (`tags_budget`)

| Code          | Emoji | Label               |
|---------------|-------|---------------------|
| `free`        | 💸    | Gratuit             |
| `budget`      | 💰    | Petit budget        |
| `premium`     | 💎    | Expérience premium  |
| `value`       | 🤑    | Rapport qualité/prix|
| `worth_it`    | 🚀    | Exceptionnel        |

### 4.5 Temporalité (`tags_time`)

| Code          | Emoji | Label              |
|---------------|-------|--------------------|
| `today`       | ⏰    | Aujourd'hui        |
| `this_week`   | 📅    | Cette semaine      |
| `this_month`  | 🗓    | Ce mois-ci         |
| `last_minute` | 🔔    | Dernière minute    |
| `plan_ahead`  | 🧭    | À anticiper        |
| `one_time`    | ⏳    | Événement ponctuel |
| `recurring`   | 🔁    | Récurrent          |

### 4.6 Exclusivité & rareté (`tags_exclusivity`)

| Code          | Emoji | Label              |
|---------------|-------|--------------------|
| `selling_fast`| 🚨    | Complet bientôt    |
| `limited`     | 🎟    | Places limitées    |
| `rare`        | 👑    | Événement rare     |
| `one_shot`    | 🧨    | One-shot           |
| `underground` | 🤫    | Secret / Underground|

### 4.7 Localisation (`tags_location`)

| Code            | Emoji | Label              |
|-----------------|-------|--------------------|
| `nice_centre`   | 📍    | Nice centre        |
| `seaside`       | 🌴    | Bord de mer        |
| `monaco`        | 🏙    | Monaco             |
| `cannes`        | 🎬    | Cannes             |
| `antibes`       | 🌊    | Antibes            |
| `nearby`        | 🗺    | À moins de 30 min  |
| `road_trip`     | 🚗    | Road trip facile   |

### 4.8 Profil public (`tags_audience`)

| Code           | Emoji | Label              |
|----------------|-------|--------------------|
| `young_pro`    | 👟    | Jeune actif        |
| `student`      | 🎓    | Étudiant           |
| `afterwork_crowd` | 💼 | Afterwork crowd    |
| `electro`      | 🎧    | Électro lovers     |
| `cocktail`     | 🍸    | Cocktail lovers    |
| `adrenaline`   | 🏎    | Adrénaline         |
| `explorer`     | 🌍    | Curieux / explorateur |
| `poker_player` | 🃏    | Stratèges / poker  |

### 4.9 Opportunités / Bons plans (`tags_deals`)

| Code              | Emoji | Label                  |
|-------------------|-------|------------------------|
| `cheap_flight`    | ✈️    | Billet anormalement bas |
| `below_average`   | 📉    | Prix sous la moyenne   |
| `short_window`    | ⏱    | Fenêtre courte         |
| `deal_detected`   | 💡    | Bon plan détecté       |
| `quick_escape`    | 🧳    | Escapade express       |

### 4.10 Méta-étiquettes IA (`tags_meta`)

| Code             | Emoji | Label                    |
|------------------|-------|--------------------------|
| `high_interest`  | 🧠    | Fort intérêt estimé      |
| `recommended`    | ⭐    | Très recommandé          |
| `trending`       | 🔍    | Tendance locale          |
| `popular`        | 📈    | Populaire cette semaine  |
| `experimental`   | 🧪    | Test / nouveau           |

---

## 5. Système de crawling

### 5.1 Sources à crawler

| Source          | Type          | URL / Méthode                        | Priorité |
|-----------------|--------------|--------------------------------------|----------|
| Shotgun         | Playwright   | shotgun.live/cities/nice             | Haute    |
| Google Search   | Scrapy       | "Que faire à Nice aujourd'hui"       | Haute    |
| Facebook Events | Playwright   | Events à Nice et alentours           | Haute    |
| Nice-Matin      | Scrapy       | Section sorties/loisirs              | Moyenne  |
| Riviera Buzz    | Scrapy       | Blog local événements                | Moyenne  |
| Timeout Nice    | Scrapy       | timeout.com/nice                     | Moyenne  |
| Eventbrite      | API          | API officielle, filtré Nice          | Haute    |
| Skyscanner      | Playwright   | Vols depuis Nice (bons plans)        | Basse    |
| Google Flights  | Playwright   | Bons plans vols depuis NCE           | Basse    |
| Meetup          | API          | Meetups tech/sport à Nice            | Basse    |

### 5.2 Pipeline de crawling

```
1. FETCH        → Récupérer les pages/données brutes
2. PARSE        → Extraire les événements (titre, date, lieu, prix, URL)
3. NORMALIZE    → Nettoyer et standardiser les données
4. DEDUP        → Dédoublonnage par hash (titre + date + lieu)
5. ENRICH (IA)  → Tagging automatique via Claude API
6. SCORE (IA)   → Scoring d'intérêt (0-100) selon le profil
7. STORE        → Sauvegarder dans PocketBase
8. NOTIFY       → Envoyer les tops du jour via Telegram
```

### 5.3 Stratégie de scoring IA

Le scoring d'intérêt (0-100) est calculé par Claude API en fonction de :
- **Profil utilisateur** : jeune actif, 25 ans, Nice
- **Préférences** : GP Monaco, F1, foot, poker, jet-ski, karting, rooftops, voyages pas chers
- **Temporalité** : bonus pour "aujourd'hui" et "dernière minute"
- **Exclusivité** : bonus pour événements rares ou places limitées
- **Budget** : bonus pour gratuit ou bon rapport qualité/prix
- **Popularité** : bonus si trending ou populaire localement

### 5.4 Prompt IA pour le tagging

Le tagger IA reçoit les données brutes d'un événement et retourne :
- Les tags pertinents (parmi le référentiel ci-dessus)
- Un score d'intérêt (0-100)
- Un résumé en 2-3 phrases
- Un booléen `is_featured` si le score > 80

---

## 6. Fonctionnalités détaillées

### 6.1 Dashboard web (Next.js)

#### Pages principales

- **Aujourd'hui** (`/today`) : Événements du jour, triés par score d'intérêt
- **Cette semaine** (`/week`) : Top événements de la semaine
- **Ce mois** (`/month`) : Événements marquants du mois à anticiper
- **Détail événement** (`/event/[id]`) : Toutes les infos + lien source
- **Paramètres** (`/settings`) : Préférences, tags favoris, config Telegram

#### Composants UI

- **EventCard** : Carte événement avec image, titre, date, lieu, tags, score
- **TagBadge** : Badge coloré avec emoji pour chaque tag
- **FilterBar** : Filtres par type, ville, budget, vibe, date
- **DailyDigest** : Résumé du jour en haut de page
- **MapView** : Carte interactive (Leaflet) avec les événements géolocalisés

#### Fonctionnalités frontend

- Filtrage multi-critères (tags, ville, budget, date)
- Recherche textuelle
- Vue carte / vue liste
- Responsive mobile-first
- Dark mode
- Animations fluides (Framer Motion)
- Real-time via PocketBase subscriptions

### 6.2 Bot Telegram

#### Commandes

- `/today` — Résumé des événements du jour
- `/week` — Top événements de la semaine
- `/top` — Top 3 événements par score d'intérêt
- `/deals` — Bons plans détectés (vols, promos)
- `/settings` — Modifier l'heure de notification

#### Notification quotidienne (automatique)

Format du message quotidien envoyé chaque matin :

```
🌞 Palmier — Mardi 8 février 2026

🔥 TOP DU JOUR

1. 🎧 Peggy Gou @ High Club — 23h
   📍 Nice centre | 💎 Premium | ⚡ High energy
   🎟 25€ | 🚨 Complet bientôt
   Score: 95/100

2. 🌊 Session Jet-ski group — 14h
   📍 Bord de mer, Nice | 💸 45€
   😎 Chill | 👯 Entre amis
   Score: 82/100

3. 🍸 Sunset Rooftop @ Hyatt — 18h
   📍 Nice centre | 🌅 Sunset | ❤️ Date
   💰 Petit budget
   Score: 78/100

📅 À ANTICIPER
- 🏎 GP Monaco — 23-25 mai | 🧭 Places dispo
- ✈️ Vol Nice→Barcelone 29€ A/R (−58%) | ⏱ Expire dans 2j

👉 Dashboard : https://palmier.local
```

### 6.3 Détection de bons plans voyage

Le crawler surveille les prix des vols au départ de Nice (NCE) et détecte :
- **Prix anormalement bas** : comparaison avec la moyenne des 30 derniers jours
- **Destinations week-end** : vols < 3h, A/R < 100€
- **Fenêtres courtes** : alerte si le prix remonte bientôt
- **Destinations populaires** : Barcelone, Rome, Londres, Lisbonne, Amsterdam, Marrakech

---

## 7. API Endpoints (FastAPI)

### Events

```
GET    /api/events                  # Liste événements (filtres, pagination)
GET    /api/events/{id}             # Détail événement
GET    /api/events/today             # Événements du jour
GET    /api/events/week              # Top de la semaine
GET    /api/events/month             # Top du mois
GET    /api/events/featured          # Événements mis en avant
```

### Tags

```
GET    /api/tags                     # Liste de tous les tags
GET    /api/tags/{category}          # Tags par catégorie
```

### Dashboard

```
GET    /api/dashboard/digest         # Résumé quotidien
GET    /api/dashboard/stats          # Stats (nb events, sources, etc.)
```

### Admin / Crawl

```
POST   /api/crawl/trigger            # Déclencher un crawl manuel
GET    /api/crawl/status             # Statut du dernier crawl
GET    /api/crawl/logs               # Historique des crawls
```

### Préférences

```
GET    /api/preferences              # Récupérer les préférences
PUT    /api/preferences              # Mettre à jour les préférences
```

---

## 8. Configuration & déploiement

### 8.1 Variables d'environnement (.env)

```env
# PocketBase
POCKETBASE_URL=http://localhost:8090
POCKETBASE_ADMIN_EMAIL=admin@palmier.local
POCKETBASE_ADMIN_PASSWORD=

# Claude API (Anthropic)
ANTHROPIC_API_KEY=

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Crawling
CRAWL_SCHEDULE_HOUR=7          # Heure du crawl quotidien (7h du matin)
CRAWL_TIMEOUT_SECONDS=300
MAX_EVENTS_PER_CRAWL=200

# FastAPI
API_HOST=0.0.0.0
API_PORT=8000
API_ENV=production

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8090
```

### 8.2 Docker Compose

```yaml
version: '3.8'
services:
  pocketbase:
    build: ./pocketbase
    ports:
      - "8090:8090"
    volumes:
      - pb_data:/pb/pb_data
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - pocketbase
    env_file: .env
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    env_file: .env
    restart: unless-stopped

volumes:
  pb_data:
```

### 8.3 Self-hosting (Raspberry Pi / NAS)

- **OS** : Raspberry Pi OS / Ubuntu Server
- **Reverse proxy** : Caddy (HTTPS automatique via Let's Encrypt)
- **Accès local** : `https://palmier.local`
- **Accès externe** (optionnel) : Cloudflare Tunnel ou Tailscale
- **Monitoring** : Uptime Kuma pour surveiller les services
- **Backup** : Cron job quotidien backup de `pb_data/`

---

## 9. Roadmap de développement

### Phase 1 — Fondations (Semaines 1-2)

- [ ] Initialiser le repo Git + structure du projet
- [ ] Setup Docker Compose (PocketBase + FastAPI + Next.js)
- [ ] Configurer PocketBase : collections, schéma, auth
- [ ] Créer le squelette FastAPI avec routes de base
- [ ] Créer le squelette Next.js avec pages et layout
- [ ] Configurer Tailwind CSS + composants de base

### Phase 2 — Crawling (Semaines 3-4)

- [ ] Implémenter le crawler abstrait (`base.py`)
- [ ] Crawler Shotgun (Playwright)
- [ ] Crawler Google Search (Scrapy)
- [ ] Crawler Eventbrite (API)
- [ ] Pipeline de normalisation des données
- [ ] Système de dédoublonnage (hash)
- [ ] Stocker les événements dans PocketBase
- [ ] APScheduler : crawl quotidien à 7h

### Phase 3 — Intelligence artificielle (Semaines 5-6)

- [ ] Intégration Claude API
- [ ] Système de tagging automatique
- [ ] Scoring d'intérêt personnalisé
- [ ] Génération de résumés événements
- [ ] Détection "événements featured"
- [ ] Optimisation des prompts / coûts API

### Phase 4 — Frontend Dashboard (Semaines 7-9)

- [ ] Page "Aujourd'hui" avec EventCards
- [ ] Page "Cette semaine" et "Ce mois"
- [ ] Composant FilterBar (filtres multi-critères)
- [ ] Page détail événement
- [ ] Vue carte (Leaflet / MapLibre)
- [ ] Responsive mobile
- [ ] Dark mode
- [ ] Animations (Framer Motion)
- [ ] Connexion temps réel PocketBase

### Phase 5 — Telegram Bot (Semaine 10)

- [ ] Setup bot Telegram
- [ ] Commande `/today`, `/week`, `/top`, `/deals`
- [ ] Notification quotidienne automatique
- [ ] Formatage des messages (Markdown Telegram)
- [ ] Commande `/settings` pour l'heure de notif

### Phase 6 — Bons plans voyage (Semaine 11)

- [ ] Crawler prix des vols (Skyscanner / Google Flights)
- [ ] Détection de prix anormalement bas
- [ ] Historique des prix (moyenne 30 jours)
- [ ] Alertes deals dans le bot Telegram
- [ ] Intégration dans le dashboard

### Phase 7 — Polish & déploiement (Semaine 12)

- [ ] Tests unitaires et d'intégration
- [ ] Optimisation performance (cache, lazy loading)
- [ ] Setup Docker sur Raspberry Pi / NAS
- [ ] Configuration Caddy (reverse proxy + HTTPS)
- [ ] Backup automatique PocketBase
- [ ] Monitoring (Uptime Kuma)
- [ ] Documentation utilisateur

### Phase 8 — Améliorations futures (Post-lancement)

- [ ] Apprentissage des préférences (like/dislike sur événements)
- [ ] Suggestions de groupe ("idéal pour une soirée entre potes")
- [ ] Intégration calendrier (Google Calendar / Apple Calendar)
- [ ] PWA (Progressive Web App) pour installation mobile
- [ ] Historique des événements passés (souvenirs)
- [ ] Multi-utilisateurs (partager avec des amis)
- [ ] Crawl de sources supplémentaires
- [ ] Mode "surprise me" (suggestion aléatoire pondérée)

---

## 10. Contraintes & décisions techniques

### Performances
- Le crawl tourne 1x/jour (7h du matin) pour limiter la charge
- Cache côté API (Redis optionnel, ou cache mémoire simple)
- PocketBase est suffisant pour un utilisateur unique

### Coûts
- **PocketBase** : gratuit (self-hosted)
- **Claude API** : ~$0.01-0.05 par événement taggé → budget ~$5-15/mois pour 200-500 events/mois
- **Hébergement** : gratuit (self-hosted)
- **Telegram** : gratuit
- **Total estimé** : < $15/mois

### Respect des sites crawlés
- Respecter `robots.txt` de chaque site
- Rate limiting : max 1 requête/seconde par source
- User-Agent identifié (pas de scraping agressif)
- Cache des pages pour éviter les requêtes redondantes

### Sécurité
- PocketBase admin protégé par mot de passe fort
- Variables sensibles dans `.env` (jamais commité)
- HTTPS via Caddy
- Accès réseau limité (Tailscale ou local uniquement)

---

## 11. Convention de code

### Python (Backend)
- Python 3.12+
- Formatter : `ruff format`
- Linter : `ruff check`
- Type hints obligatoires
- Docstrings Google style
- Tests avec `pytest`

### TypeScript (Frontend)
- TypeScript strict mode
- Formatter : `prettier`
- Linter : `eslint`
- Composants fonctionnels React
- Hooks personnalisés dans `hooks/`
- Types partagés dans `types/`

### Git
- Branches : `main`, `develop`, `feature/*`, `fix/*`
- Commits conventionnels : `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- PR obligatoires pour merge dans `main`
