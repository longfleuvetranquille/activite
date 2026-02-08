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
  })

  flightPrices.fields = [
    new TextField({ name: "route", required: true }),
    new TextField({ name: "origin", required: true }),
    new TextField({ name: "destination", required: true }),
    new TextField({ name: "destination_city" }),
    new DateField({ name: "departure_date" }),
    new DateField({ name: "return_date" }),
    new NumberField({ name: "price", min: 0, required: true }),
    new TextField({ name: "currency" }),
    new TextField({ name: "airline" }),
    new NumberField({ name: "flight_duration", min: 0 }),
    new BoolField({ name: "is_direct" }),
    new TextField({ name: "source_url" }),
    new DateField({ name: "crawled_at", required: true }),
  ]

  app.save(flightPrices)
}, (app) => {
  // ─────────────────────────────────────────────
  // Revert: delete flight_prices collection
  // ─────────────────────────────────────────────
  app.delete(app.findCollectionByNameOrId("flight_prices"))
})
