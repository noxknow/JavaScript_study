# Javascript 이벤트 루프와 비동기 흐름

cf) https://engineering.linecorp.com/ko/blog/dont-block-the-event-loop

[https://inpa.tistory.com/entry/🔄-자바스크립트-이벤트-루프-구조-동작-원리#node.js의_내부_구성도](https://inpa.tistory.com/entry/%F0%9F%94%84-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-%EC%9D%B4%EB%B2%A4%ED%8A%B8-%EB%A3%A8%ED%94%84-%EA%B5%AC%EC%A1%B0-%EB%8F%99%EC%9E%91-%EC%9B%90%EB%A6%AC#node.js%EC%9D%98_%EB%82%B4%EB%B6%80_%EA%B5%AC%EC%84%B1%EB%8F%84)

[https://velog.io/@seongkyun/fetch-setTimeout은-표준-API일까-len7n3gc](https://velog.io/@seongkyun/fetch-setTimeout%EC%9D%80-%ED%91%9C%EC%A4%80-API%EC%9D%BC%EA%B9%8C-len7n3gc)

# 👍 자바스크립트 자체는 단일 스레드이다.

---

자바스크립트가 단일 스레드 기반임에도 동시성을 지원한다고 서술하였지만, 자바스크립트 엔진에는 이벤트 루프를 취급하지 않는다. 자바스크립트의 엔진인 V8의 경우 단일 호출 스택(`Call stack`)을 사용하며 요청이 들어올 때 마다 해당 요청을 순차적으로 호출 스택에 담아 처리할 뿐이다.

비동기 요청은 자바스크립트 엔진을 구동하는 환경, 즉 `브라우저`나 `NodeJS`가 담당한다.브라우저 환경은 다음과 같다.

!https://velog.velcdn.com/images/seungchan__y/post/fb296026-5ff1-4093-918f-bbe80f2b594b/image.png

비동기 호출을 위해 사용하는 `setTimeout` 이나 `XMLHttpRequest` 와 같은 함수들은 자바스크립트 엔진이 아닌 `Web API` 영역에 따로 정의되어 있다. 또한 이벤트 루프와 태스크 큐와 같은 장치들도 자바스크립트 엔진 밖에 구현되어 있는 것을 확인할 수 있다.

!https://velog.velcdn.com/images/seungchan__y/post/f8b9a4e8-06d0-429a-b3e0-f22b4b57fd16/image.png

`NodeJS` 환경에서도 브라우저와 거의 비슷한 구조를 볼 수 있는데, 차이점이 있다면 비동기 IO를 지원하기 위하여 `libuv` 라이브러리를 사용하며 이 `libuv` 가 이벤트 루프를 제공한다. 자바스크립트 엔진은 비동기 작업을 위해서 `NodeJS`의 API를 호출하며, 이때 넘겨진 콜백은 `libuv` 의 이벤트 루프를 통해 스케쥴되고 실행된다.

자바스크립트가 `단일 스레드` 기반의 언어라는 말은 `자바스크립트 엔진이 단일 호출 스택을 사용한다`는 관점에서만 사실이다. 실제 자바스크립트가 구동되는 환경(브라우저, NodeJS 등)에서는 주로 여러 개의 스레드가 사용되며, 이러한 구동 환경이 단일 호출 스택을 사용하는 자바스크립트 엔진과 상호 연동하기 위해 사용하는 장치가 바로 `이벤트 루프` 인 것이다.

## 이벤트 루프 예제

---

<aside>
☑️ 실행 과정은 다음의 순서로 진행된다.

```jsx
const foo = () => console.log("First");
const bar = () => setTimeout(() => console.log("Second"), 500);
const baz = () => console.log("Third");

bar();
foo();
baz();
```

!https://velog.velcdn.com/images/seungchan__y/post/2ee81248-5393-46cb-bd99-d0219e25bb5a/image.gif

1. `bar` 함수가 호출된다. 이때 `Call stack`에 들어온 `setTimeout` 이라는 비동기 API를 처리해야 되기에 `WebAPI` 에서 500 밀리 초 동안 대기하게 된다
2. 대기 하는 동안 `foo` 함수가 호출되고 이로 인해 출력창에 `“First”` 가 나온다.
3. `setTimeout`에서 명시한 대기시간이 만료되어 `Task Queue` 로 전달된다. `Task Queue` 에 쌓이는 내용들은 이벤트 루프에 의해서 처리되는데, 이는 `Call stack` 이 비어있는 경우에만 이벤트루프에 의해 처리된다.
4. `baz` 함수가 호출되고 출력창에 `“Third”` 가 나온다.
5. `Call stack` 이 비어있는 상태인것을 파악한 이벤트 루프가 `Task Queue` 에 저장되어 있던 `setTimeout` 의 콜백함수를 콜스택에 넘기고 실행이 이루어지면서 출력창에는 `“Second”` 가 나오게 된다.

즉 정리해보자면, 동기적인 Task들은 `Call stack` 에 의하여 순차적으로 처리되는 반면 `setTimeout` 과 같은 비동기 이벤트들은 Call stack에 들어오더라도 Web API와 Task Queue를 거친 뒤 `Call stack` 이 비어있을때에만 이벤트 루프에 의해 `Call stack` 으로 옮겨져 다시 처리됨을 알 수 있다.

### ⚙️ Micro Task , Macro Task

---

`Task Queue` 에 의해서 비동기적으로 처리되는 Task들은 크게 두 가지 종류로 나뉘게 된다. 우선순위 다소 높은 비동기 API들을 `Macro Task`로 분류하며 대표적인 예로 위에서 다뤘던 `setTimeout` , `setInterval` , `setImmediate` 등이 있다. 한편, 이보다 더 높은 우선순위를 가지는 비동기 API들은 `Micro Task` 로 분류하며, `process.nextTick`, `Promise`객체의 `callback`, `queueMicrotask` 등이 있다. 그럼 이들이 어떤 방식으로 처리되게 될까?

!https://velog.velcdn.com/images/seungchan__y/post/104e6f34-1daf-4fb4-8b92-6d4ef1ede5ae/image.gif

앞에서 말했듯이 우선순위가 더 높은 Task들이 `Micro Task` 들로 분류되기에 위 그림 처럼 여기에 저장되어있던 비동기 Task들이 우선적으로 처리된 이후에, `Macro Task` 에 저장된 Task들이 처리되는 모습이다. 물론 `Micro Task` 들 역시도 `Call stack` 에서 더 이상 처리할게 없어야 비로소 실행된다.

그러면 실제 예시에서 `setTimeout` 가 `Promise` 객체의 코드가 동시에 주어졌을때 어떻게 처리되는지 확인해보자. 예시로 다음의 코드를 살펴보자.

```jsx
console.log('Start!');

setTimeout(() => {
	console.log('Timeout!');
}, 0);

Promise.resolve('Promise!').then(res => console.log(res));

console.log('End!');
```

코드 내용을 살펴보면, 첫번째 비동기 부분에선 `setTimeout` 을 통해서 0초동안 대기 하였다가 `Timeout!` 을 출력하는 콜백함수를 실행한다. 두번째 비동기 부분에선 Promise 객체에 의해 비동기 적으로 `Promise!` 라는 텍스트를 출력하는 부분이다. 이 코드를 실행해보면 아래와 같다.

!https://velog.velcdn.com/images/seungchan__y/post/daffade2-1f3a-4561-88db-729f1c9f4fc1/image.gif

`Call Stack`에 첫번째 코드 부분이 쌓인 뒤 실행 되어 콘솔창에 `Start!` 가 출력된다.

!https://velog.velcdn.com/images/seungchan__y/post/0dd73b90-841b-4ce7-b3f3-067b8c2e9fd7/image.gif

`setTimeout` 부분이 콜스택에 적재된 이후에 `WebAPI` 에 의해 타이머가 작동하게 된다. 0초라서 사실상 바로 타이머는 종료된다.

!https://velog.velcdn.com/images/seungchan__y/post/880395f4-d76f-47c9-a932-b9d60969204c/image.gif

타이머가 종료됨에 따라 `setTimeout` 의 콜백함수 부분은 `MacroTask` 로 분류된다. 세번째 부분인 `Promise` 부분에선 콜스택에 적재 된다. 이때 `Promise.resolve` 는 인자로 받은 값을 `.then` 키워드 부분에 전달하는 역할을 함과 동시에 비동기 처리를 해제하는 역할을 한다. 이에 따라 `.then` 이후 부분은 `MircroTask` 에 분류시킨다.

!https://velog.velcdn.com/images/seungchan__y/post/5f642434-99ee-407a-9a69-eded921fb1bb/image.gif

네번째 부분이 실행됨에 따라 `End!` 라는 글자가 콘솔창에 출력된다. 이때 Task Queue에 적재된 Task들은 아직 `Call Stack` 내부가 아직 비워지지 않음에 따라 아직 `Queue`에서 빠져나가지 않는다.

!https://velog.velcdn.com/images/seungchan__y/post/c612820d-0058-4f2a-96df-5432e164b14e/image.gif

!https://velog.velcdn.com/images/seungchan__y/post/f9ea2759-1b94-453b-8dc0-068fcf137a1b/image.gif

`Call stack` 이 비워진 것을 파악한 이벤트 루프는 순차적으로 `MicroTask Queue` 에 있는 Task들을 비워낸 후 `MacroTask Queue` 에 있는 Task들을 비워낸다. 비워낼때에는 당연히 Call Stack에 적재 시킨뒤에 순차적으로 실행시켜 처리한다.

</aside>

# 🚧 Async/Await 와 이벤트 루프

---

<aside>
☑️ `Async/Await` 키워드는 비동기 처리를 위해 `ES7` 부터 새롭게 도입된 것으로 기존의 `Promise` 와 잘 호환되게 설계 되었다. 이전에는 비동기 이벤트 처리를 위해 `Promise` 객체를 직접적으로 명시하는 수고가 필요했는데 이는 잘 작동하겠지만, 여전히 직관성이 떨어지는 코드에 해당된다.

!https://velog.velcdn.com/images/seungchan__y/post/d28a1895-9d62-4d4b-bfca-8e0d15792270/image.png

`Async/await` 키워드를 이용해 이제 `Promise` 객체를 반환하는 부분을 직관적으로 표현할 수 있게 된다.

이를 자세하게 파헤쳐 보고자 아래의 코드를 예시로 알아보고자 한다.

```jsx
const one = () => Promise.resolve('One!');

async function myFunc(){
	console.log('In function!');
	const res = await one();
	console.log(res);
}

console.log('Before Function!');
myFunc();
console.log('After Function!');
```

!https://velog.velcdn.com/images/seungchan__y/post/1aeb0a42-5aac-496a-a019-7ced61a72a5b/image.gif

당연하게도 첫번째에서는 Call stack에 `console.log` 부분이 적재된 이후에 실행되어 `‘Before function!’` 이라는 문장이 출력되게 된다.

!https://velog.velcdn.com/images/seungchan__y/post/43566b06-4538-4816-89cb-773a17bc4c72/image.gif

두번째 부분에서 `myFunc` 함수가 호출되고 내부에 `console.log` 부분이 호출됨에 따라 콘솔 창에는 `In Function!` 이 추가로 출력된다.

!https://velog.velcdn.com/images/seungchan__y/post/0c521a7d-a0d0-4a5b-8f17-234f488a739c/image.gif

세번째에서는 `myFunc` 내부함수 `one` 이 호출되고 이는 `Promise` 객체를 반환한다. 이때 중요한 것은 `await` 키워드가 있다는 점인데, 이로 인해 `myFunc` 함수의 내부 실행은 잠시 중단되고 `Call stack` 에서 빠져나와 나머지 부분은 `Microtask Queue` 에 의해 처리된다. 이는 자바스크립트 엔진이 `await` 키워드를 인식하면 `async` 함수의 실행은 지연되는 것으로 처리하기 때문이다.

!https://velog.velcdn.com/images/seungchan__y/post/c804f1f3-bd4b-4f93-bf1f-5305eebddbe5/image.gif

!https://velog.velcdn.com/images/seungchan__y/post/6bf593b8-fbda-4355-b1fe-1de1b1bee485/image.gif

`“After function!”` 이 출력하는 부분을 실행 한 뒤에 `Microstask Queue` 에 저장된 `myFunc` 실행 부분이 `Call Stack` 에 적재되어 실행된다. 그렇기에 마지막으로 `one` 이 반환하는 `“One!”` 이 출력된다.

</aside>

# **Run-to-completion**

---

Run-to-completion이란, 하나의 메시지 처리가 시작되면 이 메시지의 처리가 끝날 때까지는 다른 어떤 작업도 중간에 끼어들지 못한다는 의미이다. 아래는 run-to-completion의 예제이다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop3-1024x576.jpeg

위 왼쪽 예제 코드를 실행하면 오른쪽과 같은 결과를 확인할 수 있다 (브라우저 프로세스가 먹통이 되어 어쩔 수 없이 강제 종료시켜야 할 수도 있습니다). 그럼 이러한 run-to-completion 방식의 동작 원리는 무엇일까?

# 콜 스택

---

<aside>
☑️ Javascript는 코드가 실행될 때 요청을 순차적으로 콜 스택에 담아서 처리하게 된다.

이와 같이 JavaScript는 콜 스택 구조와 함께 run-to-completion 방식으로 동작한다.

그렇다면 만약 같은 상황에서 요청을 차례로 처리하다가 시간이 다소 오래 걸리는 작업을 만나면 어떻게 될까요? 아래 예제를 살펴보겠습니다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop5.gif

이전 예제와 같이 동작을 하다가 `someExpensive` 함수와 같이 처리하는 데 오래 걸리는 요청을 만나면 'hello' 나 'jsConfKorea' 메시지를 출력하는 일에 지연이 발생할 것입니다.

그렇다면 여기서 한 가지 의문이 생깁니다. JavaScript가 단일 콜 스택 구조로 작업을 처리한다고 했는데요. 우리가 웹 서비스를 이용할 때를 생각해 봅시다. 클릭하고 스크롤하고 타이핑하는 와중에 데이터를 호출하여 화면에 보여주고... 이러한 작업들이 정말 순차적으로 차례차례 기다리면서 처리되고 있는 걸까요? 실제로는 그렇지 않습니다. 브라우저와 JavaScript 엔진은 이러한 동시성 문제를 해결해주는 웹 API(`setTimeout`, `Promise` 등..)와 이벤트 루프를 제공하고 있습니다.

</aside>

# 이벤트 루프 동작 과정

---

<aside>
☑️ 이벤트 루프가 어떻게 동작하는지 알아보면

1. 처리할 작업이 있다면 그중 가장 오래된 작업을 실행한다.
2. 처리할 작업이 없다면 다음 작업을 기다린다.
3. 다시 처리할 작업이 있다면 1번으로 돌아가 반복한다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop6.gif

`setTimeout`은 타이머 이벤트를 생성해 인자로 넘겨준 시간만큼 기다렸다가 수행하는 기능을 하는데요. 예제 코드와 같이 인자가 없는 경우에는 기본값인 0을 넘겨줍니다. 타이머 시간을 0으로 주었기 때문에 바로 실행되어야 할 것 같지만 실제론 그렇지 않습니다. 왜 그런지는 이후에 코드가 어떻게 동작하는지 하나하나 따라가면서 알아보도록 하겠습니다. `Promise`는 비동기 작업이 처리되었을 미래 시점의 완료 또는 실패의 상황을 다루는데 사용하는 API입니다. 위 코드에서는 `resolve` 메서드를 통해 빈 값으로 이행하는 `Promise`를 반환하고 `then` 메서드를 통해 이행 완료하였을 때의 콜백을 넘겨줍니다.

코드는 아래 순서로 동작합니다.

1. `setTimeout`을 호출한다.
2. 콜백을 태스크 대기 열에 담아둔다.
3. `Promise`를 호출한다.
4. `then`에 콜백으로 넘어온 부분을 '마이크로 태스크' 대기 열에 담아둔다.
</aside>

## settimeout과 promise의 콜백 대기열이 다른 이유?

---

1. **`setTimeout`**:
    - **`setTimeout`**의 콜백 함수는 "태스크 큐"에 추가됩니다.
    - 태스크 큐는 이벤트 루프(Event Loop)의 일부이며, 콜 스택이 비어있을 때 실행 대기 중인 작업들을 가져와 실행시킵니다.
    - 따라서 **`setTimeout`** 콜백은 현재 실행 중인 코드의 실행이 끝나고, 콜 스택이 비워진 후에 실행됩니다.
2. **`Promise`**:
    - **`Promise`**의 **`then`** 메서드를 통해 등록한 콜백 함수는 "마이크로 태스크 큐"에 추가됩니다.
    - 마이크로 태스크 큐는 태스크 큐보다 우선 순위가 더 높으며, 현재 실행 중인 태스크가 끝난 직후에 콜 스택에 추가됩니다.
    - 즉, 마이크로 태스크 큐에 있는 작업들은 현재 실행 중인 코드의 완료와 관계없이 가능한 빨리 실행됩니다.

따라서, 비동기 작업의 우선 순위는 **`setTimeout`** 콜백이 태스크 큐에 추가되어 더 나중에 실행되는 반면, **`Promise`**의 **`then`** 콜백은 마이크로 태스크 큐에 추가되어 먼저 실행되는 차이가 있습니다. 이런 우선 순위 차이로 인해 **`Promise`**를 사용하여 비동기 코드를 작성할 때 더 정확한 제어와 순서를 보장할 수 있습니다.

# **마이크로 태스크**

---

<aside>
☑️ 여기서 '마이크로 태스크(micro task)' 란? ES2015에서는 동시성을 다루기 위한 `Promise`와 같은 API들이 추가되었는데요. 이들은 일반 태스크와는 조금 다른, 마이크로 태스크를 다루게 됩니다. 태스크는 브라우저 혹은 그 외 구동 환경에서 순차적으로 실행되어야 하는 작업을 의미합니다. 단순히 스크립트를 실행하거나, `setTimeout`이나 UI 이벤트 발생으로 인한 콜백 등이 그 대상이 됩니다.

마이크로 태스크는 현재 실행되고 있는 작업 바로 다음으로 실행되어야 할 비동기 작업을 뜻합니다. 즉 마이크로 태스크는 일반 태스크보다 높은 우선순위를 갖는다고 볼 수 있습니다. 예제에 사용된 `Promise`나 Observer API, NodeJS의 `process.nextTick` 등이 그 대상이 됩니다.

앞서 설명한 이벤트 루프의 동작 순서에 마이크로 태스크 개념을 포함하면 다음과 같습니다.

1. 마이크로 태스크가 있는지 먼저 확인하고, 있다면 모든 마이크로 태스크를 먼저 수행한다.
2. 처리할 태스크가 있다면 가장 오래된 태스크를 실행한다.
3. 처리할 태스크가 없다면 다음 태스크를 기다린다.
4. 다시 처리할 작업이 있다면 1번으로 돌아가 반복한다.

태스크를 기다리기 전에 마이크로 태스크가 있는지를 먼저 확인하고, 마이크로 태스크가 있다면 먼저 모두 수행하고 나서 태스크를 수행합니다.

그럼 아까 예제 코드로 다시 돌아오면, 드디어 이벤트 루프가 하는 일을 확인할 수 있습니다. `Promise`의 `then` 메서드로 넘겨준 콜백이 마이크로 태스크로써 이벤트 루프를 통해 콜 스택으로 투입된 뒤 실행됩니다. 그다음엔 'hello'를 출력하는 태스크를 수행합니다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop7.gif

그렇다면 이벤트 루프에 대한 이해를 기반으로 비동기를 다루는 웹 API를 활용하면 모든 문제를 다 해결할 수 있는 걸까요? 아쉽게도 그렇진 않습니다. 여전히 앞선 태스크 때문에 다음 태스크 실행이 가로막힐 수 있는 가능성이 남아 있습니다. 

아래 예제를 보면, 코드가 차례로 수행되다가 고비용 연산 작업으로 가정한 `someExpensive` 함수를 먼저 콜 스택으로 밀어 넣는데요. 이 때문에 'hello'를 출력하는 태스크는 이벤트 루프에 막혀 버립니다. 해당 작업이 완료되고 나서야 실행될 수 있겠죠.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop8.gif

정리하자면, 태스크는 항상 이벤트 루프를 통해 순차적으로 실행되기 때문에 임의의 태스크가 완료되기 전까지는 다른 태스크가 실행될 수 없고, 마이크로 태스크 대기 열은 일반 태스크 대기 열보다 우선순위가 높기 때문에 마이크로 태스크 대기 열이 모두 비워지기 전까진 UI 이벤트가 실행될 수 없습니다. 즉 CPU에서 고 비용 연산을 포함한 태스크나 마이크로 태스크가 실행되고 있다면, UI와 직결된 클릭, 텍스트 입력, 렌더링과 같은 이벤트가 가로막힐 수 있고, 이것은 곧 사용자 경험을 해치는 요소가 될 수 있다는 것입니다.

</aside>

# 문제 해결 방안

---

이런 시간을 최대한 줄이기 위해 제안하는 방법은 크게 두 가지입니다. 하나는 단일 콜 스택 구조와 이벤트 루프 때문에 블록이 발생하고 있으니 다른 스레드에 작업을 위임하는 방법이고, 또 다른 하나는 블로킹의 원인이 되는 고비용 태스크를 적절하게 쪼개서 실행하는 방법입니다.

# **웹 워커**

---

<aside>
☑️ JavaScript에서 웹 워커(web worker)를 활용하면 멀티 스레딩이 가능합니다. 웹 워커는 스크립트 수행을 메인 스레드가 아닌 별도 백그라운드 스레드에서 수행할 수 있게 해줍니다.

메인 스레드에서 워커 객체를 생성하면 워커 스레드와 메시지 기반으로 통신이 가능합니다. 워커 스레드에게 `postMessage`를 통해 처리하는 데 오래 걸리는 작업의 실행을 요청하면 워커 스레드는 이를 실행합니다. 이를 통해 메인 스레드가 블록되는 것을 막을 수 있습니다. 워커 스레드는 작업이 완료되면 역시 `postmessage`를 통해 결과 완료 메시지를 전송하고, 메인 스레드에선 이를 통해 또 다른 작업을 할 수 있게 됩니다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop12-1024x576.png

아래는 해당 방법을 적용하여 개선한 데모의 프로파일링 결과입니다. 프레임을 표시하고 사용자의 상호작용에 반응하는 시간이 상당 부분 줄어든 것을 확인할 수 있습니다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop13-1024x576.png

하지만 이 방법으로도 버벅거림을 전혀 느낄 수 없는 사용자 경험에까지 이르진 못했습니다. 일반적으로 60FPS, 즉 프레임 하나 처리하는데 걸리는 시간이 16ms 이하여야 매끄럽게 느껴지는데요. 그 기준에는 다소 미치지 못한 것으로 보입니다. 아마 일부 연산은 워커 스레드에 위임했지만 DOM 갱신과 같은 작업은 여전히 메인 스레드에서 수행하고 있기 때문에 그런 것 같습니다. 메인 스레드와 워커 스레드는 메시지 기반으로만 통신 가능하다는 것이 웹 워커의 한계입니다. 즉, 워커는 직접 DOM이나 메인 스레드의 콘텍스트에 접근할 수 없습니다.

</aside>

# **스케줄링**

---

<aside>
☑️ 또 다른 방법으로는 고비용 태스크를 여러 개로 쪼개 비동기적으로 적절히 실행시키는 방법이 있습니다. 처리하는 데 오래 걸리는 태스크 때문에 뒤의 태스크들이 블록되고 있다면, 이를 적절하게 쪼개서 태스크들 사이사이에서 실행될 수 있도록 만드는 것입니다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop14-1024x576.png

기존 코드에서 입력(input) 이벤트가 트리거되었을 때 바로 작업을 수행하던 것과는 다르게, 위 코드에선 `runChunks`라는 인터페이스에 `chunkGenerator`를 넘겨주고 있습니다. `chunkgenerator`는 기존 반복문을 적절한 청크(chunk) 단위로 쪼개서 해당 단위마다 산출(yield)시키는 패턴을 가지고 있습니다. `runChunks`는 산출된 작업을 `setTimeout`과 같은 비동기 API를 통해 태스크 대기 열에 적재시키는 역할을 합니다.

위 방법을 적용하여 프로파일링 결과를 살펴보니, 역시나 상당 부분 개선된 것을 확인할 수 있습니다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop15-1024x576.png

하는 김에 좀 더 최적화를 해보자면, 데모는 텍스트 입력에 따라 DOM을 갱신하게 되는데요. 빠르게 타이핑하는 경우엔 입력에 따라 매번 DOM을 갱신하는 것이 아니라 마지막 순간에만 갱신해도 될 것 같습니다. 태스크가 큰 덩어리였다면 다음 태스크가 블록되므로 갱신할지 말지 판단하여 작업을 수행하는 게 불가능했을 텐데요. 태스크를 잘게 쪼개 놓은 덕분에 이러한 방법을 적용하는 게 가능합니다. 아래 코드와 같이 수행하는 태스크를 확인 후 진행 중이라면 해당 태스크를 취소하고 새로운 태스크를 수행하도록 합니다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop16-1024x576.png

그 결과 아래와 같이 프로파일링 그래프도 상당히 깔끔해졌습니다. 프레임 처리 최대 소요 시간도 마지막에 DOM을 갱신하는 순간에만 100ms 정도이고 나머지 프레임은 준수한 편입니다. 상호작용 반응 시간도 눈에 띄게 짧아졌습니다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop17-1024x576.png

</aside>

# 정리

<aside>
☑️ '만약 실행 시간이 긴 태스크 혹은 마이크로 태스크가 렌더링이나 클릭, 입력과 같은 이벤트를 블록한다면 사용자 경험을 해칠 수 있다. 이를 개선하기 위해 웹 워커와 같은 백그라운드 스레드에 처리하는 데 오래 걸리는 작업을 위임하거나, 작은 태스크로 쪼개서 적절하게 실행될 수 있도록 처리하여 중요한 UI 이벤트가 블록되지 않도록 조치해야 한다'

</aside>

## ☁️ 동기 & 비동기

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/9b0dc406-daab-44ec-8ad0-25dabda26377/Untitled.png)

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/3ac79723-d854-4bb9-812b-003e7d29d147/Untitled.png)

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/e0cf6807-0264-4a49-b1b8-bb0aaba5850a/Untitled.png)

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/32a53766-83d6-49af-9c76-7fb6035a4442/Untitled.png)

