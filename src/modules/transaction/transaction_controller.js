const helper = require('../../helpers')
const bcrypt = require('bcrypt')
const transactionModel = require('./transaction_model')

module.exports = {
  getUserBalance: async (req, res) => {
    try {
      const userId = req.decodeToken.user_id
      const result = await transactionModel.getBalance(userId)
      return helper.response(res, 200, 'succes get user balance', result)
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },

  getHistory: async (req, res) => {
    try {
      const userId = req.decodeToken.user_id
      let { sort, limit } = req.query
      limit = limit || 10
      let condition = ''
      // console.log(userId, sort, limit)

      if (sort) {
        if (sort === 'week') {
          condition =
            ' AND YEARWEEK(`transaction_created_at`, 1) = YEARWEEK(CURDATE(), 1)'
        } else {
          condition = ' AND MONTH(`transaction_created_at`) = MONTH(CURDATE())'
        }
      }

      const result = await transactionModel.getTransaction(
        userId,
        condition,
        parseInt(limit)
      )
      for (const e of result) {
        if (!e.transaction_method) {
          e.receiverDetail = await transactionModel.getUserDetail(
            e.transaction_receiver_id
          )
          e.senderDetail = await transactionModel.getUserDetail(
            e.transaction_sender_id
          )
        }
      }
      return helper.response(res, 200, 'Succes get transaction data !', result)
    } catch (error) {
      // console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  },

  transferMoney: async (req, res) => {
    try {
      // console.log(req.body)
      let { transactionMethod, transactionAmount, senderPin, receiverId } =
        req.body
      const senderId = req.decodeToken.user_id
      transactionAmount = parseInt(transactionAmount) || 0

      if (transactionMethod) {
        let userBalance = await transactionModel.getBalance(
          req.decodeToken.user_id
        )
        userBalance += transactionAmount
        await transactionModel.updateBalance(
          { balance: userBalance },
          req.decodeToken.user_id
        )

        const result = await transactionModel.addTransaction({
          transaction_method: transactionMethod,
          transaction_receiver_id: req.decodeToken.user_id,
          transaction_amount: transactionAmount,
          transaction_status: 1
        })
        return helper.response(res, 200, 'Top up succes !', result)
      } else {
        const senderPinDb = await transactionModel.getUserPin(senderId)
        const checkPin = bcrypt.compareSync(senderPin, senderPinDb)
        if (!checkPin) {
          return helper.response(res, 400, 'Pin doesn`t match!')
        }

        let senderBalance = await transactionModel.getBalance(senderId)
        senderBalance -= transactionAmount
        if (senderBalance < 0) {
          return helper.response(
            res,
            400,
            'The remaining money is not enough !'
          )
        }
        let receiverBalance = await transactionModel.getBalance(receiverId)
        if (receiverBalance < 0) {
          return helper.response(res, 404, 'Receiver not found !')
        }
        receiverBalance += transactionAmount
        console.log(senderBalance, receiverBalance)

        await transactionModel.updateBalance(
          { balance: receiverBalance },
          receiverId
        )
        await transactionModel.updateBalance(
          { balance: senderBalance },
          senderId
        )

        const result = await transactionModel.addTransaction({
          transaction_sender_id: senderId,
          transaction_receiver_id: receiverId,
          transaction_amount: transactionAmount,
          transaction_status: 1
        })
        return helper.response(res, 200, 'Transaction succes !', result)
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  }
}
