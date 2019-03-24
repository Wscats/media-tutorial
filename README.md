# BAQ

`createObjectURL`错误`Failed to execute 'createObjectURL' on 'URL'`
```js
window.URL.createObjectURL(data)

var binaryData = [];
binaryData.push(data);
window.URL.createObjectURL(new Blob(binaryData, {type: "application/zip"}));
```

# 一个简单的例子

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

# MediaSource

# webkitRTCPeerConnection

# Blob


# 参考文档

- [MDN API文档](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Taking_still_photos#Get_the_video)
- [MDN例子](https://mdn-samples.mozilla.org/s/webrtc-capturestill/)
- [有没有人用MediaRecorder在pc上录制视频并上传到服务器](https://segmentfault.com/q/1010000011489899)
- [MDN RTCPeerConnection文档](https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection)