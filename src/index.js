const express = require('express');
const morgan = require('morgan');
const cors =require('cors');

const tracksRoutes = require('./routes/tracks.routes');

//initializations
const app = express();

//middlewares
app.use(morgan('dev'));

//routes
app.use(tracksRoutes);

app.listen(3000);
console.log('Server on port 3000');
