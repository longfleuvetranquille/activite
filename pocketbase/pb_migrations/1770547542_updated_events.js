/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1687431684")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text724990059",
    "max": 0,
    "min": 0,
    "name": "title",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1843675174",
    "max": 0,
    "min": 0,
    "name": "description",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3458754147",
    "max": 0,
    "min": 0,
    "name": "summary",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "date629783811",
    "max": "",
    "min": "",
    "name": "date_start",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "date2985325764",
    "max": "",
    "min": "",
    "name": "date_end",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3727149894",
    "max": 0,
    "min": 0,
    "name": "location_name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2908731252",
    "max": 0,
    "min": 0,
    "name": "location_city",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3809180709",
    "max": 0,
    "min": 0,
    "name": "location_address",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "number1092145443",
    "max": null,
    "min": null,
    "name": "latitude",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number2246143851",
    "max": null,
    "min": null,
    "name": "longitude",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1767278655",
    "max": 0,
    "min": 0,
    "name": "currency",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "exceptDomains": null,
    "hidden": false,
    "id": "url2776776943",
    "name": "source_url",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1604975365",
    "max": 0,
    "min": 0,
    "name": "source_name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "exceptDomains": null,
    "hidden": false,
    "id": "url2895943165",
    "name": "image_url",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "hidden": false,
    "id": "json2205809529",
    "maxSize": 0,
    "name": "tags_type",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "hidden": false,
    "id": "json1302519889",
    "maxSize": 0,
    "name": "tags_vibe",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(19, new Field({
    "hidden": false,
    "id": "json4073374881",
    "maxSize": 0,
    "name": "tags_energy",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(20, new Field({
    "hidden": false,
    "id": "json371804747",
    "maxSize": 0,
    "name": "tags_budget",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(21, new Field({
    "hidden": false,
    "id": "json1613968405",
    "maxSize": 0,
    "name": "tags_time",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(22, new Field({
    "hidden": false,
    "id": "json1447281351",
    "maxSize": 0,
    "name": "tags_exclusivity",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(23, new Field({
    "hidden": false,
    "id": "json872945106",
    "maxSize": 0,
    "name": "tags_location",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(24, new Field({
    "hidden": false,
    "id": "json2539325441",
    "maxSize": 0,
    "name": "tags_audience",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(25, new Field({
    "hidden": false,
    "id": "json2220716739",
    "maxSize": 0,
    "name": "tags_deals",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(26, new Field({
    "hidden": false,
    "id": "json3629496421",
    "maxSize": 0,
    "name": "tags_meta",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(27, new Field({
    "hidden": false,
    "id": "number3594114778",
    "max": null,
    "min": null,
    "name": "interest_score",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(28, new Field({
    "hidden": false,
    "id": "bool2847551440",
    "name": "is_featured",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(29, new Field({
    "hidden": false,
    "id": "select2063623452",
    "maxSelect": 0,
    "name": "status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "draft",
      "published",
      "expired",
      "cancelled"
    ]
  }))

  // add field
  collection.fields.addAt(30, new Field({
    "hidden": false,
    "id": "date3830424528",
    "max": "",
    "min": "",
    "name": "crawled_at",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(31, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3518522040",
    "max": 0,
    "min": 0,
    "name": "hash",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1687431684")

  // remove field
  collection.fields.removeById("text724990059")

  // remove field
  collection.fields.removeById("text1843675174")

  // remove field
  collection.fields.removeById("text3458754147")

  // remove field
  collection.fields.removeById("date629783811")

  // remove field
  collection.fields.removeById("date2985325764")

  // remove field
  collection.fields.removeById("text3727149894")

  // remove field
  collection.fields.removeById("text2908731252")

  // remove field
  collection.fields.removeById("text3809180709")

  // remove field
  collection.fields.removeById("number1092145443")

  // remove field
  collection.fields.removeById("number2246143851")

  // remove field
  collection.fields.removeById("text1767278655")

  // remove field
  collection.fields.removeById("url2776776943")

  // remove field
  collection.fields.removeById("text1604975365")

  // remove field
  collection.fields.removeById("url2895943165")

  // remove field
  collection.fields.removeById("json2205809529")

  // remove field
  collection.fields.removeById("json1302519889")

  // remove field
  collection.fields.removeById("json4073374881")

  // remove field
  collection.fields.removeById("json371804747")

  // remove field
  collection.fields.removeById("json1613968405")

  // remove field
  collection.fields.removeById("json1447281351")

  // remove field
  collection.fields.removeById("json872945106")

  // remove field
  collection.fields.removeById("json2539325441")

  // remove field
  collection.fields.removeById("json2220716739")

  // remove field
  collection.fields.removeById("json3629496421")

  // remove field
  collection.fields.removeById("number3594114778")

  // remove field
  collection.fields.removeById("bool2847551440")

  // remove field
  collection.fields.removeById("select2063623452")

  // remove field
  collection.fields.removeById("date3830424528")

  // remove field
  collection.fields.removeById("text3518522040")

  return app.save(collection)
})
