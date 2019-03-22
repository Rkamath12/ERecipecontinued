//Requirements
const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate');
const firebase = require('firebase-admin');

//Initialization
const firebaseApp = firebase.initializeApp(
    functions.config().firebase
);

const index = express();
index.engine('hbs', engines.handlebars);
index.set('views', './views');
index.set('view engine', 'hbs');


//HTTPS GET requests
    //Index render at '/'
index.get('/',(request,response) => {
    response.render('index');
});

//Exporting 
exports.index = functions.https.onRequest(index);
