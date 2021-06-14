const express = require('express')
const Route = express.Router()
const userController = require('./user_controller')
const authMiddleware = require('../../middleware/auth')
const uploadFile = require('../../middleware/upload')

Route.get('/', userController.getAllUser)
Route.get('/by-id/:id', userController.getUserById)
Route.patch(
  '/update-profile',
  authMiddleware.authentication,
  uploadFile,
  userController.updateProfile
)
Route.patch(
  '/delete-photo',
  authMiddleware.authentication,
  userController.userDeleteProfile
)
Route.patch(
  '/update-pin',
  authMiddleware.authentication,
  userController.updatePin
)
Route.patch(
  '/update-password',
  authMiddleware.authentication,
  userController.updatePassword
)

module.exports = Route
