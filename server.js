const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser'); // Dodaj ovaj redak

const dotenv = require('dotenv').config();
const indexRouter = require('./routes/index');
const blogGeneratorRoute = require('./routes/blogGenerator');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.json()); // Dodaj ovaj redak za obradu JSON-a
app.use(bodyParser.urlencoded({ extended: true })); // Dodaj ovaj redak za obradu URL enkodiranih podataka

app.use('/', indexRouter);
app.use('/routes', blogGeneratorRoute); // Izmeni rutu u '/api'

app.listen(process.env.PORT || 4000);
