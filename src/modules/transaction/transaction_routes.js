const express = require('express')
const Route = express.Router()
const transactionController = require('./transaction_controller')
const authMiddleware = require('../../middleware/auth')

Route.get('/', authMiddleware.authentication, transactionController.getHistory)
Route.post(
  '/',
  authMiddleware.authentication,
  transactionController.transferMoney
)

module.exports = Route
