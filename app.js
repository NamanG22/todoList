const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
app.set('view engine','ejs');

mongoose.connect("mongodb+srv://gargnaman352:NamaNiscool1!@cluster0.wydypqz.mongodb.net/todoList");

const tasksSchema = new mongoose.Schema({
  name:String
});

const listSchema = new mongoose.Schema({
  name:String,
  tasks:[tasksSchema]
})

const Task = mongoose.model("Task",tasksSchema)
const List = mongoose.model("List",listSchema)

const task1 = new Task({
  name: "Welcome to your todolist!"
})
const task2 = new Task({
  name: "Hit the + button to add a new item."
})
const task3 = new Task({
  name: "<-- Hit this to delete an item."
})

const task = new Task({
  name:"Sleep"
})

const dailyTasks = [task1,task2,task3];
// Task.insertMany(dailyTasks);


app.get("/",function(req,res){
  
  async function findTasks() {
    const tasks = await Task.find({});
    if(tasks.length===0){
      Task.insertMany(dailyTasks);
    }
    res.render('list',{listType: "Today",items: tasks});
  }
  findTasks();
})

app.get("/about", function(req, res){
  res.render("about");
});

app.get('/favicon.ico', (req,res)=>{
  return;
})

app.get("/:newPage",function(req,res){
  // const pageName =req.params.newPage;
  const pageName =_.capitalize(req.params.newPage);
  // if(req.params.newPage === pageName){

    async function findTasks() {
      const listItems = await List.findOne({name:pageName});
      if(!listItems){
        console.log("doesn't exist");
        const list = new List({
          name:pageName,
          tasks:dailyTasks
        });
        list.save();
        const listItemsAgain = await List.findOne({name:pageName});
        res.render('list',{listType:pageName,items: listItems.tasks});
        // res.redirect("/"+pageName);
      }
      else{
        res.render('list',{listType:listItems.name,items: listItems.tasks});
      }
  }
  findTasks();
})



app.post("/",function(req,res)  {

  var item = req.body.task;
  var itemList = req.body.list;

  const newTask = new Task({
    name:item
  })
  async function insertTask() {
    const insertedTask = await Task.insertMany(newTask);
  }

  if(req.body.list==="Today"){
    if(item){
      insertTask();
    }
    res.redirect("/");
  }
  else{
      if(item){
        async function findTaskList() {
          const newInsertedTask = await List.findOne({name:itemList});
          newInsertedTask.tasks.push(newTask);
          newInsertedTask.save();
          res.redirect("/"+itemList);
        }
        findTaskList();
      }
  }
});
app.post("/done",function(req,res)  {

  let [task,listType] = req.body.isDone.split(":");

  async function deleteTask() {
    const doneTask = await Task.findByIdAndDelete(task);
    res.redirect("/");
  }

  async function deleteTaskList() {
    const findTask = await List.findOneAndUpdate({name:listType},
      { $pull: { tasks: { _id: task } } }
    )
  }

  if(listType!=="Today"){
    deleteTaskList();
    res.redirect("/"+listType);
  }
  else{
    deleteTask();
  }
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
