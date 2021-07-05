const helper = require('../../helpers')
const bcrypt = require('bcrypt')
const ejs = require('ejs')
const pdf = require('html-pdf')
const path = require('path')
const midtransClient = require('midtrans-client')
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

  getTransactionSummary: async (req, res) => {
    try {
      const userId = req.decodeToken.user_id
      const transactionPerDay =
        await transactionModel.getTotalTransactionPerDay(userId)
      const amountIn = await transactionModel.getTotalAmountIn(userId)
      const amountOut = await transactionModel.getTotalAmountOut(userId)

      const result = {
        transactionPerDay:
          transactionPerDay.length > 0 ? transactionPerDay : null,
        amountIn: amountIn.length > 0 ? amountIn[0].total_amount : 0,
        amountOut: amountOut.length > 0 ? amountOut[0].total_amount : 0
      }
      // console.log(result)
      return helper.response(
        res,
        200,
        'Succes get transaction Summary !',
        result
      )
    } catch (error) {
      console.log(error)
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
        // top up here
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
          transaction_status: 'succes'
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
          transaction_status: 'succes'
        })
        return helper.response(res, 200, 'Transaction succes !', result)
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },

  exportTransaction: async (req, res) => {
    try {
      const { id } = req.params
      const fileName = `${id}.pdf`
      const result = {
        ...req.body,
        date: Date(Date.now()).toString()
      }

      ejs.renderFile(
        path.join(__dirname, '../../templates', 'transaction-template.ejs'),
        { result: result },
        (err, data) => {
          if (err) {
            return helper.response(res, 400, 'Failed Export Transaction', err)
          } else {
            const options = {
              height: '11.25in',
              width: '8.5in',
              header: {
                height: '20mm'
              },
              footer: {
                height: '20mm'
              }
            }
            pdf
              .create(data, options)
              .toFile(
                path.join(__dirname, '../../../public/transfer/', fileName),
                function (err, data) {
                  if (err) {
                    return helper.response(
                      res,
                      400,
                      'Failed Export Transaction',
                      err
                    )
                  } else {
                    return helper.response(
                      res,
                      200,
                      'Success Export File Transaction',
                      {
                        url: `http://localhost:3004/backend4/api/${fileName}`
                      }
                    )
                  }
                }
              )
          }
        }
      )
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },

  postTopUp: async (req, res) => {
    try {
      console.log(req.body)

      let { transactionAmount } = req.body
      const userId = req.decodeToken.user_id
      transactionAmount = parseInt(transactionAmount) || 0

      const result = await transactionModel.addTransaction({
        transaction_method: 'Midtrans',
        transaction_receiver_id: userId,
        transaction_amount: transactionAmount,
        transaction_status: 'pending'
      })
      // console.log('RES', result)

      const topupData = {
        topupId: result.id,
        topupAmount: result.transaction_amount
      }
      const topup = await transactionModel.createTopup(topupData)
      return helper.response(res, 200, 'Success TopUp Please Confirm ...', {
        redirectUrl: topup
      })
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },

  postMidtransNotif: async (req, res) => {
    try {
      // console.log(req.body)

      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: 'SB-Mid-server-vjEJqGa3Jq0x9DtGLX-WcsTA',
        clientKey: 'SB-Mid-client-fRU8uSNEVuGcFfR8'
      })
      snap.transaction
        .notification(req.body)
        .then((statusResponse) => {
          const orderId = statusResponse.order_id
          const transactionStatus = statusResponse.transaction_status
          const fraudStatus = statusResponse.fraud_status
          // console.log(grossAmount)

          const updateStatus = async () => {
            await transactionModel.updateTransaction(
              {
                transaction_status: transactionStatus
              },
              orderId
            )
            return helper.response(res, 200, `Top Up ${transactionStatus} !`)
          }

          const asyncCall = async () => {
            await transactionModel.updateTransaction(
              {
                transaction_status: transactionStatus
              },
              orderId
            )
            const orderInfo = await transactionModel.getTransactionById(orderId)

            let userBalance = await transactionModel.getBalance(
              orderInfo[0].transaction_receiver_id
            )
            userBalance += orderInfo[0].transaction_amount
            await transactionModel.updateBalance(
              { balance: userBalance },
              orderInfo[0].transaction_receiver_id
            )
            return helper.response(res, 200, 'Top up Approved !', userBalance)
          }

          console.log(
            `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
          )

          // Sample transactionStatus handling logic

          if (transactionStatus === 'capture') {
            updateStatus()
            if (fraudStatus === 'challenge') {
              // TODO set transaction status on your databaase to 'challenge'
              updateStatus()
            } else if (fraudStatus === 'accept') {
              asyncCall()
            }
          } else if (transactionStatus === 'settlement') {
            // TODO set transaction status on your databaase to 'success'
            asyncCall()
          } else if (transactionStatus === 'deny') {
            // TODO you can ignore 'deny', because most of the time it allows payment retries
            // and later can become success
            updateStatus()
          } else if (
            transactionStatus === 'cancel' ||
            transactionStatus === 'expire'
          ) {
            // TODO set transaction status on your databaase to 'failure'
            updateStatus()
          } else if (transactionStatus === 'pending') {
            // TODO set transaction status on your databaase to 'pending' / waiting payment
            updateStatus()
          }
        })
        .catch((err) => {
          console.log('Midtrans error', err)
          return helper.response(
            res,
            parseInt(err.ApiResponse.status_code),
            err.ApiResponse.status_message,
            null
          )
        })
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  }
}
