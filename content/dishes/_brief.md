# Must-eat dishes: research brief

City Disco is a quest app across European regions (English only). Each region gets a short list of **must-eat local dishes**: things a visitor should eat at least once while in that region, wherever they find them. They are not tied to a venue.

## What to produce

For each region id you are given, write `content/dishes/<id>.json` (UTF-8):

```json
{
  "region": "ankara",
  "dishes": [
    {
      "id": "ankara-tava",
      "name": "Ankara tava",
      "local": "Ankara tavası",
      "icon": "🍖",
      "desc": "Lamb and orzo-like rice baked slowly in a clay dish until the top crisps. The city's own celebration dish, served at weddings and in old lokantas around Ulus.",
      "kw": ["ankara tava", "tava"]
    }
  ]
}
```

- **Count:** 5 per region. Use 4 when the region honestly has only four that stand out; go up to 6 or 7 only when it has an unusually rich, distinct kitchen (Istanbul, Lyon, Paris, Brussels and so on).
- **Specific to the region first.** Prefer dishes born in that city or its province or canton (Ankara tava, Beypazarı kurusu, Frankfurter Grüne Soße, Aachener Printen, Lyon quenelles, Liège waffle, Zürcher Geschnetzeltes, Basler Läckerli). At most two national classics per region, and do not give neighbouring regions in your batch the same national dish: spread herring, stroopwafel, currywurst, raclette, fondue and similar across the batch, each to the region with the strongest claim.
- **Food only:** dishes, street food, breads, pastries, sweets, cheeses. No drinks (no beer, wine or coffee) and no generic items (pizza, burger, sushi).
- Things a visitor can actually find and eat today, in normal restaurants, bakeries or stalls. Skip festival-only or extinct dishes.
- `name`: the usual English name, or the local name if English speakers use it (Bitterballen, Börek). Max 28 characters.
- `local`: the name in the local language, or "" if it is the same as `name`.
- `icon`: one food emoji that fits.
- `desc`: one or two sentences, max 220 characters. Say what it is, then why it belongs here. Concrete, plain, no hype ("unforgettable", "mouth-watering"), no exclamation marks, no venue names.
- `kw`: 1 to 3 lowercase words or phrases that would appear in a quest title or description about this dish (used to link quests that serve it). Make them specific enough not to match unrelated things ("tava", not "meat").
- `id`: `<region>-<short-slug>`, lowercase ASCII and hyphens.

## How

1. Load the web tools first: call ToolSearch with query `select:WebSearch,WebFetch`. This is required, not optional: run at least one search per region (for example "<city> local specialities dishes") and confirm each dish actually comes from that city or province, not a neighbouring one. Do not call Nominatim or any geocoder.
2. The region list with names, subtitles and areas is in `content/dishes/_regions.json`. A region covers its main city and its surroundings ("cevre" area), so a dish from a town in the surroundings counts.
3. Write the files with the Write tool. Check each one is valid JSON.
4. Reply with ONE line: the region ids and the dish count for each, for example `ankara 5, istanbul 7, izmir 5`. Add "from memory" for any region where web search failed and you relied on memory.
