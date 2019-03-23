/**.-------------------------------------------------------------------------------------------------------------------
 * |  Github: https://github.com/Tinywan
 * |  Blog: http://www.cnblogs.com/Tinywan
 * |--------------------------------------------------------------------------------------------------------------------
 * |  Author: Tinywan(ShaoBo Wan)
 * |  DateTime: 2018/3/24 22:14
 * |  Mail: Overcome.wan@Gmail.com
 * '------------------------------------------------------------------------------------------------------------------*/

 'use strict';

 var snapshotButton = document.querySelector('button#snapshot');
 var filterSelect = document.querySelector('select#filter');
 
 // Put variables in global scope to make them available to the browser console.
 var video = window.video = document.querySelector('video');
 var canvas = window.canvas = document.querySelector('canvas');
 canvas.width = 480;
 canvas.height = 360;
 
 snapshotButton.onclick = function() {
   canvas.className = filterSelect.value;
   canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
 };
 
 filterSelect.onchange = function() {
   video.className = filterSelect.value;
 };
 
 var constraints = {
   audio: false,
   video: true
 };
 
 function handleSuccess(stream) {
   window.stream = stream; // make stream available to browser console
   video.srcObject = stream;
 }
 
 function handleError(error) {
   console.log('navigator.getUserMedia error: ', error);
 }
 
 navigator.mediaDevices.getUserMedia(constraints).
     then(handleSuccess).catch(handleError);
