const connection = require('../../config/mysql')

module.exports = {
  getDataAll: (limit, offset, keywords, sort) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM users WHERE user_name LIKE ? ORDER BY ${sort} LIMIT ? OFFSET ?`,
        [keywords, limit, offset],
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },

  getDataCount: (keywords) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT COUNT(*) AS total FROM users WHERE user_name LIKE ?',
        keywords,
        (error, result) => {
          // console.log(result) isi array dalamnya objek
          !error ? resolve(result[0].total) : reject(new Error(error))
        }
      )
    })
  },

  getDataById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM users WHERE user_id = ?',
        id,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
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
  }
}
