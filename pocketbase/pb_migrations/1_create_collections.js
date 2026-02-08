/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // ─────────────────────────────────────────────
  // Collection: events
  // ─────────────────────────────────────────────
  const events = new Collection({
    name: "events",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "title", type: "text", required: true },
      { name: "description", type: "text" },
      { name: "summary", type: "text" },
      { name: "date_start", type: "date", required: true },
      { name: "date_end", type: "date" },
      { name: "location_name", type: "text" },
      { name: "location_city", type: "text" },
      { name: "location_address", type: "text" },
      { name: "latitude", type: "number" },
      { name: "longitude", type: "number" },
      { name: "price_min", type: "number", min: 0 },
      { name: "price_max", type: "number", min: 0 },
      { name: "currency", type: "text" },
      { name: "source_url", type: "url" },
      { name: "source_name", type: "text" },
      { name: "image_url", type: "url" },
      { name: "tags_type", type: "json" },
      { name: "tags_vibe", type: "json" },
      { name: "tags_energy", type: "json" },
      { name: "tags_budget", type: "json" },
      { name: "tags_time", type: "json" },
      { name: "tags_exclusivity", type: "json" },
      { name: "tags_location", type: "json" },
      { name: "tags_audience", type: "json" },
      { name: "tags_deals", type: "json" },
      { name: "tags_meta", type: "json" },
      { name: "interest_score", type: "number" },
      { name: "is_featured", type: "bool" },
      { name: "status", type: "select", values: ["draft", "published", "expired", "cancelled"] },
      { name: "crawled_at", type: "date" },
      { name: "hash", type: "text" },
    ],
  })

  app.save(events)

  // ─────────────────────────────────────────────
  // Collection: sources
  // ─────────────────────────────────────────────
  const sources = new Collection({
    name: "sources",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "name", type: "text", required: true },
      { name: "base_url", type: "url" },
      { name: "crawler_type", type: "select", values: ["scrapy", "playwright", "api"] },
      { name: "is_active", type: "bool" },
      { name: "last_crawl", type: "date" },
      { name: "crawl_config", type: "json" },
      { name: "reliability", type: "number", min: 0, max: 100 },
    ],
  })

  app.save(sources)

  // ─────────────────────────────────────────────
  // Collection: crawl_logs
  // ─────────────────────────────────────────────
  const crawlLogs = new Collection({
    name: "crawl_logs",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "source", type: "text" },
      { name: "started_at", type: "date", required: true },
      { name: "finished_at", type: "date" },
      { name: "status", type: "select", values: ["success", "partial", "error"] },
      { name: "events_found", type: "number", min: 0 },
      { name: "events_new", type: "number", min: 0 },
      { name: "error_message", type: "text" },
    ],
  })

  app.save(crawlLogs)

  // ─────────────────────────────────────────────
  // Collection: user_preferences
  // ─────────────────────────────────────────────
  const userPreferences = new Collection({
    name: "user_preferences",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "favorite_tags", type: "json" },
      { name: "blocked_tags", type: "json" },
      { name: "favorite_locations", type: "json" },
      { name: "max_budget", type: "number", min: 0 },
      { name: "telegram_chat_id", type: "text" },
      { name: "notif_time", type: "text" },
      { name: "notif_enabled", type: "bool" },
    ],
  })

  app.save(userPreferences)
}, (app) => {
  // ─────────────────────────────────────────────
  // Revert: delete all collections in reverse order
  // ─────────────────────────────────────────────
  app.delete(app.findCollectionByNameOrId("user_preferences"))
  app.delete(app.findCollectionByNameOrId("crawl_logs"))
  app.delete(app.findCollectionByNameOrId("sources"))
  app.delete(app.findCollectionByNameOrId("events"))
})
