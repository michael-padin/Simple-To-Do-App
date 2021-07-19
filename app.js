const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.set("view engine", "ejs");
app.use(express.static("public"));

// Connect MongoDB at default port 27017.
mongoose.connect(
  "mongodb+srv://admin-seek:Mockey0821@cluster0.q6tuw.mongodb.net/todolistDB",
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

// CREATING SCHEMA FOR DEFAULT ITEMS//
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
  },
});

// CREATING MODEL / COLLLECTION FOR DEFAULT ITEMSS
const Item = new mongoose.model("item", itemsSchema);
const doc1 = new Item({
  name: "Welcome to your to do list!",
});

const doc2 = new Item({
  name: "Hit the + button to add new items.",
});

const doc3 = new Item({
  name: "<-- Hit this to delete an Item",
});

const defaultItems = [doc1, doc2, doc3];

// INSERTING DOCUMEMTS IN A COLLECTION //
// Item.insertMany(defaultItems, (err) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log("inserted successfully");
//   }
// });

// DELETING ALL DOCUMENTS IN A COLLECTION //
// Item.deleteMany({name: "Hit the + button to add new items."}, (err) =>{
//     if(!err) {
//         console.log("successfully deleted");

//     } else {
//         console.log(err);
//     }
// });

// Render default items
app.get("/", function (req, res) {
  Item.find({}, (err, docs) => {
    if (docs.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (!err) {
          console.log("inserted successfully");
        } else {
          console.log(err);
        }
        res.redirect("/");
      });
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: docs,
      });
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
    Lists.findOne({ name: listName }, (err, foundList) => {
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
    Lists.findOneAndUpdate(
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

// New Schema for list items
const listsSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

// Creating model for List items
const Lists = mongoose.model("List", listsSchema);

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  const list = new Lists({ name: customListName, items: defaultItems });

  Lists.findOne({ name: customListName }, (err, foundLists) => {
    if (!err) {
      if (!foundLists) {
        // If not exist
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundLists.name,
          newListItems: foundLists.items,
        });
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