> JK님 스케치 예시
> 

### 🔹 동기적 처리 방식

- 싱글 스레드 작업 수행 방식하나의 작업이 너무 오래 걸리게 될 때, 그 오래 걸리는 하나의 작업이 종료되기 전까지 모든 작업이 올 스탑되기 때문에 전반적인 흐름이 느려짐
    
    !https://github.com/KimGaeun0806/Udemy-React-Note/raw/main/sources/%EB%8F%99%EA%B8%B0%EC%8B%B1%EA%B8%80%EC%8A%A4%EB%A0%88%EB%93%9C.png
    
    - Thread -> 연산과정을 수행. 코드를 한줄 한줄 실행시켜줌.
    - JS는 코드가 작성된 순서대로 작업을 처리함
    - 이전 작업이 진행 중일 때는 다음 작업을 수행하지 않고 기다림
    - 먼저 작성된 코드를 다 실행하고 나서 뒤에 작성된 코드를 실행
    - 블로킹 방식 -> 스레드에서 작업 하나가 수행되고 있을 때 다른 작업을 동시에 할 수 없는 방식
    
    !https://github.com/KimGaeun0806/Udemy-React-Note/raw/main/sources/%EB%8F%99%EA%B8%B0%EC%8B%B1%EA%B8%80%EC%8A%A4%EB%A0%88%EB%93%9C2.png
    
