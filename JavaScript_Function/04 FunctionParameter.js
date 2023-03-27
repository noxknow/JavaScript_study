<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>함수 매개변수</title>
</head>
<body>
    <h1>JavaScript Functions</h1>
    <h2>Default Parameter Values</h2>

    <p id = "demo"></p>
    <p id = "demo2"></p>

    <script>
        function paraFunc(a, b) {
            console.log("paraFunc a : " + a);
            console.log("paraFunc b : " + b);
        }

        function paraFunc2(a, b) {
            if(b === undefined) {
                b = 0;
            }
            console.log("paraFunc2 a : " + a);
            console.log("paraFunc2 b : " + b);
        }
        
        function paraFunc3(a, b = 0) {
            console.log("paraFunc3 a : " + a);
            console.log("paraFunc3 b : " + b);
            return a * b;
        }
        document.getElementById("demo").innerHTML = paraFunc3(10, 20);

        function sum(...args) {
            let sum = 0;
            for(let i=0; i<args.length; i++) {
                sum += args[i];
            }

            return sum;
        }
        document.getElementById("demo2").innerHTML = sum(1,2,3,4,5,6,7,8,9,10);

        function findMax() {
            if(arguments.length == 0) {
                return "값을 주세요";
            }

            let max = -Infinity;
            for(let i=0; i<arguments.length; i++) {
                if(max < arguments[i]) {
                    max = arguments[i];
                }
            }
            return max;
        }
    </script>
</body>
</html>
