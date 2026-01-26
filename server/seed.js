const MapModel = require("./models/Map");
const CellModel = require("./models/Cell");

async function seedDefaultMap() {
  const existing = await MapModel.findOne({ name: "Starter Town" });
  const map =
    existing ||
    (await MapModel.create({ name: "Starter Town", allowedGridModes: [9], cellSizeWorld: 10 }));

  const gridMode = 9;
  const totalCells = 9;

  for (let i = 0; i < totalCells; i += 1) {
    await CellModel.updateOne(
      { mapId: map._id, gridMode, cellIndex: i },
      { $setOnInsert: { status: "empty" } },
      { upsert: true }
    );
  }

  return map;
}

module.exports = { seedDefaultMap };
