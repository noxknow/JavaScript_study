<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>함수 호출</title>
</head>
<body>
    <script>
        function globalThis() {
            return this;
        }

        const obj = {
            name : "유재석",
            age : 50,
            info : function() {
                return this.name + "(" + this.age + ")님 환영합니다.";
            }
        }

        function People(name, age) {
            this.name = name;
            this.age = age;
            this.info = function() {
                return this.name + "(" + this.age + ")님 환영합니다."; 
            }
        }

        const p1 = new People("박명수", 52);
        const p2 = new People("정형돈", 48);
    </script>
</body>
</html>
