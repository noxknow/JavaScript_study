<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>함수</title>
</head>
<body>
    <script>
        function hi() {
            console.log("Hello");
        }

        hi();

        let hi2 = function() {
            console.log("Good Morning!!");
        }

        hi2();

        (function() {
            console.log("Good Afternoon!!");
        })("재석.");

        function testFunction(a, b) {
            console.log(arguments);
            console.log(arguments.length);
        }

        const arrowFunction = (a,b) => {
            let res = a*b;
            console.log(res);
        }

        const arrowFunction2 = (a,b) => console.log(a*b);

        const arrowFunction3 = (a,b) => a*b;

        const arrowFunction4 = a => a*a;

        const arrowFunction5 = () => "Good Evening!!";
    </script>
</body>
</html>
