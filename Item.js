const mongoose = require('mongoose');

const itemSchema = {
  name: String
}

const Item = mongoose.model("Item",itemSchema)

const listSchema = {
  name : String,
  items : [itemSchema]
};

const List = mongoose.model("List",listSchema)

module.exports =  {
  Item:Item,
  List:List
}