- 멀티 스레드 작업 수행 방식
    
    !https://github.com/KimGaeun0806/Udemy-React-Note/raw/main/sources/%EB%A9%80%ED%8B%B0%EC%8A%A4%EB%A0%88%EB%93%9C.png
    
    - Thread를 여러 개 사용하는 방식
    - 작업들을 각각의 스레드에 분할해서 실행시킴
    - 하지만 JS는 싱글 스레드 방식으로 동작하기 때문에 사용할 수 x

### 🔹 비동기적 처리 방식

!https://github.com/KimGaeun0806/Udemy-React-Note/raw/main/sources/%EB%B9%84%EB%8F%99%EA%B8%B0.png

- 스레드가 하나라도, 다른 작업이 끝나는 것을 신경쓰지 않고 작업 여러 개를 동시에 실행시킬 수 있음
- 먼저 작성된 코드의 결과를 기다리지 않고 다음 코드 바로 실행
- 싱글 스레드 방식을 이용하면서 동기적 작업의 단점을 극복하기 위해, 여러 개의 작업을 동시에 실행시킴
- 논 블로킹 방식 -> 하나의 작업이 스레드를 점유하지 않는 방식. 즉 하나의 작업을 수행할 때 스레드가 다른 작업을 하지 못하도록 하는 블로킹을 하지 않음.

