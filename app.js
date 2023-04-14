//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const {Item,List} = require("./Item");
const _ = require("lodash");

mongoose.connect(process.env.MONGODB_URL);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const item1 = new Item({name: "Buy food"});

const item2 = new Item({name: "Cook Food"});

const item3 = new Item({name: "Eat Food"});

const defaultItems = [item1, item2, item3];



app.get("/", async (req, res) => {
  const items = await Item.find({});
  if (items.length === 0) {
    try {
      await Item.insertMany(defaultItems)
      console.log("Items Added Sucsussfully.");
    } catch (e) {
      console.log(e.message);
    } finally {
      res.redirect("/")
    }
  } else {
    res.render("list", {listTitle: "Today",newListItems: items});
  }

});

app.post("/", async (req, res) => {
  const itemName = req.body.newItem;

  const listName = req.body.list

  const item4 = new Item({name: itemName});

  if (listName === "Today") {
    await item4.save()
    res.redirect("/")
  } else {
    try {
      const foundList = await List.findOne({name:listName});
      foundList.items.push(item4);
      await foundList.save();

    } catch (e) {
      console.log(e.message);
    } finally {
      res.redirect("/" + listName);
    }

  }



});

app.post("/delete", async (req,res) =>{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  console.log(listName);

  if (listName === "Today") {
    try {
      await Item.findByIdAndRemove(checkedItemId)
      console.log("Sucsussfully deleted the document");
    } catch (e) {
      console.log(e.message);
    } finally {
      res.redirect("/")
    }

  } else {
    try {
      await List.findOneAndUpdate(
        {name:listName},{$pull:{items:{_id : checkedItemId}}})
    } catch (e) {
      console.log(e.message);
    } finally {
      res.redirect("/"+listName)
    }

  }



})

app.get("/:list",async (req,res) =>{
  const customListName = _.capitalize(req.params.list);

  const foundList = await List.findOne({name:customListName})

  if (!foundList) {
    const list = new List({
      name:customListName,
      items:defaultItems
    });
    await list.save();
    res.redirect("/" + customListName)
    // Create a new list
  }else{
    // Show an existing list
    res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
  }



  // const coustomLists = await List.find({});
  //
  // coustomLists.forEach((item) => {
  //   if (customListName === item.name) {
  //     console.log("Exists");
  //   } else {
  //     console.log("Not There");
  //   }
  //
  // });


});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
