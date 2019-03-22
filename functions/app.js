//Requirements
const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate');
const firebase = require('firebase-admin');

//Initialization
const firebaseApp = firebase.initializeApp(
    functions.config().firebase
);

const app = express();
app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');


//HTTPS GET requests
    //Index render at '/'
app.get('/',(request,response) => {
    response.render('index');
});

//Exporting 
exports.app = functions.https.onRequest(app);
