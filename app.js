const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const Item = require("./models/models");
const List = require("./models/models");
const _ = require("lodash");
const app = express();
const { MongoClient } = require('mongodb');

app.use(
  express.urlencoded({
    extended: true,
  })
  );
  app.set("view engine", "ejs");
  app.use(express.static("public"));

  
// Connect MongoDB at default port 27017.
mongoose.connect(
  `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.q6tuw.mongodb.net/todolistDB`,
  {
    useFindAndModify: false,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  },
  (err) => {
    if (!err) {
      console.log("MongoDB Connection Succeeded.");
    } else {
      console.log("Error in DB connection: " + err);
    }
  }
);

// CREATING MODEL / COLLLECTION FOR DEFAULT ITEMSS

const doc1 = new Item({ name: "Welcome to your to do list!" });
const doc2 = new Item({ name: "Hit the + button to add new items." });
const doc3 = new Item({ name: "<-- Hit this to delete an Item" });
const defaultItems = [doc1, doc2, doc3];

// Render default items
app.get("/", function (req, res) {
  Item.find({}, (err, docs) => {
    if (docs.length == 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("inserted successfully");
          res.redirect("/");
        }
      });
    } else {
      res.render("list", {listTitle: "Today", newListItems: docs,});
    }
  });
});

// Task or list entered by the users //
app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({ name: itemName });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

// Deleting item
app.post("/delete", function (req, res) {
  let selectedItem = req.body.checkItem;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(selectedItem, (err) => {
      if (!err) {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: selectedItem } } },
      (err, foundList) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  const list = new List({ name: customListName, items: defaultItems });

  List.findOne({ name: customListName }, (err, foundLists) => {
    if (!err) {
      if (!foundLists) {
        // If not exist
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: foundLists.name, newListItems: foundLists.items,});
      }
    }
  });
});

app.get("/about", function (res, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server has started successfully");
});
