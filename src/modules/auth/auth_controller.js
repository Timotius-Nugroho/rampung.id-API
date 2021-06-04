const helper = require('../../helpers')
// const bcrypt = require('bcrypt')
// const authModel = require('./auth_model')
// const jwt = require('jsonwebtoken')

module.exports = {
  login: async (req, res) => {
    try {
      return helper.response(res, 200, 'Hallo')
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  }
}
