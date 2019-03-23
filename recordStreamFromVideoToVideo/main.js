let mediaRecorder;
let recordedBlobs;
let sourceBuffer;

let localStream;
let recordStream;
let localPeerConnection;
let remotePeerConnection;

let localVideo = document.getElementById("localVideo");
let recordedVideo = document.getElementById("recordedVideo");

let recordButton = document.getElementById("record");
let playButton = document.getElementById("play");
let downloadButton = document.getElementById("download");
playButton.disabled = true;
downloadButton.disabled = true;

recordButton.onclick = toggleRecording;
playButton.onclick = call;
downloadButton.onclick = download;

/*
 * 检测webRTC的可行性
 */
function detectWebRTC() {
    const WEBRTC_CONSTANTS = ["RTCPeerConnection", "webkitERCPeerConnection",
        "mozRTCPeerConnection", "RTCIceGather"
    ];

    const isWebRTCSupported = WEBRTC_CONSTANTS.find(item => {
        return item in window;
    });

    const isGetUserMediaSupported = navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

    if (!isWebRTCSupported || typeof isGetUserMediaSupported === "undefined") {
        return false;
    }

    trace("webRTC supported and getUserMedia supported!");
    return true;
}

function trace(param) {
    let time = (window.performance.now() / 1000).toFixed(3);
    console.log(time + ":" + param);
}

function handleSuccess(stream) {
    trace("getUserMedia() got stream!");
    recordButton.disabled = false;
    window.stream = stream; // 录制视频的时候要用到
    localStream = stream;
    localVideo.srcObject = stream;
}

function handleError(error) {
    trace(error.message);
}

let constraints = {
    video: true,
    audio: false
};
if (detectWebRTC()) {
    let isSecureOrigin = location.protocol === "https:" || location.hostname === "localhost";
    if (!isSecureOrigin) {
        alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
            '\n\nChanging protocol to HTTPS');
        location.protocol = 'HTTPS';
    }
    trace("this is secure origin");

    navigator.mediaDevices.getUserMedia(constraints)
        .then(handleSuccess).catch(handleError);
} else {
    trace("your browser is not support webRTC！please upgrade and try it again!");
}

let mediaSource = new MediaSource();
// 通过注册事件event::sourceopen来触发当前连接之后的的回调处理
mediaSource.addEventListener("sourceopen", handleSourceOpen, false);

/*
 * 回调处理就是需要赋值视频数据的地方，
 * 调用MediaSourceBuffer::addSourceBuffer方法来   ==>  构建一个存放视频数据的Buffer；
 */
function handleSourceOpen(event) {
    trace("MediaSource opened！");
    sourceBuffer = mediaSource.addSourceBuffer("video/webm;codecs='vp8'");
    trace(sourceBuffer);
}

/* 这里把每10ms获取的数据放入recordedBlobs */
function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
    }
}

/*
 * 录制button状态转换
 */
function toggleRecording() {
    if (recordButton.textContent === "Start Recording") {
        startRecording();
    } else {
        stopRecording();
        recordButton.textContent = "Start Recording";
        playButton.disabled = false;
        downloadButton.disabled = false;

        let test = document.getElementById("test");
        let buffer = new Blob(recordedBlobs, {
            type: "video/webm"
        });
        test.src = window.URL.createObjectURL(buffer);
        recordStream = test.captureStream();
    }
}

/* 开始录制 */
function startRecording() {
    recordedBlobs = [];
    let options = {
        mimeType: "video/webm;codecs=vp9"
    };
    // isTypeSupporteed:判断是否支持要解码播放的视频文件编码和类型。
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + "is not Supported");
        options = {
            mimeType: "video/webm;codecs=vp8"
        };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.log(options.mimeType + "is not Supported");
            options = {
                mimeType: "video/webm;codecs=vp8"
            };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.log(options.mimeType + "is not Supported");
                options = {
                    mimeType: ""
                };
            }
        }
    }
    try {
        mediaRecorder = new MediaRecorder(window.stream, options); // 设置音频录入源、格式
    } catch (e) {
        console.log("Exception while creating MediaRecorder: " + e);
        alert('Exception while creating MediaRecorder: ' +
            e + '. mimeType: ' + options.mimeType);
        return;
    }
    console.log("Created MediaRecorder", mediaRecorder, "with options", options);
    recordButton.textContent = "Stop Recording";
    playButton.disabled = true;
    downloadButton.disabled = true;
    mediaRecorder.onstop = handleStop;
    mediaRecorder.ondataavailable = handleDataAvailable; // 存放获取的数据
    mediaRecorder.start(10); //  开始录制 collect 10ms of data
    console.log("MediaRecorder started", mediaRecorder);
}

function handleStop(event) {
    console.log("Recorder stopped: ", event);
}

/* 结束录制 */
function stopRecording() {
    mediaRecorder.stop();
    console.log("Recorded Blobs: ", recordedBlobs);
    recordedVideo.controls = true;
}

/*
 * 录制视频添加监听事件
 */
recordedVideo.addEventListener("error", function (ev) {
    trace("MediaRecording.recordedMedia.error()");
    alert('Your browser can not play\n\n' + recordedVideo.src +
        '\n\n media clip. event: ' + JSON.stringify(ev));
}, true);


/*
 * 播放录制的视频
 */
function call() {
    trace("Starting call");

    if (localStream.getVideoTracks().length > 0) {
        trace("Using video device: " + localStream.getVideoTracks()[0].label);
    }
    if (localStream.getAudioTracks().length > 0) {
        trace("Using audio device: " + localStream.getAudioTracks()[0].label);
    }

    var servers;

    localPeerConnection = new RTCPeerConnection(servers);
    trace("Create local peer connection object localPeerConnection");
    localPeerConnection.onicecandidate = gotLocalIceCandidate;

    remotePeerConnection = new RTCPeerConnection(servers);
    trace("Create remote peer connection object remotePeerConnection");
    remotePeerConnection.onicecandidate = gotRemoteIceCandidate;

    remotePeerConnection.onaddstream = gotRemoteStream;

    localPeerConnection.addStream(recordStream);
    trace("Added recordStream to localPeerConnection");
    localPeerConnection.createOffer(gotLocalDescription, handleError);
}

function gotLocalDescription(description) { //description是offer方的  SD  ==>  传输的内容
    localPeerConnection.setLocalDescription(description);
    trace("Offer from localPeerConnection: \n" + description.sdp);
    remotePeerConnection.setRemoteDescription(description); //answer方接收offer的SD
    remotePeerConnection.createAnswer(gotRemoteDescription, handleError); //answer方发送自己的SD
}

function gotRemoteDescription(description) {
    remotePeerConnection.setLocalDescription(description); //answer方设置本身自己的SD
    trace("Answer from remotePeerConnection: \n" + description.sdp);
    localPeerConnection.setRemoteDescription(description); //offer接收answer方的SD
}

function gotRemoteStream(event) {
    recordedVideo.srcObject = event.stream;
    trace("Received remote stream");
}

function gotLocalIceCandidate(event) {
    if (event.candidate) {
        remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate)); //answer方接收ICE
        trace("Local ICE candidate: \n" + event.candidate.candidate);
    }
}

function gotRemoteIceCandidate(event) {
    if (event.candidate) {
        localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate)); //offer方接收ICE
        trace("Remote ICE candidate: \n " + event.candidate.candidate);
    }
}

/*
 * 下载视频
 */
function download() {
    let blob = new Blob(recordedBlobs, {
        type: "video/webm"
    });
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "test.webm";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100)
}