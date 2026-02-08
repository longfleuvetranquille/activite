/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // ─────────────────────────────────────────────
  // Collection: flight_prices
  // ─────────────────────────────────────────────
  const flightPrices = new Collection({
    name: "flight_prices",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "route", type: "text", required: true },
      { name: "origin", type: "text", required: true },
      { name: "destination", type: "text", required: true },
      { name: "destination_city", type: "text" },
      { name: "departure_date", type: "date" },
      { name: "return_date", type: "date" },
      { name: "price", type: "number", min: 0, required: true },
      { name: "currency", type: "text" },
      { name: "airline", type: "text" },
      { name: "flight_duration", type: "number", min: 0 },
      { name: "is_direct", type: "bool" },
      { name: "source_url", type: "text" },
      { name: "crawled_at", type: "date", required: true },
    ],
  })

  app.save(flightPrices)
}, (app) => {
  // ─────────────────────────────────────────────
  // Revert: delete flight_prices collection
  // ─────────────────────────────────────────────
  app.delete(app.findCollectionByNameOrId("flight_prices"))
})
