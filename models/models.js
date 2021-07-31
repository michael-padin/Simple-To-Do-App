const mongoose = require("mongoose");


// CREATING SCHEMA FOR DEFAULT ITEMS//
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});
  
  // New Schema for list items
  const listsSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema],
  });

module.exports = new mongoose.model("item", itemsSchema);
module.exports = mongoose.model("List", listsSchema);