!https://github.com/KimGaeun0806/Udemy-React-Note/raw/main/sources/%EB%B9%84%EB%8F%99%EA%B8%B0%EC%BD%9C%EB%B0%B1.png

- 작업이 정상적으로 끝났다는 것과 작업 결과를 확인하기 위해서
- 콜백 함수를 붙여서 전달

### 동기 비동기 개인적인 이해

비동기의 경우 return값이 없기 때문에 콜백내부에서 해결을 해야한다.

async await? → await한 부분의 결과가 나올때까지 기다려라

해시하는 곳은 파일의 내용을 해시하는 것이다.

### async / await

```jsx
async function showAvatar() {

  // JSON 읽기
  let response = await fetch('/article/promise-chaining/user.json');
  let user = await response.json();

  // github 사용자 정보 읽기
  let githubResponse = await fetch(`https://api.github.com/users/${user.name}`);
  let githubUser = await githubResponse.json();

  // 아바타 보여주기
  let img = document.createElement('img');
  img.src = githubUser.avatar_url;
  img.className = "promise-avatar-example";
  document.body.append(img);

  // 3초 대기
  await new Promise((resolve, reject) => setTimeout(resolve, 3000));

  img.remove();

  return githubUser;
}

showAvatar();
```

### Promise

```jsx
// user.json에 요청을 보냅니다.
fetch('/article/promise-chaining/user.json')
  // 응답받은 내용을 json으로 불러옵니다.
  .then(response => response.json())
  // GitHub에 요청을 보냅니다.
  .then(user => fetch(`https://api.github.com/users/${user.name}`))
  // 응답받은 내용을 json 형태로 불러옵니다.
  .then(response => response.json())
  // 3초간 아바타 이미지(githubUser.avatar_url)를 보여줍니다.
  .then(githubUser => {
    let img = document.createElement('img');
    img.src = githubUser.avatar_url;
    img.className = "promise-avatar-example";
    document.body.append(img);

    setTimeout(() => img.remove(), 3000); // (*)
  });
```

```jsx
// 재사용 하는 경우

function loadJson(url) {
  return fetch(url)
    .then(response => response.json());
}

function loadGithubUser(name) {
  return fetch(`https://api.github.com/users/${name}`)
    .then(response => response.json());
}

function showAvatar(githubUser) {
  return new Promise(function(resolve, reject) {
    let img = document.createElement('img');
    img.src = githubUser.avatar_url;
    img.className = "promise-avatar-example";
    document.body.append(img);

    setTimeout(() => {
      img.remove();
      resolve(githubUser);
    }, 3000);
  });
}

// 함수를 이용하여 다시 동일 작업 수행
loadJson('/article/promise-chaining/user.json')
  .then(user => loadGithubUser(user.name))
  .then(showAvatar)
  .then(githubUser => alert(`Finished showing ${githubUser.name}`));
  // ...
