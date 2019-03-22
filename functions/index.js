//Requirements
const fire = require('firebase');
const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate');
const firebase = require('firebase-admin');
const bodyParser = require('body-parser');

firebase.initializeApp({
    credential: firebase.credential.cert({
        projectId: 'erecipe-4b9f5',
        clientEmail: 'firebase-adminsdk-yaduo@erecipe-4b9f5.iam.gserviceaccount.com',
        privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC4R7ruQLmyj1LY\nD12wa4AW1xwfBanq6aMaHMv6dS44GAGmwPPp58+OhRurrJis8MrlT2w2vn4djVcy\n47JZjXQ5BCnaSxMLH7La8RnBGyKHiDZ6ji9QsKNGBkIqu7W/f9DeC3/qUdCqwQJ3\n60M7/0Wo1thY2kpGklAPDEBeyGRR2/JD8CPIZ16ll18bIjH1ZadCXk7oAKQIN/W2\n83oQEPKbEVzh+T1q/KNCQZn/6iKJM5ya1cE43VhzWvpcN0dIi9DuxxKvo62sX40V\nFHTpgJZZyvjKa1VjdBDxiJiJWdwLrVrRk3wJr3ZbqRZ38hN/JlA3/AD7XfgItOk9\n9nYED69DAgMBAAECggEAAaXSjBLUFj6l1Py+L7emW43s2HIqhMk2BiO/xyuJEENW\nsHEFPVAvUOzrxGs0qkc06Tv+kba+VfFPmErk61wSb/gTj7ogH3dXGBIT0uA1PNUA\n97ORxLzvmM6xhMRM6btw2Kttp2C35u724K+f2Ed+DfZt1M2O4HaqdJf9c1uDWiAD\nbx3r+fE7FVUUpCUDvm91Qzg/fs+6VxO8uI/qqEct28OUGkDmVhRJ0W9ayam3mUwX\nIabcHXlzADiOAN9GcyduD6NRE4oM7WE1CWfWroRZ33xAzvCBm5Ddl29KilN3AhAx\nSGkYrLO5JLyjY0rfaseo/ISg0xR0R1NVOE59vUjfAQKBgQD0rPkj04VV77obog7b\nLb51sWMfvxtf2RHb1I883ysUjolRBmpf+nibg4zDNLLWHHNLnApqc6IQUXUBBnZx\n64lyGjTdLDSnZy/BynmGmYLrpF54ThjCTA8Vo2Ri0fvts/yeX9EcZmiNepMLERLo\nfZPN735V3uRGxqHsMBgcSf0MwQKBgQDAzyoSXTO3NVsXQG8g2XnkYgOb6XQNqW+U\n8ra1relNeR5ibee6ECI366Cla8KK47aEqEzAWDT1Reo+m/dM4B6sH/ud/GN2WviR\nW7J7syTQWaDL+nAKwm/VmqSoV0FjoI7yWgDOsDWAtJ8qAydgdG7J2bJg+PfJ0Yiz\n0bVD+1XJAwKBgALz/4HOMMLLxOxGdXVxxOW4wWCFtvfeL9f+ZcgvTV7PJZsjv67u\n3/vIh69neG0bJM0Z0gpc4OzfftEHWfCgDiWhaVfuC6illy74maTlP25Gqpk7IBNg\nRaJWOYTz0d2ZmYfz0htMpSBoBVRR3W+O7HTE2jqBGTI9fYDTR8c3oWVBAoGAbHff\nPkeKoYX1weXw3rUaGr59M0gpjsoESPImkZzOBFSgIFWeKJGM/pKjZIxz/HjQpF6e\nFxNIb7euaRyLCoeHGeRARIfJWLsi3XuNtIN6sW/KwxYX1CXAjpWaDk5QLgEUigjS\nLXT6FHcIl7UAgQXfkdTTwjQuCi7Dzg2rARyzDQsCgYAHatlGvNMUJuf7iP81zVW4\n4FdcehTlx/Leu50srwnhxwQYFJS05SyZYX5XmYYRZNpfHomv6mJRWX4MdypzvcTZ\nmiKtXvvRjRgw7ususohhIqd9kvulHSjvo3uHZqHq/7Ad9USafNJIiYENAYuUPF7y\nZwOhBdX3qNtwAvpLpYTDtw==\n-----END PRIVATE KEY-----\n'
    }),
    databaseURL: "https://erecipe-4b9f5.firebaseio.com"
},'admin');

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
var db = firebase.firestore();
var recipeRef = db.collection('recipes');

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

var provider = new fire.auth.GoogleAuthProvider();
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
}




//Get Rating

function getRating(total_rating, num_rating){
    rating = total_rating/num_rating
    return rating
}

//Update Rating
function updateRating(key,value_rating){
    var recipeRating = db.collection('recipes').doc(key)
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

//Filter

function filterResults(ingredients){
    var recipes = db.collection('recipe');
    ingredients.forEach(element => {
        recipes = recipes.where('ingredients','array-contains',element)
    });
    return recipes
}

//Search

function searchResults(name){
    var recipes = db.collection('recipe').where('name','==', name)
    return recipes
}


//Exporting 
exports.index = functions.https.onRequest(index);
