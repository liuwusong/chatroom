const http = require('http');
const fs = require('fs');
const path = require('path');
const { getType } = require('mime');

const cache = {}
const port = 8000
const hostname = 'localhost'

const server = http.createServer((req, res) => {
  let filePath = './public/index.html';

  if (req.url !== '/') {
    filePath = './public' + req.url
  }
  serveStatic(res, cache, filePath)
}).listen(port, () => {
  console.log('服务启动于：http://' + hostname + ':' + port)
})



/**
 * 初始化程序
 * @param {*} res 
 * @param {*} cache 
 * @param {*} absPath 
 */
function serveStatic(res, cache, absPath) {
  if (cache[absPath]) {
    sendFile(res, absPath, cache[absPath])
  } else {
    hasFile(absPath).then(() => {
      return readFile(absPath)
    }).then(content => {
      cache[absPath] = content;
      sendFile(res, absPath, content)
    }).catch((error) => {
      console.log(error);
      send404(res)
    })
  }
}

/**
 * 判断有没有文件
 * @param {*} absPath 
 */
function hasFile(absPath) {
  return new Promise((resolve, reject) => {
    fs.exists(path.resolve(__dirname, absPath), (exists) => {
      if (exists) {
        resolve()
      } else {
        reject()
      }
    })
  })
}

/**
 * 读取文件
 * @param {*} absPath 
 */
function readFile(absPath) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, absPath), (err, content) => {
      if (err) {
        reject(err)
        return
      }
      resolve(content)
    })
  })
}
/**
 * 404
 * @param {*} res 
 */
function send404(res) {
  res.writeHead(404, {
    "Content-type": "text/plain;charset=UTF-8"
  })
  res.write('文件不存在')
  res.end()
}

function sendFile(res, filePath, fileContent) {
  res.writeHead(200, {
    "Content-type": getType(path.basename(filePath))
  })
  res.end(fileContent)
}