```

### 디버거 위치# Javascript 이벤트 루프와 비동기 흐름

cf) https://engineering.linecorp.com/ko/blog/dont-block-the-event-loop

[https://inpa.tistory.com/entry/🔄-자바스크립트-이벤트-루프-구조-동작-원리#node.js의_내부_구성도](https://inpa.tistory.com/entry/%F0%9F%94%84-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-%EC%9D%B4%EB%B2%A4%ED%8A%B8-%EB%A3%A8%ED%94%84-%EA%B5%AC%EC%A1%B0-%EB%8F%99%EC%9E%91-%EC%9B%90%EB%A6%AC#node.js%EC%9D%98_%EB%82%B4%EB%B6%80_%EA%B5%AC%EC%84%B1%EB%8F%84)

[https://velog.io/@seongkyun/fetch-setTimeout은-표준-API일까-len7n3gc](https://velog.io/@seongkyun/fetch-setTimeout%EC%9D%80-%ED%91%9C%EC%A4%80-API%EC%9D%BC%EA%B9%8C-len7n3gc)

# 👍 자바스크립트 자체는 단일 스레드이다.

---

자바스크립트가 단일 스레드 기반임에도 동시성을 지원한다고 서술하였지만, 자바스크립트 엔진에는 이벤트 루프를 취급하지 않는다. 자바스크립트의 엔진인 V8의 경우 단일 호출 스택(`Call stack`)을 사용하며 요청이 들어올 때 마다 해당 요청을 순차적으로 호출 스택에 담아 처리할 뿐이다.

비동기 요청은 자바스크립트 엔진을 구동하는 환경, 즉 `브라우저`나 `NodeJS`가 담당한다.브라우저 환경은 다음과 같다.

!https://velog.velcdn.com/images/seungchan__y/post/fb296026-5ff1-4093-918f-bbe80f2b594b/image.png

비동기 호출을 위해 사용하는 `setTimeout` 이나 `XMLHttpRequest` 와 같은 함수들은 자바스크립트 엔진이 아닌 `Web API` 영역에 따로 정의되어 있다. 또한 이벤트 루프와 태스크 큐와 같은 장치들도 자바스크립트 엔진 밖에 구현되어 있는 것을 확인할 수 있다.

!https://velog.velcdn.com/images/seungchan__y/post/f8b9a4e8-06d0-429a-b3e0-f22b4b57fd16/image.png

`NodeJS` 환경에서도 브라우저와 거의 비슷한 구조를 볼 수 있는데, 차이점이 있다면 비동기 IO를 지원하기 위하여 `libuv` 라이브러리를 사용하며 이 `libuv` 가 이벤트 루프를 제공한다. 자바스크립트 엔진은 비동기 작업을 위해서 `NodeJS`의 API를 호출하며, 이때 넘겨진 콜백은 `libuv` 의 이벤트 루프를 통해 스케쥴되고 실행된다.

자바스크립트가 `단일 스레드` 기반의 언어라는 말은 `자바스크립트 엔진이 단일 호출 스택을 사용한다`는 관점에서만 사실이다. 실제 자바스크립트가 구동되는 환경(브라우저, NodeJS 등)에서는 주로 여러 개의 스레드가 사용되며, 이러한 구동 환경이 단일 호출 스택을 사용하는 자바스크립트 엔진과 상호 연동하기 위해 사용하는 장치가 바로 `이벤트 루프` 인 것이다.

## 이벤트 루프 예제

---

<aside>
☑️ 실행 과정은 다음의 순서로 진행된다.

```jsx
const foo = () => console.log("First");
const bar = () => setTimeout(() => console.log("Second"), 500);
const baz = () => console.log("Third");

bar();
foo();
baz();
```

!https://velog.velcdn.com/images/seungchan__y/post/2ee81248-5393-46cb-bd99-d0219e25bb5a/image.gif

1. `bar` 함수가 호출된다. 이때 `Call stack`에 들어온 `setTimeout` 이라는 비동기 API를 처리해야 되기에 `WebAPI` 에서 500 밀리 초 동안 대기하게 된다
2. 대기 하는 동안 `foo` 함수가 호출되고 이로 인해 출력창에 `“First”` 가 나온다.
3. `setTimeout`에서 명시한 대기시간이 만료되어 `Task Queue` 로 전달된다. `Task Queue` 에 쌓이는 내용들은 이벤트 루프에 의해서 처리되는데, 이는 `Call stack` 이 비어있는 경우에만 이벤트루프에 의해 처리된다.
4. `baz` 함수가 호출되고 출력창에 `“Third”` 가 나온다.
5. `Call stack` 이 비어있는 상태인것을 파악한 이벤트 루프가 `Task Queue` 에 저장되어 있던 `setTimeout` 의 콜백함수를 콜스택에 넘기고 실행이 이루어지면서 출력창에는 `“Second”` 가 나오게 된다.

즉 정리해보자면, 동기적인 Task들은 `Call stack` 에 의하여 순차적으로 처리되는 반면 `setTimeout` 과 같은 비동기 이벤트들은 Call stack에 들어오더라도 Web API와 Task Queue를 거친 뒤 `Call stack` 이 비어있을때에만 이벤트 루프에 의해 `Call stack` 으로 옮겨져 다시 처리됨을 알 수 있다.

### ⚙️ Micro Task , Macro Task

---

`Task Queue` 에 의해서 비동기적으로 처리되는 Task들은 크게 두 가지 종류로 나뉘게 된다. 우선순위 다소 높은 비동기 API들을 `Macro Task`로 분류하며 대표적인 예로 위에서 다뤘던 `setTimeout` , `setInterval` , `setImmediate` 등이 있다. 한편, 이보다 더 높은 우선순위를 가지는 비동기 API들은 `Micro Task` 로 분류하며, `process.nextTick`, `Promise`객체의 `callback`, `queueMicrotask` 등이 있다. 그럼 이들이 어떤 방식으로 처리되게 될까?

!https://velog.velcdn.com/images/seungchan__y/post/104e6f34-1daf-4fb4-8b92-6d4ef1ede5ae/image.gif

앞에서 말했듯이 우선순위가 더 높은 Task들이 `Micro Task` 들로 분류되기에 위 그림 처럼 여기에 저장되어있던 비동기 Task들이 우선적으로 처리된 이후에, `Macro Task` 에 저장된 Task들이 처리되는 모습이다. 물론 `Micro Task` 들 역시도 `Call stack` 에서 더 이상 처리할게 없어야 비로소 실행된다.

그러면 실제 예시에서 `setTimeout` 가 `Promise` 객체의 코드가 동시에 주어졌을때 어떻게 처리되는지 확인해보자. 예시로 다음의 코드를 살펴보자.

```jsx
console.log('Start!');

setTimeout(() => {
	console.log('Timeout!');
}, 0);

Promise.resolve('Promise!').then(res => console.log(res));

