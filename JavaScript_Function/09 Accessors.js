<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Object 접근자</title>
</head>
<body>
    <script>
        const person = {
            firstName: "Jhon",
            lastName: "Doe",
            language: "en",
            get getLanguage() {
                return this.language;
            },
            set setLanguage(language) {
                this.language = language;
            }
        }
    </script>
</body>
</html>
