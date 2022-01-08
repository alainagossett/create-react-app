//Require Dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const { PORT = 3001 } = process.env;

//Initialize the App
const app = express();

//Configure Settings
require('dotenv').config();

//Mount Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json())

//Connect and Configure MongoDB
mongoose.connect(process.env.DATABASE_URL)

mongoose.connection
    .on('open', () => console.log('Connected to MongoDB'))
    .on('close', () => console.log('Disconnected from MongoDB'))
    .on('error', (error) => console.log(error))

//Models
const PeopleSchema = new mongoose.Schema({
    name: String,
    image: String,
    title: String
})

const People = mongoose.model("People", PeopleSchema)

//Define Routes

//test route
app.get('/', (req, res) => {
    res.send("Hello World")
});

//PEOPLE INDEX ROUTE
app.get('/people', async(req, res) => {
    try {
        res.json(await People.find({}))
    } catch(error) {
        res.status(400).json(error)
    }
})

//PEOPLE CREATE ROUTE
app.post('/people', async(req, res) => {
    try {
        res.json(await People.create(req.body))
    } catch(error) {
        res.status(400).json(error)
    }
})

//PEOPLE DELETE ROUTE
app.delete('/people/:id', async(req, res) => {
    try {
        res.json(await People.findByIdAndDelete(req.params.id))
    } catch (error) {
        res.status(400).json(error)
    }
})

//PEOPLE UPDATE ROUTE
app.put('/people/:id', async(req, res) => {
    try {
        res.json(await People.findByIdAndUpdate(req.params.id, req.body, { new: true }))
    } catch(error) {
        res.status(400).json(error)
    }
})


//Tell the app to listen
app.listen(PORT, () => console.log(`listening on PORT ${PORT}`));