# TINProject

## Backend
Node.js + Express.js REST API, SQLite database, JWT-style token auth + roles

## Frontend
React SPA (no bundler), custom hash (`/#/companies/1/edit`) router, i18n (EN/PL)

Located entirely in `/public`. React and ReactDOM UMD 18 builds are bundled with the app in `/public/react`

The `/public` folder is served as static content using `express.static`

## How to run
`npm install` - install dependencies

`npm run db:schema` - create database and schema

`npm run db:seed` - insert example data into the database

`npm start` - run the application

## How to access
By default, the application listens on port 3000.

To access on a local machine for testing, open `http://localhost:3000` in a browser.

## Database and port configuration
The app uses an SQLite database.

By default, the app uses a database file named `company-structure.db` in the root folder of the application as determined by `__dirname`.

To change the path to the database, include an env var named `DB_PATH`, which automatically changes the used database for DB scripts and the application itself:
```
# Windows PowerShell
$env:DB_PATH="C:\path\to\company-structure.db"
npm run db:schema
npm run db:seed
npm start
```
or
```
# macOS/Linux
export DB_PATH=/path/to/company-structure.db
npm run db:schema
npm run db:seed
npm start
```
An env var named `PORT` can be used to change the default listening port of 3000.
