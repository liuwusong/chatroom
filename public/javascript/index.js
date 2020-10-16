window.onload = function () {
  const ws = new WebSocket('ws://localhost:8001');
  const button = document.getElementById('send-button');
  const inputs = document.getElementById('send-message');
  const messageList = document.getElementById('message-list')
  ws.onopen = function (){
    console.log('websocket 已经链接')
  }
  ws.onmessage = function(msg){
    console.log('onmessage');
    const messageQueue = msg.data.split('--|--');
    let html = messageQueue.map(item=>{
      return `
      <div class="messageItem left">
        <div class="messageContent">${item}</div>
      </div>
      `
    })
    messageList.innerHTML = html.join('');
  }

  
  button.onclick = function (){
    const value = inputs.value;
    ws.send(value);
    inputs.value = ''
  }
}