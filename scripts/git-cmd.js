const nodeCmd = require('node-cmd')

const argv = process.argv.slice(2);
// 命令
let command = argv[0]
// 参数
let params = argv.slice(1) || [];
let currentBranch = ''

// 任务入口
getCurrentBranch().then(res=>{
  currentBranch = res;
  init();
});


// 初始分发任务
function init (){
  switch (command) {
    case 'push':
      pushHandler()
      break;
    case 'merge':
      mergeHandler()
      break;
    default:
      break;
  }
}
// 获取当前分支名称
function getCurrentBranch(){
  return new Promise((resolve,reject)=>{
    nodeCmd.get('git rev-parse --abbrev-ref HEAD',(err, data, stderr)=>{
      if(err){
        reject(err);
        return
      }
      resolve(data.trim())
    })
  })
}

// 切换分支
function checkoutBranch(name){
  return new Promise((resolve,reject)=>{
    nodeCmd.get('git checkout '+ name,(err, data, stderr)=>{
      if(err){
        reject(err);
        return
      }
      console.log('√ git checkout success')
      resolve()
    })
  })
}

// 合并分支
function mergeBranch(name){
  return new Promise((resolve,reject)=>{
    nodeCmd.get('git merge '+ name,(err, data, stderr)=>{
      if(err){
        reject(err);
        return
      }
      console.log('√ git merge success')
      resolve()
    })
  })
}

// 拉取
function pull(){
  return new Promise((resolve,reject)=>{
    nodeCmd.get('git pull origin '+ currentBranch,(err, data, stderr)=>{
      if(err){
        reject(err);
        return
      }
      console.log('√ git pull success')
      resolve()
    })
  })
}

// 推送
function push(){
  return new Promise((resolve,reject)=>{
    nodeCmd.get('git push origin '+ currentBranch,(err, data, stderr)=>{
      if(err){
        reject(err);
        return
      }
      console.log('√ git push success')
      resolve()
    })
  })
}

// 暂存
function add (){
  return new Promise((resolve,reject)=>{
    nodeCmd.get('git add .',(err, data, stderr)=>{
      if(err){
        reject(err);
        return
      }
      console.log('√ git add . success')
      resolve()
    })
  })
}

// 提交
function commit(){
  return new Promise((resolve,reject)=>{
    nodeCmd.get('git commit -m '+params[0],(err, data, stderr)=>{
      if(err){
        reject(err);
        return
      }
      console.log('√ git commit success')
      resolve()
    })
  })
}

// 把当前分支提交到远程
function pushHandler(){
  add().then(()=>{
    return commit();
  }).then(()=>{
    return pull();
  }).then(()=>{
    push();
  }).catch((error)=>{
    console.log(error)
  })
}