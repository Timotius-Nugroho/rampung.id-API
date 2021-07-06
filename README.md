<h1 align="center">ExpressJS - Back End - Dompet Mu RESTfull API</h1>

Dompet Mu RESTfull API is a RESTfull API that will provide the data needed by the Front End of the Dompet Mu application. The API is designed in a minimalist and flexible way with the use of Express.Js. [More about Express](https://en.wikipedia.org/wiki/Express.js)

## Built With

[![Express.js](https://img.shields.io/badge/Express.js-4.x-orange.svg?style=rounded-square)](https://expressjs.com/en/starter/installing.html)
[![Node.js](https://img.shields.io/badge/Node.js-v.12.13-green.svg?style=rounded-square)](https://nodejs.org/)

## Requirements

1. <a href="https://nodejs.org/en/download/">Node Js</a>
2. Node_modules
3. <a href="https://www.getpostman.com/">Postman</a>
4. Web Server (ex. localhost)

## How to run the app ?

1. Open app's directory in CMD or Terminal
2. Type `npm install`
3. Make new file a called **.env**, set up first [here](#set-up-env-file)
4. Turn on Web Server and MySQL can using Third-party tool like xampp, etc.
5. Create a database with the name #database_name, and Import file sql to **phpmyadmin**
6. Open Postman desktop application or Chrome web app extension that has installed before
7. Choose HTTP Method and enter request url.(ex. localhost:3004/)
8. You can see all the end point [here](https://documenter.getpostman.com/view/14948086/Tzm3nHTd)

## Set up .env file

Open .env file on your favorite code editor, and copy paste this code below :

```
PORT=3003
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=[your database_name]
SMTP_EMAIL= [your email (Gmail)]
SMTP_PASSWORD= [your email password]
PRIVATE_KEY= [your private key to verify JWT]
```

## License

© [Timotius Nugroho](https://github.com/Timotius-Nugroho)