console.log('End!');
```

코드 내용을 살펴보면, 첫번째 비동기 부분에선 `setTimeout` 을 통해서 0초동안 대기 하였다가 `Timeout!` 을 출력하는 콜백함수를 실행한다. 두번째 비동기 부분에선 Promise 객체에 의해 비동기 적으로 `Promise!` 라는 텍스트를 출력하는 부분이다. 이 코드를 실행해보면 아래와 같다.

!https://velog.velcdn.com/images/seungchan__y/post/daffade2-1f3a-4561-88db-729f1c9f4fc1/image.gif

`Call Stack`에 첫번째 코드 부분이 쌓인 뒤 실행 되어 콘솔창에 `Start!` 가 출력된다.

!https://velog.velcdn.com/images/seungchan__y/post/0dd73b90-841b-4ce7-b3f3-067b8c2e9fd7/image.gif

`setTimeout` 부분이 콜스택에 적재된 이후에 `WebAPI` 에 의해 타이머가 작동하게 된다. 0초라서 사실상 바로 타이머는 종료된다.

!https://velog.velcdn.com/images/seungchan__y/post/880395f4-d76f-47c9-a932-b9d60969204c/image.gif

타이머가 종료됨에 따라 `setTimeout` 의 콜백함수 부분은 `MacroTask` 로 분류된다. 세번째 부분인 `Promise` 부분에선 콜스택에 적재 된다. 이때 `Promise.resolve` 는 인자로 받은 값을 `.then` 키워드 부분에 전달하는 역할을 함과 동시에 비동기 처리를 해제하는 역할을 한다. 이에 따라 `.then` 이후 부분은 `MircroTask` 에 분류시킨다.

!https://velog.velcdn.com/images/seungchan__y/post/5f642434-99ee-407a-9a69-eded921fb1bb/image.gif

네번째 부분이 실행됨에 따라 `End!` 라는 글자가 콘솔창에 출력된다. 이때 Task Queue에 적재된 Task들은 아직 `Call Stack` 내부가 아직 비워지지 않음에 따라 아직 `Queue`에서 빠져나가지 않는다.

!https://velog.velcdn.com/images/seungchan__y/post/c612820d-0058-4f2a-96df-5432e164b14e/image.gif

!https://velog.velcdn.com/images/seungchan__y/post/f9ea2759-1b94-453b-8dc0-068fcf137a1b/image.gif

`Call stack` 이 비워진 것을 파악한 이벤트 루프는 순차적으로 `MicroTask Queue` 에 있는 Task들을 비워낸 후 `MacroTask Queue` 에 있는 Task들을 비워낸다. 비워낼때에는 당연히 Call Stack에 적재 시킨뒤에 순차적으로 실행시켜 처리한다.

</aside>

# 🚧 Async/Await 와 이벤트 루프

---

<aside>
☑️ `Async/Await` 키워드는 비동기 처리를 위해 `ES7` 부터 새롭게 도입된 것으로 기존의 `Promise` 와 잘 호환되게 설계 되었다. 이전에는 비동기 이벤트 처리를 위해 `Promise` 객체를 직접적으로 명시하는 수고가 필요했는데 이는 잘 작동하겠지만, 여전히 직관성이 떨어지는 코드에 해당된다.

!https://velog.velcdn.com/images/seungchan__y/post/d28a1895-9d62-4d4b-bfca-8e0d15792270/image.png

`Async/await` 키워드를 이용해 이제 `Promise` 객체를 반환하는 부분을 직관적으로 표현할 수 있게 된다.

이를 자세하게 파헤쳐 보고자 아래의 코드를 예시로 알아보고자 한다.

```jsx
const one = () => Promise.resolve('One!');

async function myFunc(){
	console.log('In function!');
	const res = await one();
	console.log(res);
}

