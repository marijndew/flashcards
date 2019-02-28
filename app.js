const express = require('express'),
    app = express(),
    path = require('path'),
    port = process.env.PORT || 3000,
    cookieParser = require('cookie-parser'),
    cookieSession = require('express-session'),
    bcrypt = require('bcrypt'),
    models = require('./models/models.js'),
    List = models.List;

// add validation

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));
app.use('/public', express.static(__dirname + '/public'));


// do i need this? helps parse incoming parameters to req.body
app.use(express.urlencoded({
    extended: true
}));

// placeholder for cookies and sessions

app.get('/', (req, res) => {
    res.render('index')
});

app.route('/sign-up')
//.get => 'sign-up.ejs' & .post => 'index.ejs'

app.route('/log-in')
//.get => 'index.ejs' & .post => 'dashboard.ejs'

app.route('/dashboard')
//.get => 'dashboard.ejs'

app.route('/create-set')
    //.get => 'create-list.ejs' & .post => 'list-select.ejs' & .put
    .get((req, res) => {
        res.render('create-set')
    })
    .post((req, res) => {
        let inputValues = Object.values(req.body)
        inputValues.splice(0, 2) //.splice(0, 2) removes first two values (title & description) from req.body.title
        let evenArray = []
        let unevenArray = []
        let studySet = []

        inputValues.forEach((i) => {
            if (inputValues.indexOf(i) % 2) {
                unevenArray.push(i)
            } else {
                evenArray.push(i)
            }
        })

        evenArray.forEach((i) => {
            let object = {
                "id": evenArray.indexOf(i) + 1,
                "sideA": i.trim(),
                "sideB": unevenArray[evenArray.indexOf(i)].trim(),

            }
            studySet.push(object);
        })
        List.create({
                title: req.body.title,
                description: req.body.description,
                content: studySet
            })
            .then(() => {
                res.redirect('/select-set')
            })
            .catch((error) => {
                console.log(`Something went wrong when saving your study set: ${error}`);
                res.redirect('/create-set')
            })
    })

app.route('/select-set')
    .get((req, res) => {
        let allLists = []
        List.findAll().then((retrievedList) => {
            let allLists = retrievedList.map((relevantData) => {
                return {
                    title: relevantData.dataValues.title,
                    id: relevantData.dataValues.id,
                    description: relevantData.dataValues.description
                }
            });
            res.render('select-set', {
                allLists: allLists
            });
        });
    })

app.route('/study-session')
    .get((req, res) => {
        List.findOne({
            where: {
                id: req.query.id
            }
        }).then((retrievedList) => {
            let studySet = retrievedList.dataValues.content
            res.render('study-session.ejs', {
                studySet: studySet,
                setTitle: retrievedList.dataValues.title,
                setId: retrievedList.dataValues.id
            })
        })
    })



app.listen(port, () => (`Listening to port ${port}`));
