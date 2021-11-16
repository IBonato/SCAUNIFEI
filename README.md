# SCAUNIFEI

File sharing system made in Node.js with MongoDB, supporting user register, edit and delete, file upload (by selected users) and download and search by multiple standards. You can see the deployed version on Heroku here: [SCAUNIFEI](https://scaunifei.herokuapp.com).

## Installation

* Install [Node.js](https://nodejs.org/en/download/), the normal version already comes with NPM
* Install [MongoDB](https://www.mongodb.com/download-center/community)

* Install all dependencies from the package.json file in the current folder, in the Terminal type the following command (you need a package manager):

```bash
npm install
```

* Create a folder in your local drive called ```data``` and another one inside it called ```db```:
```bash
C:\data\db
```

* Add Mongo’s bin folder to the [Path Environment Variable](https://dangphongvanthanh.wordpress.com/2017/06/12/add-mongos-bin-folder-to-the-path-environment-variable/) (for Windows).

## Usage

* Create the file ```db.js``` in the folder ```config``` with the following code:

```node
if (process.env.NODE_ENV == "production") {
    //URL to your Cloud database
    module.exports = { mongoURI: "mongodb+srv://user:password@cluster_name.mongodb.net/database_name?retryWrites=true&w=majority" }
}
else {
    //Local URL to access via Browser (27017 is Mongo default connection PORT)
    module.exports = { mongoURI: "mongodb://user:password@localhost:27017/database_name" }
}
```

* Start MongoDB, in the Terminal type the following command:

```bash
mongod
```

* Create a new database and admin:

```bash
mongo

use nameofthedatabase
db.createUser(
  {
    user: "myDatabaseAdmin",
    pwd: "abc123",
    roles: [ { role: "dbOwner", db: "nameofthedatabase" } ]
  }
)
```

* Create the files ```drive_key.json``` and ```gmail_key.json``` in the folder ```config/google``` containing the data for authentication with Google APIs.

* Start the application in another terminal window (```nodemon``` will automatically restart your application every time you make a change in any ```.js``` file and save it, if you don't have the package, you can install it globally on your computer with ```npm install -g nodemon```):

```bash
nodemon app.js
```

* Open ```localhost:8081``` in your Browser and have fun!

## License
[MIT](https://choosealicense.com/licenses/mit/)
