<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Object</title>
</head>
<body>
    <script>
        const person = {
            name: "유재석",
            age: 52,
            eyeColor: "흑갈색",
            info: function() {
                return this.name + "(" + this.age() + ")";
            }
        }

        const person2 = {};
        person2.name = "정준하";
        person2.age = 53;
        person2.nic = "쩌리";
        person2.info = function() {
            return this.name + "(" + this.age() + ")";
        }

        const person3 = new Object();
        person3.name = "박명수";
        person3.profile = "토요일 밤이 좋아";

        const person4 = {
            name : "정형돈",
            age : 45,
            cars : [
                {name: "포드", model: ["피에스타", "포쿠스", "무스탕"]},
                {name : "BMW", model: ["320", "x3", "x5"]},
                {
                    name: "피아트",
                    model: [
                        "500",
                        "Panda"
                    ]
                }
            ]
        }
    </script>
</body>
</html>