console.log('Before Function!');
myFunc();
console.log('After Function!');
```

!https://velog.velcdn.com/images/seungchan__y/post/1aeb0a42-5aac-496a-a019-7ced61a72a5b/image.gif

당연하게도 첫번째에서는 Call stack에 `console.log` 부분이 적재된 이후에 실행되어 `‘Before function!’` 이라는 문장이 출력되게 된다.

!https://velog.velcdn.com/images/seungchan__y/post/43566b06-4538-4816-89cb-773a17bc4c72/image.gif

두번째 부분에서 `myFunc` 함수가 호출되고 내부에 `console.log` 부분이 호출됨에 따라 콘솔 창에는 `In Function!` 이 추가로 출력된다.

!https://velog.velcdn.com/images/seungchan__y/post/0c521a7d-a0d0-4a5b-8f17-234f488a739c/image.gif

세번째에서는 `myFunc` 내부함수 `one` 이 호출되고 이는 `Promise` 객체를 반환한다. 이때 중요한 것은 `await` 키워드가 있다는 점인데, 이로 인해 `myFunc` 함수의 내부 실행은 잠시 중단되고 `Call stack` 에서 빠져나와 나머지 부분은 `Microtask Queue` 에 의해 처리된다. 이는 자바스크립트 엔진이 `await` 키워드를 인식하면 `async` 함수의 실행은 지연되는 것으로 처리하기 때문이다.

!https://velog.velcdn.com/images/seungchan__y/post/c804f1f3-bd4b-4f93-bf1f-5305eebddbe5/image.gif

!https://velog.velcdn.com/images/seungchan__y/post/6bf593b8-fbda-4355-b1fe-1de1b1bee485/image.gif

`“After function!”` 이 출력하는 부분을 실행 한 뒤에 `Microstask Queue` 에 저장된 `myFunc` 실행 부분이 `Call Stack` 에 적재되어 실행된다. 그렇기에 마지막으로 `one` 이 반환하는 `“One!”` 이 출력된다.

</aside>

# **Run-to-completion**

---

Run-to-completion이란, 하나의 메시지 처리가 시작되면 이 메시지의 처리가 끝날 때까지는 다른 어떤 작업도 중간에 끼어들지 못한다는 의미이다. 아래는 run-to-completion의 예제이다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop3-1024x576.jpeg

위 왼쪽 예제 코드를 실행하면 오른쪽과 같은 결과를 확인할 수 있다 (브라우저 프로세스가 먹통이 되어 어쩔 수 없이 강제 종료시켜야 할 수도 있습니다). 그럼 이러한 run-to-completion 방식의 동작 원리는 무엇일까?

# 콜 스택

---

<aside>
☑️ Javascript는 코드가 실행될 때 요청을 순차적으로 콜 스택에 담아서 처리하게 된다.

이와 같이 JavaScript는 콜 스택 구조와 함께 run-to-completion 방식으로 동작한다.

그렇다면 만약 같은 상황에서 요청을 차례로 처리하다가 시간이 다소 오래 걸리는 작업을 만나면 어떻게 될까요? 아래 예제를 살펴보겠습니다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop5.gif

이전 예제와 같이 동작을 하다가 `someExpensive` 함수와 같이 처리하는 데 오래 걸리는 요청을 만나면 'hello' 나 'jsConfKorea' 메시지를 출력하는 일에 지연이 발생할 것입니다.

그렇다면 여기서 한 가지 의문이 생깁니다. JavaScript가 단일 콜 스택 구조로 작업을 처리한다고 했는데요. 우리가 웹 서비스를 이용할 때를 생각해 봅시다. 클릭하고 스크롤하고 타이핑하는 와중에 데이터를 호출하여 화면에 보여주고... 이러한 작업들이 정말 순차적으로 차례차례 기다리면서 처리되고 있는 걸까요? 실제로는 그렇지 않습니다. 브라우저와 JavaScript 엔진은 이러한 동시성 문제를 해결해주는 웹 API(`setTimeout`, `Promise` 등..)와 이벤트 루프를 제공하고 있습니다.

</aside>

# 이벤트 루프 동작 과정

---

<aside>
☑️ 이벤트 루프가 어떻게 동작하는지 알아보면

1. 처리할 작업이 있다면 그중 가장 오래된 작업을 실행한다.
2. 처리할 작업이 없다면 다음 작업을 기다린다.
3. 다시 처리할 작업이 있다면 1번으로 돌아가 반복한다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop6.gif

`setTimeout`은 타이머 이벤트를 생성해 인자로 넘겨준 시간만큼 기다렸다가 수행하는 기능을 하는데요. 예제 코드와 같이 인자가 없는 경우에는 기본값인 0을 넘겨줍니다. 타이머 시간을 0으로 주었기 때문에 바로 실행되어야 할 것 같지만 실제론 그렇지 않습니다. 왜 그런지는 이후에 코드가 어떻게 동작하는지 하나하나 따라가면서 알아보도록 하겠습니다. `Promise`는 비동기 작업이 처리되었을 미래 시점의 완료 또는 실패의 상황을 다루는데 사용하는 API입니다. 위 코드에서는 `resolve` 메서드를 통해 빈 값으로 이행하는 `Promise`를 반환하고 `then` 메서드를 통해 이행 완료하였을 때의 콜백을 넘겨줍니다.

코드는 아래 순서로 동작합니다.

1. `setTimeout`을 호출한다.
2. 콜백을 태스크 대기 열에 담아둔다.
3. `Promise`를 호출한다.
4. `then`에 콜백으로 넘어온 부분을 '마이크로 태스크' 대기 열에 담아둔다.
</aside>

## settimeout과 promise의 콜백 대기열이 다른 이유?

---

1. **`setTimeout`**:
    - **`setTimeout`**의 콜백 함수는 "태스크 큐"에 추가됩니다.
    - 태스크 큐는 이벤트 루프(Event Loop)의 일부이며, 콜 스택이 비어있을 때 실행 대기 중인 작업들을 가져와 실행시킵니다.
    - 따라서 **`setTimeout`** 콜백은 현재 실행 중인 코드의 실행이 끝나고, 콜 스택이 비워진 후에 실행됩니다.
2. **`Promise`**:
    - **`Promise`**의 **`then`** 메서드를 통해 등록한 콜백 함수는 "마이크로 태스크 큐"에 추가됩니다.
    - 마이크로 태스크 큐는 태스크 큐보다 우선 순위가 더 높으며, 현재 실행 중인 태스크가 끝난 직후에 콜 스택에 추가됩니다.
    - 즉, 마이크로 태스크 큐에 있는 작업들은 현재 실행 중인 코드의 완료와 관계없이 가능한 빨리 실행됩니다.

따라서, 비동기 작업의 우선 순위는 **`setTimeout`** 콜백이 태스크 큐에 추가되어 더 나중에 실행되는 반면, **`Promise`**의 **`then`** 콜백은 마이크로 태스크 큐에 추가되어 먼저 실행되는 차이가 있습니다. 이런 우선 순위 차이로 인해 **`Promise`**를 사용하여 비동기 코드를 작성할 때 더 정확한 제어와 순서를 보장할 수 있습니다.

# **마이크로 태스크**

---

<aside>
☑️ 여기서 '마이크로 태스크(micro task)' 란? ES2015에서는 동시성을 다루기 위한 `Promise`와 같은 API들이 추가되었는데요. 이들은 일반 태스크와는 조금 다른, 마이크로 태스크를 다루게 됩니다. 태스크는 브라우저 혹은 그 외 구동 환경에서 순차적으로 실행되어야 하는 작업을 의미합니다. 단순히 스크립트를 실행하거나, `setTimeout`이나 UI 이벤트 발생으로 인한 콜백 등이 그 대상이 됩니다.

마이크로 태스크는 현재 실행되고 있는 작업 바로 다음으로 실행되어야 할 비동기 작업을 뜻합니다. 즉 마이크로 태스크는 일반 태스크보다 높은 우선순위를 갖는다고 볼 수 있습니다. 예제에 사용된 `Promise`나 Observer API, NodeJS의 `process.nextTick` 등이 그 대상이 됩니다.

앞서 설명한 이벤트 루프의 동작 순서에 마이크로 태스크 개념을 포함하면 다음과 같습니다.

1. 마이크로 태스크가 있는지 먼저 확인하고, 있다면 모든 마이크로 태스크를 먼저 수행한다.
2. 처리할 태스크가 있다면 가장 오래된 태스크를 실행한다.
3. 처리할 태스크가 없다면 다음 태스크를 기다린다.
4. 다시 처리할 작업이 있다면 1번으로 돌아가 반복한다.

태스크를 기다리기 전에 마이크로 태스크가 있는지를 먼저 확인하고, 마이크로 태스크가 있다면 먼저 모두 수행하고 나서 태스크를 수행합니다.

그럼 아까 예제 코드로 다시 돌아오면, 드디어 이벤트 루프가 하는 일을 확인할 수 있습니다. `Promise`의 `then` 메서드로 넘겨준 콜백이 마이크로 태스크로써 이벤트 루프를 통해 콜 스택으로 투입된 뒤 실행됩니다. 그다음엔 'hello'를 출력하는 태스크를 수행합니다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop7.gif

그렇다면 이벤트 루프에 대한 이해를 기반으로 비동기를 다루는 웹 API를 활용하면 모든 문제를 다 해결할 수 있는 걸까요? 아쉽게도 그렇진 않습니다. 여전히 앞선 태스크 때문에 다음 태스크 실행이 가로막힐 수 있는 가능성이 남아 있습니다. 

아래 예제를 보면, 코드가 차례로 수행되다가 고비용 연산 작업으로 가정한 `someExpensive` 함수를 먼저 콜 스택으로 밀어 넣는데요. 이 때문에 'hello'를 출력하는 태스크는 이벤트 루프에 막혀 버립니다. 해당 작업이 완료되고 나서야 실행될 수 있겠죠.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop8.gif

정리하자면, 태스크는 항상 이벤트 루프를 통해 순차적으로 실행되기 때문에 임의의 태스크가 완료되기 전까지는 다른 태스크가 실행될 수 없고, 마이크로 태스크 대기 열은 일반 태스크 대기 열보다 우선순위가 높기 때문에 마이크로 태스크 대기 열이 모두 비워지기 전까진 UI 이벤트가 실행될 수 없습니다. 즉 CPU에서 고 비용 연산을 포함한 태스크나 마이크로 태스크가 실행되고 있다면, UI와 직결된 클릭, 텍스트 입력, 렌더링과 같은 이벤트가 가로막힐 수 있고, 이것은 곧 사용자 경험을 해치는 요소가 될 수 있다는 것입니다.

</aside>

# 문제 해결 방안

---

이런 시간을 최대한 줄이기 위해 제안하는 방법은 크게 두 가지입니다. 하나는 단일 콜 스택 구조와 이벤트 루프 때문에 블록이 발생하고 있으니 다른 스레드에 작업을 위임하는 방법이고, 또 다른 하나는 블로킹의 원인이 되는 고비용 태스크를 적절하게 쪼개서 실행하는 방법입니다.

# **웹 워커**

---

<aside>
☑️ JavaScript에서 웹 워커(web worker)를 활용하면 멀티 스레딩이 가능합니다. 웹 워커는 스크립트 수행을 메인 스레드가 아닌 별도 백그라운드 스레드에서 수행할 수 있게 해줍니다.

메인 스레드에서 워커 객체를 생성하면 워커 스레드와 메시지 기반으로 통신이 가능합니다. 워커 스레드에게 `postMessage`를 통해 처리하는 데 오래 걸리는 작업의 실행을 요청하면 워커 스레드는 이를 실행합니다. 이를 통해 메인 스레드가 블록되는 것을 막을 수 있습니다. 워커 스레드는 작업이 완료되면 역시 `postmessage`를 통해 결과 완료 메시지를 전송하고, 메인 스레드에선 이를 통해 또 다른 작업을 할 수 있게 됩니다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop12-1024x576.png

아래는 해당 방법을 적용하여 개선한 데모의 프로파일링 결과입니다. 프레임을 표시하고 사용자의 상호작용에 반응하는 시간이 상당 부분 줄어든 것을 확인할 수 있습니다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop13-1024x576.png

하지만 이 방법으로도 버벅거림을 전혀 느낄 수 없는 사용자 경험에까지 이르진 못했습니다. 일반적으로 60FPS, 즉 프레임 하나 처리하는데 걸리는 시간이 16ms 이하여야 매끄럽게 느껴지는데요. 그 기준에는 다소 미치지 못한 것으로 보입니다. 아마 일부 연산은 워커 스레드에 위임했지만 DOM 갱신과 같은 작업은 여전히 메인 스레드에서 수행하고 있기 때문에 그런 것 같습니다. 메인 스레드와 워커 스레드는 메시지 기반으로만 통신 가능하다는 것이 웹 워커의 한계입니다. 즉, 워커는 직접 DOM이나 메인 스레드의 콘텍스트에 접근할 수 없습니다.

</aside>

# **스케줄링**

---

<aside>
☑️ 또 다른 방법으로는 고비용 태스크를 여러 개로 쪼개 비동기적으로 적절히 실행시키는 방법이 있습니다. 처리하는 데 오래 걸리는 태스크 때문에 뒤의 태스크들이 블록되고 있다면, 이를 적절하게 쪼개서 태스크들 사이사이에서 실행될 수 있도록 만드는 것입니다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop14-1024x576.png

기존 코드에서 입력(input) 이벤트가 트리거되었을 때 바로 작업을 수행하던 것과는 다르게, 위 코드에선 `runChunks`라는 인터페이스에 `chunkGenerator`를 넘겨주고 있습니다. `chunkgenerator`는 기존 반복문을 적절한 청크(chunk) 단위로 쪼개서 해당 단위마다 산출(yield)시키는 패턴을 가지고 있습니다. `runChunks`는 산출된 작업을 `setTimeout`과 같은 비동기 API를 통해 태스크 대기 열에 적재시키는 역할을 합니다.

위 방법을 적용하여 프로파일링 결과를 살펴보니, 역시나 상당 부분 개선된 것을 확인할 수 있습니다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop15-1024x576.png

하는 김에 좀 더 최적화를 해보자면, 데모는 텍스트 입력에 따라 DOM을 갱신하게 되는데요. 빠르게 타이핑하는 경우엔 입력에 따라 매번 DOM을 갱신하는 것이 아니라 마지막 순간에만 갱신해도 될 것 같습니다. 태스크가 큰 덩어리였다면 다음 태스크가 블록되므로 갱신할지 말지 판단하여 작업을 수행하는 게 불가능했을 텐데요. 태스크를 잘게 쪼개 놓은 덕분에 이러한 방법을 적용하는 게 가능합니다. 아래 코드와 같이 수행하는 태스크를 확인 후 진행 중이라면 해당 태스크를 취소하고 새로운 태스크를 수행하도록 합니다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop16-1024x576.png

그 결과 아래와 같이 프로파일링 그래프도 상당히 깔끔해졌습니다. 프레임 처리 최대 소요 시간도 마지막에 DOM을 갱신하는 순간에만 100ms 정도이고 나머지 프레임은 준수한 편입니다. 상호작용 반응 시간도 눈에 띄게 짧아졌습니다.

!https://engineering.linecorp.com/wp-content/uploads/2019/11/eventloop17-1024x576.png

</aside>

# 정리

<aside>
☑️ '만약 실행 시간이 긴 태스크 혹은 마이크로 태스크가 렌더링이나 클릭, 입력과 같은 이벤트를 블록한다면 사용자 경험을 해칠 수 있다. 이를 개선하기 위해 웹 워커와 같은 백그라운드 스레드에 처리하는 데 오래 걸리는 작업을 위임하거나, 작은 태스크로 쪼개서 적절하게 실행될 수 있도록 처리하여 중요한 UI 이벤트가 블록되지 않도록 조치해야 한다'

</aside>

## ☁️ 동기 & 비동기

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/9b0dc406-daab-44ec-8ad0-25dabda26377/Untitled.png)

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/3ac79723-d854-4bb9-812b-003e7d29d147/Untitled.png)

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/e0cf6807-0264-4a49-b1b8-bb0aaba5850a/Untitled.png)

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/32a53766-83d6-49af-9c76-7fb6035a4442/Untitled.png)

> JK님 스케치 예시
> 

### 🔹 동기적 처리 방식

- 싱글 스레드 작업 수행 방식하나의 작업이 너무 오래 걸리게 될 때, 그 오래 걸리는 하나의 작업이 종료되기 전까지 모든 작업이 올 스탑되기 때문에 전반적인 흐름이 느려짐
    
    !https://github.com/KimGaeun0806/Udemy-React-Note/raw/main/sources/%EB%8F%99%EA%B8%B0%EC%8B%B1%EA%B8%80%EC%8A%A4%EB%A0%88%EB%93%9C.png
    
    - Thread -> 연산과정을 수행. 코드를 한줄 한줄 실행시켜줌.
    - JS는 코드가 작성된 순서대로 작업을 처리함
    - 이전 작업이 진행 중일 때는 다음 작업을 수행하지 않고 기다림
    - 먼저 작성된 코드를 다 실행하고 나서 뒤에 작성된 코드를 실행
    - 블로킹 방식 -> 스레드에서 작업 하나가 수행되고 있을 때 다른 작업을 동시에 할 수 없는 방식
    
    !https://github.com/KimGaeun0806/Udemy-React-Note/raw/main/sources/%EB%8F%99%EA%B8%B0%EC%8B%B1%EA%B8%80%EC%8A%A4%EB%A0%88%EB%93%9C2.png
    
- 멀티 스레드 작업 수행 방식
    
    !https://github.com/KimGaeun0806/Udemy-React-Note/raw/main/sources/%EB%A9%80%ED%8B%B0%EC%8A%A4%EB%A0%88%EB%93%9C.png
    
    - Thread를 여러 개 사용하는 방식
    - 작업들을 각각의 스레드에 분할해서 실행시킴
    - 하지만 JS는 싱글 스레드 방식으로 동작하기 때문에 사용할 수 x

### 🔹 비동기적 처리 방식

!https://github.com/KimGaeun0806/Udemy-React-Note/raw/main/sources/%EB%B9%84%EB%8F%99%EA%B8%B0.png

- 스레드가 하나라도, 다른 작업이 끝나는 것을 신경쓰지 않고 작업 여러 개를 동시에 실행시킬 수 있음
- 먼저 작성된 코드의 결과를 기다리지 않고 다음 코드 바로 실행
- 싱글 스레드 방식을 이용하면서 동기적 작업의 단점을 극복하기 위해, 여러 개의 작업을 동시에 실행시킴
- 논 블로킹 방식 -> 하나의 작업이 스레드를 점유하지 않는 방식. 즉 하나의 작업을 수행할 때 스레드가 다른 작업을 하지 못하도록 하는 블로킹을 하지 않음.

!https://github.com/KimGaeun0806/Udemy-React-Note/raw/main/sources/%EB%B9%84%EB%8F%99%EA%B8%B0%EC%BD%9C%EB%B0%B1.png

- 작업이 정상적으로 끝났다는 것과 작업 결과를 확인하기 위해서
- 콜백 함수를 붙여서 전달

### 동기 비동기 개인적인 이해

비동기의 경우 return값이 없기 때문에 콜백내부에서 해결을 해야한다.

async await? → await한 부분의 결과가 나올때까지 기다려라

해시하는 곳은 파일의 내용을 해시하는 것이다.

### async / await

```jsx
async function showAvatar() {

  // JSON 읽기
  let response = await fetch('/article/promise-chaining/user.json');
  let user = await response.json();

  // github 사용자 정보 읽기
  let githubResponse = await fetch(`https://api.github.com/users/${user.name}`);
  let githubUser = await githubResponse.json();

  // 아바타 보여주기
  let img = document.createElement('img');
  img.src = githubUser.avatar_url;
  img.className = "promise-avatar-example";
  document.body.append(img);

  // 3초 대기
  await new Promise((resolve, reject) => setTimeout(resolve, 3000));

  img.remove();

  return githubUser;
}

