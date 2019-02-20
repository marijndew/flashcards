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
app.set('views', path.join(__dirname, 'views'));

// do i need this? helps parse incoming parameters to req.body
app.use(express.urlencoded({
    extended: true
}));

// placeholder for cookies and sessions

app.route('/sign-up')
//.get => 'sign-up.ejs' & .post => 'index.ejs'

app.route('/log-in')
//.get => 'index.ejs' & .post => 'dashboard.ejs'

app.route('/dashboard')
//.get => 'dashboard.ejs'

app.route('/create-list')
    //.get => 'create-list.ejs' & .post => 'list-select.ejs' & .put
    .get((req, res) => {
        res.render('create-list')
    })
    .post((req, res) => {
        let inputValues = Object.values(req.body)
        inputValues.shift() //.shift() removes first value from req.body.title (the title of the study set)
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
                "sideA": i,
                "sideB": unevenArray[evenArray.indexOf(i)]
            }
            studySet.push(object);
        })

        List.create({
                title: req.body.title,
                content: studySet
            })
            .then(() => {
                res.redirect('/select-list')
            })
            .catch((error) => {
                console.log(`Something went wrong when saving your study set: ${error}`);
                res.redirect('/create-list')
            })
    });

app.route('/select-list')
    .get((req, res) => {
        let allLists = []
        List.findAll().then((retrievedList) => {
            let allLists = retrievedList.map((relevantData) => {
                return {
                    title: relevantData.dataValues.title,
                    id: relevantData.dataValues.id
                }
            });
            res.render('select-list', {
                allLists: allLists
            });
        });
    })

app.route('/study-session')
    .get((req, res) => {
        // defining shuffling function for later
        function shuffle(a) {
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }
        List.findOne({
            where: {
                id: req.query.id
            }
        }).then((retrievedList) => {
            let studySet = shuffle(retrievedList.dataValues.content)
            let card = ''
            studySet.forEach((i) => {
                // include if statement to exclude studied cards
                card = i
            })
            res.render('study-session.ejs', {
                card: card,
                setTitle: retrievedList.dataValues.title,
                setId: retrievedList.dataValues.id
            })
        })
    })
    .post((req, res) => {
        let studySet = []
        let sideB = ""
        List.findOne({
            where: {
                id: req.body.setId
            }
        }).then((retrievedList) => {
            studySet = retrievedList.dataValues.content
            studySet.forEach((i) => {
                if (i.id == req.body.cardId) { // why does this only work with == and not ===
                    sideB = i.sideB
                }
            })
            if (req.body.submitAnswer === sideB) {
                console.log('good job!')
                // update card's status in database  
            } else {
                console.log('wrong answer!')
                // update card's status in database  
            }
            res.redirect(`/study-session/?id=${req.body.setId}`) // i feel this stuff can be done dynamically
        })
    })


/*      console.log(`this is with JSON.stringify`, JSON.stringify(req.body.currentCard) console.log(`this is with JSON.parse`, JSON.parse(req.body.currentCard[0]))

    if list(req.body.submitAnswer === req.body.currentCard.pin) {
        req.body.currentCard.pin
        console.log('got itttttt')
    }*/



/*
retrievedPost.map((relevantData) => {
                    return {
                        title: relevantData.dataValues.title,
                        content: relevantData.dataValues.content,
                        author: relevantData.dataValues.author,
                        time: relevantData.dataValues.createdAt,
                        id: relevantData.dataValues.id
*/



app.listen(port, () => (`Listening to port ${port}`));
