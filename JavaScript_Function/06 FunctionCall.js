<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Call() 함수</title>
</head>
<body>
    <script>
        const person = {
            name : "박준형",
            nic : "갈갈이",
            info : function() {
                console.log(this.name + "(" + this.nic + ")님 환영");
            },
            addinfo : function(age, addr) {
                this.age = age;
                this.addr = addr;
            }
        };

        const person1 = {
            name : "정준하",
            nic : "주나"
        }

        function showTime() {
            console.log(new Date());
        }
    </script>
</body>
</html>