showAvatar();
```

### Promise

```jsx
// user.json에 요청을 보냅니다.
fetch('/article/promise-chaining/user.json')
  // 응답받은 내용을 json으로 불러옵니다.
  .then(response => response.json())
  // GitHub에 요청을 보냅니다.
  .then(user => fetch(`https://api.github.com/users/${user.name}`))
  // 응답받은 내용을 json 형태로 불러옵니다.
  .then(response => response.json())
  // 3초간 아바타 이미지(githubUser.avatar_url)를 보여줍니다.
  .then(githubUser => {
    let img = document.createElement('img');
    img.src = githubUser.avatar_url;
    img.className = "promise-avatar-example";
    document.body.append(img);

    setTimeout(() => img.remove(), 3000); // (*)
  });
```

```jsx
// 재사용 하는 경우

function loadJson(url) {
  return fetch(url)
    .then(response => response.json());
}

function loadGithubUser(name) {
  return fetch(`https://api.github.com/users/${name}`)
    .then(response => response.json());
}

function showAvatar(githubUser) {
  return new Promise(function(resolve, reject) {
    let img = document.createElement('img');
    img.src = githubUser.avatar_url;
    img.className = "promise-avatar-example";
    document.body.append(img);

    setTimeout(() => {
      img.remove();
      resolve(githubUser);
    }, 3000);
  });
}

// 함수를 이용하여 다시 동일 작업 수행
loadJson('/article/promise-chaining/user.json')
  .then(user => loadGithubUser(user.name))
  .then(showAvatar)
  .then(githubUser => alert(`Finished showing ${githubUser.name}`));
  // ...
```

### 디버거 위치
