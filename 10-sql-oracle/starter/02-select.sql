-- 단일 테이블 SELECT, WHERE, ORDER BY 연습

-- TODO: 전체 직원을 급여 내림차순으로 조회하세요.
SELECT emp_id, emp_name, salary
FROM   employees
ORDER BY ____ DESC;

-- TODO: 급여가 4000 이상인 직원만 조회하세요.
SELECT *
FROM   employees
WHERE  ____;

-- TODO: 2024년에 입사한 직원만 조회하세요. TO_CHAR 함수를 활용하세요.
SELECT *
FROM   employees
WHERE  TO_CHAR(____, 'YYYY') = '____';
