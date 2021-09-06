const helper = require('../../helpers')
const bcrypt = require('bcrypt')
const authModel = require('./auth_model')
const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = {
  register: async (req, res) => {
    try {
      const { userEmail, userPassword, userName, userPhone } = req.body
      const salt = bcrypt.genSaltSync(10)
      const encryptPassword = bcrypt.hashSync(userPassword, salt)

      const setData = {
        user_name: userName,
        user_email: userEmail,
        user_password: encryptPassword,
        user_phone: userPhone,
        user_verification: 0
      }

      const checkEmailUser = await authModel.getDataCondition({
        user_email: userEmail
      })

      if (checkEmailUser.length === 0) {
        const result = await authModel.register(setData)
        delete result.user_password
        await authModel.addBalance({ user_id: result.id, balance: 0 })

        const url = `https://dompetmu-api.herokuapp.com/backend4/api/v1/auth/change-data/${result.id}`
        helper.sendMail('Please activate your account', url, userEmail)

        return helper.response(
          res,
          200,
          'Succes register User Please Check your Email to Activate your Account !',
          result
        )
      } else {
        return helper.response(res, 400, 'Email has been registered')
      }
    } catch (error) {
      console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  },

  login: async (req, res) => {
    try {
      const { userEmail, userPassword } = req.body
      // console.log('BODY', req.body)
      const checkEmailUser = await authModel.getDataCondition({
        user_email: userEmail
      })

      if (checkEmailUser.length > 0) {
        if (checkEmailUser[0].user_verification === 0) {
          return helper.response(res, 403, 'Account is not verified')
        }

        const checkPassword = bcrypt.compareSync(
          userPassword,
          checkEmailUser[0].user_password
        )

        if (checkPassword) {
          const payload = {
            user_id: checkEmailUser[0].user_id,
            user_email: checkEmailUser[0].user_email,
            user_pin: checkEmailUser[0].user_pin.length
          }
          delete payload.user_password
          const token = jwt.sign({ ...payload }, process.env.PRIVATE_KEY, {
            expiresIn: '24h'
          })

          const result = { ...payload, token }
          return helper.response(res, 200, 'Succes Login !', result)
        } else {
          return helper.response(res, 400, 'Worng password')
        }
      } else {
        return helper.response(res, 404, 'Email not Registerd')
      }
    } catch (error) {
      console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  },

  changeData: async (req, res) => {
    try {
      let token = req.params.token
      let userId = ''
      let setData = {}
      // console.log(token)
      if (/^\d+$/.test(token)) {
        userId = token
        setData = { user_verification: '1' }
      } else {
        jwt.verify(token, process.env.PRIVATE_KEY, (error, result) => {
          if (
            (error && error.name === 'JsonWebTokenError') ||
            (error && error.name === 'TokenExpiredError')
          ) {
            return helper.response(res, 403, error.message)
          } else {
            // console.log('DECODE token', result)
            token = result
          }
        })
        userId = token.userId
        setData = token.setData
      }

      if (userId && setData) {
        // console.log('Update', setData)
        const result = await authModel.updateData(setData, userId)
        return helper.response(
          res,
          200,
          'succes update data',
          Object.keys(result)
        )
      } else {
        return helper.response(res, 400, 'Bad Request', null)
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },

  requestChangePassword: async (req, res) => {
    try {
      if (req.body.userPassword) {
        const salt = bcrypt.genSaltSync(10)
        const encryptPassword = bcrypt.hashSync(req.body.userPassword, salt)
        req.body.userPassword = encryptPassword

        const user = await authModel.getDataCondition({
          user_email: req.body.userEmail
        })

        const payload = {
          userId: user[0].user_id,
          setData: { user_password: encryptPassword }
        }

        // console.log(payload)
        const token = jwt.sign({ ...payload }, process.env.PRIVATE_KEY, {
          expiresIn: '1h'
        })

        const url = `https://dompetmu-api.herokuapp.com/backend4/api/v1/auth/change-data/${token}`

        // send email for verificatioan here
        helper.sendMail('Confirm your change password', url, req.body.userEmail)

        return helper.response(
          res,
          200,
          'Email verification has been sent, please check your email !',
          null
        )
      } else {
        const checkEmailUser = await authModel.getDataCondition({
          user_email: req.body.userEmail
        })
        if (checkEmailUser.length > 0) {
          return helper.response(res, 200, 'Email found !', null)
        } else {
          return helper.response(res, 404, 'Email not found !', null)
        }
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  }
}
