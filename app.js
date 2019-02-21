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
                "sideB": unevenArray[evenArray.indexOf(i)],
                "status": false            }
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
            console.log('debugging this thing', retrievedList.dataValues.content) // the updated value hasn't come through at this point!!! the rendering is happening only after finding the list! that's the problem. 
            let studySet = shuffle(retrievedList.dataValues.content)
            let studySetFalse = []
            studySet.forEach((i) => {
                if (i.status === false) {
                    studySetFalse.push(i)
                }
            })
            // make the code when set is finished server-side?
            res.render('study-session.ejs', {
                studySetFalse: studySetFalse,
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
                    if (req.body.submitAnswer === sideB) {
                        console.log('good job!')
                        i.status = true
                        retrievedList.update({
                            content: studySet
                        })
                    } else {
                        console.log('wrong answer!')
                    }
                }
            })
            console.log('gebeurt dit voor of na --good job!--?') // dit gebeurt na good job, maar vóór retrievedList.update!!
            res.redirect(`/study-session/?id=${req.body.setId}`)
        })
    })


app.listen(port, () => (`Listening to port ${port}`));
