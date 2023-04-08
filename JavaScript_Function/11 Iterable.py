<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iterable</title>
</head>
<body>
    <h2>Iterable</h2>
    <pre style = "font-family: Consolas;">
        function IterString(str) {
            for(let x of str) {
                console.log(x);
            }
        }

        function Numbers() {
            let n = 0;
            return {
                next: function() {
                    n += 10;
                    return {
                        value: n,
                        done: false
                    }
                }
            };
        }

        Numbers = {};
        Numbers[Symbol.iterator] = function () {
            let n = 0;
            done = false;

            return {
                next: function() {
                    n += 10;
                    if(n == 100) {
                        done = true;
                    }
                    return {
                        value: n,
                        done: false
                    };
                }
            };
        }
    </pre>

    <script>
        function IterString(str) {
            for(let x of str) {
                console.log(x);
            }
        }

        /* function Numbers() {
            let n = 0;
            return {
                next: function() {
                    n += 10;
                    return {
                        value: n,
                        done: false
                    }
                }
            };
        } */

        // 객체를 만들어줘야 Symbol.iterator이 가능하다.
        Numbers = {};
        Numbers[Symbol.iterator] = function () {
            let n = 0;
            done = false;

            return {
                next: function() {
                    n += 10;
                    if(n == 100) {
                        done = true;
                    }
                    return {
                        value: n,
                        done: done
                    };
                }
            };
        }
    </script>
</body>
</html>
