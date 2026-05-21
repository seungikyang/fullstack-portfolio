-- 집계 함수와 GROUP BY / HAVING 연습

-- TODO: 부서별 직원 수를 조회하세요.
SELECT dept_id, ____(*) AS cnt
FROM   employees
GROUP BY ____;

-- TODO: 부서별 평균 급여를 100원 단위로 반올림해 조회하세요. ROUND의 두 번째 인자에 -2를 주세요.
SELECT dept_id, ROUND(____(salary), ____) AS avg_salary
FROM   employees
GROUP BY ____;

-- TODO: 평균 급여가 4000 이상인 부서만 조회하세요. HAVING을 쓰세요.
SELECT dept_id, AVG(salary) AS avg_salary
FROM   employees
GROUP BY dept_id
____ AVG(salary) >= 4000;
