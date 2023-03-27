<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>출력</title>
</head>
<body>
    <button type = "button" onclick = "showText()">변경</button>
    <p id = "demo">여기에 결과가 나옵니다.</p>

    <hr>
    <button type = "button" onclick = "documentWrite()">화면 출력</button>
    
    <hr>
    <button type = "button" onclick = "showAlert()">경고장 출력</button>
    
    <hr>
    <button type = "button" onclick = "displayConsol()">콘솔탭 출력</button>

    <hr>
    <button type = "button" onclick = "window.print()">인쇄</button>

    <script>
        function showText() {
            let dm = document.getElementById("demo");
            demo.innerHTML = "환영합니다.";
        }

        function documentWrite() {
            document.write("<h2>화면에 출력<h2>");
        }

        function showAlert() {
            window.alert("확인 누르기")
        }

        function displayConsol() {
            console.log("테스트용");
        }

        /* 
        함수를 사용하지않으면 바로 바뀌지만 함수를 사용한 경우 바로 바뀌지 않고 
        웹 페이지 F12 개발자 도구 콘솔창에서 showText();를 불러주던지, button을 만들어서 
        변경해주는 방법이 있다.

        let dm = document.getElementById("demo");
        demo.innerHTML = "환영합니다.";
        */
    </script>
</body>
</html>
