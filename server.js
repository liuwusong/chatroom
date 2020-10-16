const http = require('http');
const fs = require('fs');
const path = require('path');
const { getType } = require('mime');
const websocket = require('ws')
const {Server:wsServer} = websocket;

const cache = {}
const port = 8000
const hostname = 'localhost'

const messageQueue = []

// 开启websocket 服务器
const wss  =  new wsServer({
  port: 8001,
})
wss.on('connection',function(ws){
  ws.on('message', function(message) {
    messageQueue.push(message);
    wss.clients.forEach(function(client) {
      if (client.readyState === websocket.OPEN) {
        client.send(messageQueue.join('--|--'));
      }
    });
  });
  if(messageQueue.length){
    // 发送聊天记录
    ws.send(messageQueue.join('--|--'));
  }
  ws.onclose = function (){
    wss.clients.forEach(function(client) {
      if (client.readyState === websocket.OPEN) {
        client.send('你的聊天对象已经下线。');
      }
    });
  }
})
const server = http.createServer((req, res) => {
  let filePath = './public/index.html';
  if(req.method === 'POST' && req.url == '/update_file'){
    console.log(res.body)
  }else if (req.url !== '/') {
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
    fs.exists(path.resolve(__dirname, absPath), (bool) => {
      if (bool) {
        resolve()
      } else {
        reject('路由不存在')
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
  readFile('./public/404.html').then(content=>{
    sendFile(res,'./public/404.html',content)
  })
}

function sendFile(res, filePath, fileContent) {
  res.writeHead(200, {
    "Content-type": getType(path.basename(filePath))
  })
  res.end(fileContent)
}