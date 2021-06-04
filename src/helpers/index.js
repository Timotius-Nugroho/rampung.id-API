const fs = require('fs')
const nodemailer = require('nodemailer')
require('dotenv').config()

module.exports = {
  response: (response, status, msg, data, pagination) => {
    const result = {}
    result.status = status || 200
    result.msg = msg
    result.data = data
    result.pagination = pagination
    return response.status(result.status).json(result)
  },

  deleteImage: (imgLoc) => {
    fs.unlink(imgLoc, (error) => {
      error ? console.log('Image not found') : console.log('Image deleted')
    })
  },

  convertToSnakeCase: (str) => {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  },

  sendMail: (msg, url, userEmailAddress) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    })

    const mailOptions = {
      from: `"dompetMu >> " <${process.env.SMTP_EMAIL}>`,
      to: userEmailAddress,
      subject: `dompetMu - ${msg}`,
      html: `<b>Click Here to activate</b><a href=${url}>Click !</>`
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error)
      } else {
        console.log('Email sent: ' + info.response)
      }
    })
  }
}
