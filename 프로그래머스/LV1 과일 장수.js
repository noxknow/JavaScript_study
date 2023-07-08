function solution(k, m, score) {
    score.sort((a,b) => b-a);
    
    let answer = []
    for (let i = 0; i < Math.floor(score.length / m) * m; i += m) {
        let res = score.slice(i, i+m)
        answer.push(Math.min(...res) * m)
    };
    
    return answer.reduce((acc, val) => {
        return acc + val
    }, 0);
}
