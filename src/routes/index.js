const express = require('express')
const Route = express.Router()
const authRouter = require('../modules/auth/auth_routes')
const userRouter = require('../modules/user/user_routes')
const transactionRouter = require('../modules/transaction/transaction_routes')

Route.use('/auth', authRouter)
Route.use('/user', userRouter)
Route.use('/transaction', transactionRouter)

module.exports = Route
