<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>변수</title>
</head>
<body>
    <p id = "demo"></p>
    <script>
        /* 
        f를 괄호를 제외하고 f만 넣게 되면 function toCelsius(fahrenheit) 
        { return (5/9)*(fahrenheit - 32) } 이런식으로 객체가 나오게 된다.
        그냥 f를 변수로 안주고 toCelsius(50); 해도 똑같다.
        */
        function toCelsius(fahrenheit) {
            return (5/9)*(fahrenheit - 32)
        }
        let f = toCelsius
        document.getElementById("demo").innerHTML = f(50);
        
        // x라는 변수에 function을 함수가 아닌 값으로 보고 넣었다고 생각하면 된다.
        /*
        const x = function (a, b) {
            return a+b;
        }
        */

        const x = new Function ("a", "b", "return a+b");

        let res = x(30, 20);
        console.log("res : " + res);


        /*
        let, const 로 선언한 변수는 다시 선언할 수 없다. 하지만 var은 var carName;
        처럼 가능하게 나오는데 이는 에러가 나오지 않고, 재선언을 하게 되는 좋지 않은 코드이다.
        즉, let, const를 주로 사용하기.
        */
        var carName = "Volvo";
        var carName;
        console.log(carName);

        var carName = "BMW";
        console.log(carName);

        let sum = 0;
        for (let i=1; i<=10; i++) {
            sum += i;
        }
        console.log(sum);

        const PI =  3.14;
        PI = 1.414;
        console.log(PI);
    </script>
</body>
</html>
