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

/* var provider = new firebase.auth.GoogleAuthProvider();
function googleLogin(){
    firebase.auth().signInWithPopup(provider).then((result) => {
        var token = result.credential.accessToken;
        var user = result.user;
        return 1;
    }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
    });
} */

function onSignIn(googleUser) {
    console.log('Google Auth Response', googleUser);
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    var unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
        unsubscribe();
        // Check if we are already signed-in Firebase with the correct user.
        if (!isUserEqual(googleUser, firebaseUser)) {
            // Build Firebase credential with the Google ID token.
            var credential = firebase.auth.GoogleAuthProvider.credential(
                googleUser.getAuthResponse().id_token);
            // Sign in with credential from the Google user.
            firebase.auth().signInAndRetrieveDataWithCredential(credential).catch((error) => {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
                // ...
            });
        } else {
            console.log('User already signed-in Firebase.');
        }
    });
}

function isUserEqual(googleUser, firebaseUser) {
    if (firebaseUser) {
        var providerData = firebaseUser.providerData;
        for (var i = 0; i < providerData.length; i++) {
            if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
                providerData[i].uid === googleUser.getBasicProfile().getId()) {
                // We don't need to reauth the Firebase connection.
                return true;
            }
        }
    }
    return false;
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
            return 1;
          });
      }).then(result => {
        console.log('Transaction success!');
        return 1;
      }).catch(err => {
        console.log('Transaction failure:', err);
      });
}

//Exporting 
exports.index = functions.https.onRequest(index);
