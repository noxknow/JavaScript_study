<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <style>
        .container {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }
        .nav {
            /* input위치를 중앙에 위치 하려면 그보다 부모 클래스인 nav에서 
            text-align을 center로 준다.*/
            text-align: center;
            border: 10px solid rgb(143, 236, 143);
            border-radius: 10px;
            background-color: rgb(200, 255, 47);
            padding: 15px;
        }

        input {
          background-color: rgb(176, 176, 245);
          border: none;
        }

        #start {
          background-color: rgb(176, 176, 245);
          border: none;
          text-decoration: none;
        }
        #stop {
          background-color: rgb(176, 176, 245);
          border: none;
          text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
      <div class="js-alarm nav" id="alarm">
        <h1>00:00:00</h1>
        <input type="time">
        <button id="start">Start</button>
        <button id="stop">Stop</button>
      </div>
    </div>
  
    <script>
      const alarmContainer = document.querySelector('.js-alarm');
      const currentTime = alarmContainer.querySelector('h1');
      const audio = new Audio('./Audio/wake-up-call-111748.mp3');
      let intervalId;
  
      function updateCurrentTime() {
        const d = new Date();
        const hours = d.getHours();
        const minutes = d.getMinutes();
        const seconds = d.getSeconds();
        currentTime.innerText = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
      }
  
      function playAlarm() {
        audio.play();
      }
  
      function stopAlarm() {
        audio.pause();
        audio.currentTime = 0;
      }
  
      function startAlarm() {
        const alarmTime = alarmContainer.querySelector('input').value;
        const [alarmHour, alarmMinute] = alarmTime.split(':');
        intervalId = setInterval(() => {
          const d = new Date();
          const hours = d.getHours();
          const minutes = d.getMinutes();
          if (hours === parseInt(alarmHour) && minutes === parseInt(alarmMinute)) {
            playAlarm();
          }
        }, 1000);
      }
  
      function stopInterval() {
        clearInterval(intervalId);
      }
  
      function init() {
        updateCurrentTime();
        setInterval(updateCurrentTime, 1000);
        const startButton = alarmContainer.querySelector('#start');
        const stopButton = alarmContainer.querySelector('#stop');
        startButton.addEventListener('click', startAlarm);
        stopButton.addEventListener('click', stopAlarm);
      }
  
      init();
    </script>
</body>
</html>
