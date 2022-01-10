const connection = require('../../config/mysql')

module.exports = {
  register: (data) => {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO users SET ?', data, (error, result) => {
        if (!error) {
          const newResult = {
            id: result.insertId,
            ...data
          }
          resolve(newResult)
        } else {
          reject(new Error(error))
        }
      })
    })
  },

  updateData: (setData, id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE users SET ? WHERE user_id = ?',
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

  getDataCondition: (data) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM users WHERE ?', data, (error, result) => {
        !error ? resolve(result) : reject(new Error(error))
      })
    })
  }
}
