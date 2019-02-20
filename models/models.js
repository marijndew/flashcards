const Sequelize = require('sequelize')

const connection = new Sequelize('flashcards', process.env.POSTGRES_USER, process.env.POSTRES_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres',
    operatorsAliases: 'false'
})

//Defining the lists model
const List = connection.define('list', {
    title: Sequelize.STRING,
    content: Sequelize.JSON,
})

connection.sync(
        /*{
                force: true
            }*/
    )
    .then(() => console.log(`Lists table has been created!`))
    .catch((error) => console.log(`Couldn't create table due to this error: ${error}`));

module.exports = {
    List: List
};
