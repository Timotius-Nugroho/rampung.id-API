const express = require('express')
const Route = express.Router()
const { login } = require('./auth_controller')

Route.post('/login', login)

module.exports = Route
