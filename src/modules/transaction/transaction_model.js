const connection = require('../../config/mysql')
const midtransClient = require('midtrans-client')

module.exports = {
  getUserPin: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT user_pin FROM user WHERE user_id = ?',
        id,
        (error, result) => {
          !error
            ? resolve(result[0] ? result[0].user_pin : null)
            : reject(new Error(error))
        }
      )
    })
  },

  getBalance: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT balance FROM balance WHERE user_id = ?',
        id,
        (error, result) => {
          !error
            ? resolve(result[0] ? result[0].balance : -1)
            : reject(new Error(error))
        }
      )
    })
  },

  updateBalance: (setData, id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE balance SET ? WHERE user_id = ?',
        [setData, id],
        (error, result) => {
          if (!error) {
            const newResult = {
              id: id,
              ...setData
            }
            resolve(newResult)
          } else {
            reject(new Error(error))
          }
        }
      )
    })
  },

  getTransaction: (id, condition, limit) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM transaction WHERE (transaction_sender_id = ? OR transaction_receiver_id = ?)${condition} ORDER BY transaction_id DESC LIMIT ?`,
        [id, id, limit],
        (error, result) => {
          if (!error) {
            resolve(result)
          } else {
            reject(new Error(error))
          }
        }
      )
    })
  },

  updateTransaction: (setData, id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE transaction SET ? WHERE transaction_id = ?',
        [setData, id],
        (error, result) => {
          if (!error) {
            const newResult = {
              id: id,
              ...setData
            }
            resolve(newResult)
          } else {
            reject(new Error(error))
          }
        }
      )
    })
  },

  getTransactionById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT transaction_receiver_id, transaction_amount FROM transaction WHERE transaction_id = ?',
        id,
        (error, result) => {
          if (!error) {
            resolve(result)
          } else {
            reject(new Error(error))
          }
        }
      )
    })
  },

  getTotalTransactionPerDay: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT DAYNAME(transaction_created_at) AS day_name, SUM(transaction_amount) AS total_amount FROM transaction WHERE (transaction_sender_id = ? OR transaction_receiver_id = ?) AND (transaction_status = "settlement" OR transaction_status = "succes") AND WEEK(transaction_created_at) = WEEK(NOW()) GROUP BY DAYNAME(transaction_created_at)',
        [id, id],
        (error, result) => {
          if (!error) {
            resolve(result)
          } else {
            reject(new Error(error))
          }
        }
      )
    })
  },

  getTotalAmountIn: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT transaction_receiver_id AS receiver_id, SUM(transaction_amount) AS total_amount FROM transaction WHERE transaction_receiver_id = ? GROUP BY transaction_receiver_id',
        id,
        (error, result) => {
          if (!error) {
            resolve(result)
          } else {
            reject(new Error(error))
          }
        }
      )
    })
  },

  getTotalAmountOut: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT transaction_sender_id AS sender_id, SUM(transaction_amount) AS total_amount FROM transaction WHERE transaction_sender_id = ? GROUP BY transaction_sender_id',
        id,
        (error, result) => {
          if (!error) {
            resolve(result)
          } else {
            reject(new Error(error))
          }
        }
      )
    })
  },

  getUserDetail: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT user_email, user_phone, user_name, user_image FROM user WHERE user_id = ?',
        id,
        (error, result) => {
          !error
            ? resolve(result[0] ? result[0] : null)
            : reject(new Error(error))
        }
      )
    })
  },

  addTransaction: (setData) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO transaction SET ?',
        [setData],
        (error, result) => {
          if (!error) {
            const newResult = {
              id: result.insertId,
              ...setData
            }
            resolve(newResult)
          } else {
            reject(new Error(error))
          }
        }
      )
    })
  },

  createTopup: ({ topupId, topupAmount }) => {
    return new Promise((resolve, reject) => {
      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: 'SB-Mid-server-vjEJqGa3Jq0x9DtGLX-WcsTA',
        clientKey: 'SB-Mid-client-fRU8uSNEVuGcFfR8'
      })
      const parameter = {
        transaction_details: {
          order_id: topupId,
          gross_amount: topupAmount
        },
        credit_card: {
          secure: true
        }
      }
      snap
        .createTransaction(parameter)
        .then((transaction) => {
          // transaction token
          // const transactionToken = transaction.token
          // console.log('transaction:', transaction)
          // console.log('transactionToken:', transactionToken)
          resolve(transaction.redirect_url)
        })
        .catch((error) => {
          console.log(error)
          reject(error)
        })
    })
  }
}
