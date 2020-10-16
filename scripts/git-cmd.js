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
function checkout(name){
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
function merge(name){
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
function pull(name){
  return new Promise((resolve,reject)=>{
    nodeCmd.get('git pull origin '+ name,(err, data, stderr)=>{
      if(err){
        reject(err);
        return
      }
      console.log('√ git pull ' + name + ' success')
      resolve()
    })
  })
}

// 推送
function push(name){
  return new Promise((resolve,reject)=>{
    nodeCmd.get('git push origin '+ name,(err, data, stderr)=>{
      if(err){
        reject(err);
        return
      }
      console.log('√ git push ' + name + ' success')
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
      console.log('√ git add success')
      resolve()
    })
  })
}

// 提交
function commit(msg){
  return new Promise((resolve,reject)=>{
    const message = msg || '自动提交'
    nodeCmd.get('git commit -m "'+message+'"',(err, data, stderr)=>{
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
    return commit(params[0]);
  }).then(()=>{
    return pull(currentBranch);
  }).then(()=>{
    return push(currentBranch);
  }).catch((error)=>{
    console.log(error)
  })
}

function mergeHandler(){
  const form = params[0];
  const to = params[1];
  const msg = params[2]

  if(to === currentBranch){
    pull(to).then(()=>{
      return merge(form);
    }).then(()=>{
      push(to);
    })
  }else{
    add().then(()=>{
      return commit(msg)
    }).then(()=>{
      return checkout(to)
    }).then(()=>{
      return pull(to)
    }).then(()=>{
      return merge(form);
    }).then(()=>{
      push(to);
    })
  }
}