const connection = require('../../config/mysql')

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

  getTotalTransactionPerDay: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT DAYNAME(transaction_created_at) AS day_name, SUM(transaction_amount) AS total_amount FROM transaction WHERE (transaction_sender_id = ? OR transaction_receiver_id = ?) GROUP BY DAYNAME(transaction_created_at)',
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
  }
}
