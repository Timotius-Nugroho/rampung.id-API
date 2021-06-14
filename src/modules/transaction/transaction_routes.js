const express = require('express')
const Route = express.Router()
const transactionController = require('./transaction_controller')
const authMiddleware = require('../../middleware/auth')

Route.get('/', authMiddleware.authentication, transactionController.getHistory)
Route.get(
  '/balance',
  authMiddleware.authentication,
  transactionController.getUserBalance
)
Route.get(
  '/summary',
  authMiddleware.authentication,
  transactionController.getTransactionSummary
)
Route.post('/export/:id', transactionController.exportTransaction)
Route.post(
  '/',
  authMiddleware.authentication,
  transactionController.transferMoney
)

module.exports = Route
