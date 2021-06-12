const express = require('express')
const Route = express.Router()
const {
  register,
  login,
  changeData,
  requestChangePassword
} = require('./auth_controller')

Route.get('/change-data/:token', changeData)
Route.post('/request-change-password', requestChangePassword)

Route.post('/register', register)
Route.post('/login', login)

module.exports = Route
