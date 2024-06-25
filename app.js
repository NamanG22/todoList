const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
app.set('view engine','ejs');

mongoose.connect("mongodb+srv://gargnaman352:NamaNiscool1!@cluster0.wydypqz.mongodb.net/todoList");


import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDatD4O1SXZ8pCmN6U0x4AaZ-HHXIIr2PQ",
  authDomain: "todolist-1f091.firebaseapp.com",
  projectId: "todolist-1f091",
  storageBucket: "todolist-1f091.appspot.com",
  messagingSenderId: "335223838844",
  appId: "1:335223838844:web:1605d18efe924f962a11f9",
  measurementId: "G-JTR8FHW43Y"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
  name:"LeetCode Daily"
})
const task2 = new Task({
  name:"CSSBattle Daily"
})
const task3 = new Task({
  name:"WebD by Angela Yu"
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

app.get('/favicon.ico', (req,res)=>{
  return;
})

app.get("/:newPage",function(req,res){
  const pageName = req.params.newPage;
  const sPageName = pageName.toLowerCase();
  async function findTasks() {
    const listItems = await List.findOne({name:sPageName});
    if(!listItems){
      console.log("doesn't exist");
      const list = new List({
        name:sPageName,
        tasks:dailyTasks
      })
      List.insertMany(list);
      res.redirect("/"+pageName);
    }
    else{
      res.render('list',{listType: _.capitalize(listItems.name),items: listItems.tasks});
    }
  }
  findTasks();
})


app.get("/about", function(req, res){
  res.render("about");
});

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
          console.log(newInsertedTask.tasks);
          newInsertedTask.tasks.push(newTask);
          newInsertedTask.save();
        }
        findTaskList();
      }
      res.redirect("/"+itemList);
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
