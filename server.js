//Require Dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const { PORT = 3001 } = process.env;

//Google Firebase admin configs
const admin = require('firebase-admin');

const serviceAccount = require('./service-account-credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


//Initialize the App
const app = express();

//Configure Settings
require('dotenv').config();

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
    title: String,
    uId: {
        type: String,
        default: '4xOxaXL7AzQId1uvV2bZz4CezL93'
    }

})

const People = mongoose.model("People", PeopleSchema)

//Mount Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json())

//Function for Authentication
async function isAuthenticated(req, res, next) {
    try {
        const token = req.get('Authorization');
        if(!token) throw new Error('You must be logged in first')
        
        const user = await admin.auth().verifyIdToken(token.replace('Bearer ', ''));
        if(!user) throw new Error('Something went wrong')
        
        req.user = user;
    
        next();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
    // console.log(user);
}





//Define Routes

//test route
app.get('/', (req, res) => {
    res.send("Hello World")
});

async function index (req, res) {
    try {
        res.json(await People.find({ uId: req.user.uid }))
    } catch(error) {
        res.status(400).json(error)
    }
}

//PEOPLE INDEX ROUTE
app.get('/people', isAuthenticated, index)

//PEOPLE CREATE ROUTE
app.post('/people', isAuthenticated, async(req, res) => {
    try {
        req.body.uId = req.user.uid;
        await People.create(req.body)
        index(req, res);
    } catch(error) {
        res.status(400).json(error)
    }
})

//PEOPLE DELETE ROUTE
app.delete('/people/:id', isAuthenticated, async(req, res) => {
    try {
        await People.findByIdAndDelete(req.params.id)
        index(req, res);
    } catch (error) {
        res.status(400).json(error)
    }
})

//PEOPLE UPDATE ROUTE
app.put('/people/:id', isAuthenticated, async(req, res) => {
    try {
        await People.findByIdAndUpdate(req.params.id, req.body, { new: true })
        index(req, res);
    } catch(error) {
        res.status(400).json(error)
    }
})


//Tell the app to listen
app.listen(PORT, () => console.log(`listening on PORT ${PORT}`));