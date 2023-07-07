function solution(n, lost, reserve) {
    var answer = n - lost.length;
    
		// 잃어버린 사람이 여벌의 체육복이 있을 경우 
		// 본인이 사용해야 하기 때문에 아예 제외 시킨다.
    let realLost = lost.filter((r)=>!reserve.includes(r));
    let realReserve = reserve.filter((r)=>!lost.includes(r));
    answer += lost.length - realLost.length;
    
		// [4, 2]와 같은 경우 정렬해줘야 함
    realLost.sort((a,b)=>a-b);
    
    realLost.forEach((l)=>{
        if(realLost.length === 0) {
            return;
        }
        
        if(realReserve.includes(l-1)) {
            realReserve = realReserve.filter((r)=>r!==l-1);
            answer++;
        } else if(realReserve.includes(l+1)) {
            realReserve = realReserve.filter((r)=>r!==l+1);
            answer++;
        }
    })
    
    
    return answer;
}

// reduce로 푸는 경우
// function solution(n, lost, reserve) {
//   var answer = n - lost.length;

//   let realLost = lost.filter((r) => !reserve.includes(r));
//   let realReserve = reserve.filter((r) => !lost.includes(r));
//   answer += lost.length - realLost.length;

//   realLost.sort((a, b) => a - b);

//   answer += realLost.reduce((acc, l) => {
//     if (realReserve.includes(l - 1)) {
//       realReserve = realReserve.filter((r) => r !== l - 1);
//       return acc + 1;
//     } else if (realReserve.includes(l + 1)) {
//       realReserve = realReserve.filter((r) => r !== l + 1);
//       return acc + 1;
//     } else {
//       return acc;
//     }
//   }, 0);

//   return answer;
// }
