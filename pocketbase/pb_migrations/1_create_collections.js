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
  })

  events.fields = [
    new TextField({ name: "title", required: true }),
    new TextField({ name: "description" }),
    new TextField({ name: "summary" }),
    new DateField({ name: "date_start", required: true }),
    new DateField({ name: "date_end" }),
    new TextField({ name: "location_name" }),
    new TextField({ name: "location_city" }),
    new TextField({ name: "location_address" }),
    new NumberField({ name: "latitude" }),
    new NumberField({ name: "longitude" }),
    new NumberField({ name: "price_min", min: 0 }),
    new NumberField({ name: "price_max", min: 0 }),
    new TextField({ name: "currency" }),
    new UrlField({ name: "source_url" }),
    new TextField({ name: "source_name" }),
    new UrlField({ name: "image_url" }),
    new JsonField({ name: "tags_type" }),
    new JsonField({ name: "tags_vibe" }),
    new JsonField({ name: "tags_energy" }),
    new JsonField({ name: "tags_budget" }),
    new JsonField({ name: "tags_time" }),
    new JsonField({ name: "tags_exclusivity" }),
    new JsonField({ name: "tags_location" }),
    new JsonField({ name: "tags_audience" }),
    new JsonField({ name: "tags_deals" }),
    new JsonField({ name: "tags_meta" }),
    new NumberField({ name: "interest_score" }),
    new BoolField({ name: "is_featured" }),
    new SelectField({
      name: "status",
      values: ["draft", "published", "expired", "cancelled"],
    }),
    new DateField({ name: "crawled_at" }),
    new TextField({ name: "hash" }),
  ]

  app.save(events)

  // Set defaults via direct DB after creation (PocketBase handles defaults at
  // the application layer; we define them here for documentation and the admin
  // UI will respect the field zero-values).

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
  })

  sources.fields = [
    new TextField({ name: "name", required: true }),
    new UrlField({ name: "base_url" }),
    new SelectField({
      name: "crawler_type",
      values: ["scrapy", "playwright", "api"],
    }),
    new BoolField({ name: "is_active" }),
    new DateField({ name: "last_crawl" }),
    new JsonField({ name: "crawl_config" }),
    new NumberField({ name: "reliability", min: 0, max: 100 }),
  ]

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
  })

  crawlLogs.fields = [
    new TextField({ name: "source" }),
    new DateField({ name: "started_at", required: true }),
    new DateField({ name: "finished_at" }),
    new SelectField({
      name: "status",
      values: ["success", "partial", "error"],
    }),
    new NumberField({ name: "events_found", min: 0 }),
    new NumberField({ name: "events_new", min: 0 }),
    new TextField({ name: "error_message" }),
  ]

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
  })

  userPreferences.fields = [
    new JsonField({ name: "favorite_tags" }),
    new JsonField({ name: "blocked_tags" }),
    new JsonField({ name: "favorite_locations" }),
    new NumberField({ name: "max_budget", min: 0 }),
    new TextField({ name: "telegram_chat_id" }),
    new TextField({ name: "notif_time" }),
    new BoolField({ name: "notif_enabled" }),
  ]

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
