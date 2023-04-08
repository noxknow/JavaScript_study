<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StopWatch</title>

    <style>
        * {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            box-sizing: border-box;
        }
        .stopwatch-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        /* 원래 여기에 align-items: center;를 맞추려고 했는데 .stopwatch에 들어간 코드는  stopwatch 하위인 color박스와 text박스에 적용되는거라 color의 안에 있는 time에 적용이 안되기 때문에 color에 맞춰준다. */
        .stopwatch {
            border: 10px solid rgb(241, 241, 167);
            background-color: beige;
            border-radius: 10px;
            padding: 1rem;
        }
        .color {
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: rgb(144, 144, 238);
            padding: 10px;
        }
        .time {
            font-size: 4rem;
            margin-bottom: 2rem;
        }
        
        button {
            font-size: 1.5rem;
            margin: 0 1rem;
            padding: 0.5rem 1rem;
        }
        .start-btn {
            background-color: #61B15A;
        }
        .stop-btn {
            background-color: #c75643;
        }
        .reset-btn {
            background-color: #575e68;
        }
        .start-btn:hover,
        .stop-btn:hover,
        .reset-btn:hover {
            opacity: 0.4;
        }

        .text {
            align-self: flex-start;
        }
    </style>
</head>
<body>
    <div class="stopwatch-wrapper">
        <div class="stopwatch">
            <div class = "color">
                <h1 class="time">00:00:00</h1>
                <div class = "but">
                    <button class="start-btn">Start</button>
                    <button class="stop-btn">Stop</button>
                    <button class="reset-btn">Reset</button>
                </div>
            </div>
            <div class = "text">
                <p class = "laps">Time Lap</p>
            </div>
        </div>
    </div>
    
    <script>
        const timeEl = document.querySelector(".time");
        const startbtn = document.querySelector(".start-btn");
        const stopBtn = document.querySelector('.stop-btn');
        const resetBtn = document.querySelector('.reset-btn');
        const lapsEl = document.querySelector('.laps');

        // 타이머 초기값 설정
        let second = 0;
        let minute = 0;
        let hour = 0;
        let intervalId;

        function updateTime() {
            second++;
            if(second === 60) {
                second = 0;
                minute++;
            }
            if(minute === 60) {
                minute = 0;
                hour++;
            }
            timeEl.textContent = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
        }

        startbtn.addEventListener('click', () => {
            intervalId = setInterval(updateTime, 1000);
        });

        stopBtn.addEventListener('click', () => {
            clearInterval(intervalId);
        });

        resetBtn.addEventListener('click', () => {
            clearInterval(intervalId);
            second = 0;
            minute = 0;
            hour = 0;
            timeEl.textContent = '00:00:00';
            lapsEl.innerHTML = 'Time Lap'; 
        });

        function addLap() {
            const lapTime = timeEl.textContent;
            const li = document.createElement('li');
            li.textContent = lapTime;
            lapsEl.appendChild(li);
        }

        lapsEl.addEventListener('click', addLap);
    </script>
</body>
</html>
