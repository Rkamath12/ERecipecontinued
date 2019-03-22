//Requirements
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate');
const firebase = require('firebase-admin');
const bodyParser = require('body-parser');

var provider = new firebase.auth.GoogleAuthProvider();
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

index.post('/update',(req,res)=>{
    updateRating(req.body.key,req.body.value_rating)
    res.send("200 OK")
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
        procedure: procedure,
        num_rating: 0,
        total_rating: 0
      }).then(ref => {
        console.log('Added document with ID: ', ref.id);
        return 1;
      });
}

//Authentication


function googleLogin(){
    firebase.auth().signInWithPopup(provider).then(function(result) {
        var token = result.credential.accessToken;
        var user = result.user;
    }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
    });
}


//Get Rating

function getRating(total_rating, num_rating){
    rating = total_rating/num_rating
    return rating
}

//Update Rating
function updateRating(key,value_rating){
    var recipeRating = db.collection('recipe').doc(key)
    var transaction = db.runTransaction(t => {
        return t.get(recipeRating)
          .then(doc => {
            var new_num_rating = doc.data().num_rating + 1;
            t.update(recipeRating, {num_rating:new_num_rating});
            var new_total_rating = doc.data().total_rating + value_rating;
            t.update(recipeRating, {total_rating:new_total_rating});
          });
      }).then(result => {
        console.log('Transaction success!');
      }).catch(err => {
        console.log('Transaction failure:', err);
      });
}

//Exporting 
exports.index = functions.https.onRequest(index);
