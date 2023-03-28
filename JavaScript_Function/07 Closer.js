<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>클로저</title>
</head>
<body>
    <script>
        function add() {
            let cnt = 0;

            function plus() {
                cnt++;
            }
            plus();
            plus();
            plus();
            return cnt;
        }

        console.log(add());
    </script>
</body>
</html>
