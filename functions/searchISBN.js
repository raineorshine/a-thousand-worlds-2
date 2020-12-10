const functions = require('firebase-functions')
const express = require('express')
const bookcovers = require('bookcovers')
const isbn = require('node-isbn')
const axios = require('axios').default
const sharp = require('sharp')

async function getGoodReadsBookIDByISBN(isbn) {
  let res = null
  try {
    res = await axios({
      url: `https://www.goodreads.com/book/isbn_to_id/`,
      method: 'get',
      params: {
        key: functions.config().goodreads.api_key,
        isbn: isbn
      },
      responseType: 'text',
    })
  }
  catch (e) {
    console.log('axios error', e)
    res = null
  }
  if (!res || !res.data) {
    return null
  }
  return res.data
}

async function loadImage2Base64(url) {
  let res = null
  try {
    res = await axios.get(url, {
      responseType: 'arraybuffer'
    })
  }
  catch (e) {
    console.log(e, 'loadImage2Base64 error')
    res = null
  }
  if (!res || !res.data) {
    return null
  }
  const img = await sharp(res.data).toFormat('png')
  const meta = await img.metadata()
  const buff = await img.toBuffer()
  return {
    base64: buff.toString('base64'),
    width: meta.width,
    height: meta.height
  }
}

function _isbn(code, provider) {
  return new Promise((resolve, reject) => {
    isbn
      .provider([provider])
      .resolve(code, (err, book) => {
        if (book && !err) {
          resolve(book)
          return
        }
        resolve(null)
      })
  })
}

async function isbnSearch(code) {
  const gBook = await _isbn(code, 'google')
  const oBook = await _isbn(code, 'openlibrary')
  if (!gBook && !oBook) {
    return null
  }
  const book = {
    isbn: code,
    google: gBook,
    openlib: oBook,
    covers: [],
    cover: null,
    coverWidth: 0,
    coverHeight: 0
  }
  const covers = await bookcovers.withIsbn(code)
  const amazonSizes = Object.keys(covers.amazon)
  const largestAmazonCover = Math.max.apply(null, amazonSizes.map(s => parseFloat(s, 10)))
  const url = covers.amazon[largestAmazonCover + 'x'] ||
    covers.amazon['2x'] ||
    covers.openLibrary.large ||
    covers.amazon['1.5x'] ||
    covers.openLibrary.medium ||
    covers.amazon['1x'] ||
    covers.openLibrary.small
  console.log(`Fetching book cover: ${url}`)
  const img = await loadImage2Base64(url)
  book.cover = img.base64
  book.coverWidth = img.width
  book.coverHeight = img.height
  return book
}

module.exports = () => {

  const app = express()

  app.get('/', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*')
    if (!req.query || !req.query.isbn) {
      res.send(JSON.stringify(null))
      return
    }
    console.log(`searchng [${req.query.isbn}]`)
    const book = await isbnSearch(req.query.isbn)
    if (book) {
      book.grid = await getGoodReadsBookIDByISBN(req.query.isbn)
    }
    // console.log(book, 'BOOK!')
    if (!book) {
      console.log(`[${req.query.isbn}] not found`)
    }
    else {
      const ttl = book.google ? book.google.title : book.openlib.title
      console.log(`[${req.query.isbn}] found - ${ttl}`)
    }
    res.json(book)
  })

  return app
}