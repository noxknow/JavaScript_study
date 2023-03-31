<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <pre>
        function Person(name, age, eye) {
            this.name = name;
            this.age = age;
            this.eye = eye;
        }
        
        const member1 = new Person("박명수", 53, "흑갈색")
        const member2 = new Person("정준하", 52, "흑갈색")
    </pre>

    <script>
        function Person(name, age, eye) { 
            this.name = name;
            this.age = age;
            this.eye = eye;
            this.info = function() {
                return this.name + "(" + this.age + ")";
            }
        }

        const member1 = new Person("박명수", 53, "흑갈색")
        const member2 = new Person("정준하", 52, "흑갈색")
    </script>
</body>
</html>
