# BAQ

`createObjectURL`错误`Failed to execute 'createObjectURL' on 'URL'`
```js
window.URL.createObjectURL(data)

var binaryData = [];
binaryData.push(data);
window.URL.createObjectURL(new Blob(binaryData, {type: "application/zip"}));
```

# navigator

- `navigator.mediaDevices.getDisplayMedia`屏幕源
- `navigator.mediaDevices.getUserMedia`摄像头源

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>

<body>
    <style>
        video {
            width: 1000px;
            height: 500px
        }
    </style>
    <video autoplay id="video">Video stream not available.</video>
    <script>
        let video = document.getElementById('video');
        navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            })
            .then(stream => {
                // we have a stream, attach it to a feedback video element
                console.log(stream);
                
                video.srcObject = stream;
            }, error => {
                console.log("Unable to acquire screen capture", error);
            });
    </script>
</body>

</html>
```

# MediaRecorder

用`MediaRecorder`录制视频或者音频的步骤
- `navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {}`获取音视频的`stream`
- `var mediaRecorder = new MediaRecorder(stream)`实例化`mediaRecorder`，`mediaRecorder`会不断接受`navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {}`所提供的`stream`，并且它自身有多个方法
- `mediaRecorder.start()`点击事件触发开始录制
- `mediaRecorder.onstop = function(e) {}`往`mediaRecorder`监听停止事件`var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });chunks = [];`这里的`chunks`会从无到有，随着音视频流被监听，不断增加，注意`onstop`会触发两次，一开始未录制和暂停都会触发
- `mediaRecorder.ondataavailable = function(e) {chunks.push(e.data);}`不断监听`stream`，并往`chunks`数组添加音视频流的数据
- `mediaRecorder.stop()`点击事件触发暂停录制
- `var audioURL = URL.createObjectURL(blob);audio.src = audioURL;console.log("recorder stopped");`用`blob`生成一个`url`挂载到`audio`或者`video`标签上面去播放

```js
var constraints = { audio: true };
var chunks = [];

navigator.mediaDevices.getUserMedia(constraints)
.then(function(stream) {

var mediaRecorder = new MediaRecorder(stream);

record.onclick = function() {
    mediaRecorder.start();
    console.log(mediaRecorder.state);
}

stop.onclick = function() {
    mediaRecorder.stop();
    console.log(mediaRecorder.state);
}

mediaRecorder.onstop = function(e) {
    audio.setAttribute('controls', '');
    audio.controls = true;
    var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
    chunks = [];
    var audioURL = URL.createObjectURL(blob);
    audio.src = audioURL;
    console.log("recorder stopped");
}

mediaRecorder.ondataavailable = function(e) {
    chunks.push(e.data);
}
})
.catch(function(err) {
console.log('The following error occurred: ' + err);
})
```

# webkitRTCPeerConnection

```js
localPeerConnection = new RTCPeerConnection(null);
localPeerConnection.onicecandidate = function(event) {
    if (event.candidate) {
        remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate)); //answer方接收ICE
    }
};

remotePeerConnection = new RTCPeerConnection(null);
remotePeerConnection.onicecandidate = function(event) {
    if (event.candidate) {
        localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate)); //offer方接收ICE
    }
};

remotePeerConnection.onaddstream = function gotRemoteStream(event) {
    recordedVideo.srcObject = event.stream;
};

localPeerConnection.addStream(recordStream);
localPeerConnection.createOffer(function (description) { //description是offer方的  SD  ==>  传输的内容
    localPeerConnection.setLocalDescription(description);
    remotePeerConnection.setRemoteDescription(description); //answer方接收offer的SD
    remotePeerConnection.createAnswer(function (description) {
        remotePeerConnection.setLocalDescription(description); //answer方设置本身自己的SD
        localPeerConnection.setRemoteDescription(description); //offer接收answer方的SD
    }, function (error) {
        console.log(error)
    }); //answer方发送自己的SD
}, function (error) {
    console.log(error)
});
```

# Blob

|代码|作用|类型|
|-|-|-|
|`navigator.mediaDevices.getUserMedia(constraints).then(function(stream){};`|根据音视频源头生成`stream`|MediaStream|
|`mediaRecorder = new MediaRecorder(window.stream, options)`|根据音视频源头把`stream`交给`mediaRecorder`处理|MediaRecorder|
|`mediaRecorder.ondataavailable = function (event) {recordedBlobs.push(event.data);}`|根据`stream`获取每一片段的`BlobEvent`并存入`recordedBlobs`数组|BlobEvent|
|`let buffer = new Blob(recordedBlobs, {type: "video/webm"});`|得到`Blob`格式的音视频流|Blob|
|`test.src = window.URL.createObjectURL(buffer);`|可用`window.URL.createObjectURL`方法处理Blob并配合`video`或者`audio`标签播放|src|
|`recordStream = test.captureStream();`|把`Blob`转化为`MediaStream`|MediaStream|
|`new RTCPeerConnection(null).addStream(recordStream);`|将`recordStream`交给`RTCPeerConnection`处理|MediaStream|
```js
mediaRecorder = new MediaRecorder(window.stream, options); // 设置音频录入源、格式
mediaRecorder.ondataavailable = function (event) {
    // 这个会不断接受BlobEvent
    console.log(event);
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
    }
}; // 存放获取的数据
let buffer = new Blob(recordedBlobs, {
    type: "video/webm"
});
console.log(buffer);
test.src = window.URL.createObjectURL(buffer);
recordStream = test.captureStream();
```

# 参考文档

- RTCPeerConnection
    - [MDN API文档](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Taking_still_photos#Get_the_video)
    - [MDN例子](https://mdn-samples.mozilla.org/s/webrtc-capturestill/)
    - [有没有人用MediaRecorder在pc上录制视频并上传到服务器](https://segmentfault.com/q/1010000011489899)
    - [MDN RTCPeerConnection文档](https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection)

- MediaRecorder
    - [MDN MediaRecorder文档](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)