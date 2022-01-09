const express = require('express')

const WelcomeRouter = express.Router()

WelcomeRouter.get('/', (req, res) => {
  res.send('WELCOME TO RAMPUNG.ID API')
})

module.exports = WelcomeRouter
