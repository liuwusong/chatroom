/**
 * 使用方法  node git-cmd.js 指令 参数1 参数2 ...
 * 例如：
 * node git-cmd.js push 提交描述
 * node git-cmd.js merge 源分支 目标分支 提交描述
 * node git-cmd.js commit 提交描述
 */

const nodeCmd = require('node-cmd')
const argv = process.argv.slice(2);
// 指令
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
    case 'commit':
      commitHandler()
      break;
    default:
      console.log('指令为空或者错误，现有指令有  push  merge  commit')
      showBrach()
      break;
  }
}

// 显示所有分支
function showBrach(){
  nodeCmd.get('git branch -a',(err, data)=>{
    if(err){
      console.log(err);
      return
    }
    console.log(data)
  })
}
// 获取当前分支名称
function getCurrentBranch(){
  return new Promise((resolve,reject)=>{
    nodeCmd.get('git rev-parse --abbrev-ref HEAD',(err, data)=>{
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
    nodeCmd.get('git checkout '+ name,(err, data)=>{
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
    nodeCmd.get('git merge '+ name,(err, data)=>{
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
    nodeCmd.get('git pull origin '+ name,(err, data)=>{
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
    nodeCmd.get('git push origin '+ name,(err, data)=>{
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
    nodeCmd.get('git add .',(err, data)=>{
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
    nodeCmd.get('git commit -m "'+message+'"',(err, data)=>{
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

// 合并并提交操作
function mergeHandler(){
  const form = params[0];
  const to = params[1];
  const msg = params[2]

  // 在目标分支
  if(currentBranch === to){
    pull(to).then(()=>{
      return merge(form);
    }).then(()=>{
      push(to);
    }).catch((error)=>{
      console.log(error)
    })
  }else if(currentBranch === form){
    // 在源分支
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
    }).catch((error)=>{
      console.log(error)
    })
  }else{
    console.log('当前所在分支，不属于源分支和目标分支任何一个，是不是分支名写错了')
  }
}

// 当前分支提交操作
function commitHandler(){
  add().then(()=>{
    commit(params[0]);
  }).catch((error)=>{
    console.log(error)
  })
}