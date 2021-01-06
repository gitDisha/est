//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-disha:Test123@cluster0.u90vf.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

//schema
const itemsSchema = {
  name: String,
};
//model or collection
const Item = new mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your Todo List!",
});

const item2 = new Item({
  name: "Hit the + button to add",
});

const item3 = new Item({
  name: " DO NOT Hit Kitan",
});

const defaultItems = [item1, item2, item3];

//Schema
const listSchema = {
  name: String,
  items: [itemsSchema]
};

//Model
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully saved default items to Database");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
    // console.log(foundItems);
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    console.log( listName);
    List.find({name : 'home'}, (err, found)=>{
      console.log(found);
    })
    // List.findOne({ name: listName }, function (err, foundList) {
    //   console.log(foundList);
    //   foundList.items.push(item);
    //   foundList.save();
    //   res.redirect("/" + listName); 
    // });
  }
});

app.post("/delete", function (req, res) {
  console.log(req.body);
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId, function (err) {
    if (!err) {
      console.log("Succesfully deleted the item");
      res.redirect("/");
    } else {
      console.log(err);
      res.redirect("/");
    }
  });
});

app.get("/:customList", function (req, res) {
  const customListName = req.params.customList;

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // Create a new List
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show the existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    } else {
      console.log(err);
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
