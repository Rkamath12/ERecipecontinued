//Requirements
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate');
const firebase = require('firebase-admin');
const bodyParser = require('body-parser');

//Initialization
const firebaseApp = firebase.initializeApp(
    functions.config().firebase
);

const index = express();
index.engine('hbs', engines.handlebars);
index.set('views', './views');
index.set('view engine', 'hbs');

index.use(bodyParser.urlencoded({
    extended:true
}));

index.use(bodyParser.json())


//HTTPS GET requests
    //Index render at '/'
index.get('/',(request,response) => {
    response.render('index');
});

//HTTPS POST requests
    //Database interaction when recieving data
index.post('/',(request, response) => {
    addRecipe(request.body.name,request.body.id,request.body.user,request.body.cuisine,request.body.time,
        request.body.serving,request.body.ingredients,request.body.difficulty,request.body.procedure);
        response.send("200 OK");
})

//Database
var database = firebase.database();
var db = admin.firestore();
var recipeRef = db.collection('recipe');

function addRecipe(name, id, user, cuisine, time, serving, ingredients, difficulty, procedure){
    var addDoc = db.collection('recipes').add({
        name: name,
        id: id,
        user: user,
        cuisine: cuisine,
        time: time,
        serving: serving,
        ingredients: ingredients,
        difficulty: difficulty,
        procedure: procedure
      }).then(ref => {
        console.log('Added document with ID: ', ref.id);
        return 1;
      });
}

//Exporting 
exports.index = functions.https.onRequest(index);
