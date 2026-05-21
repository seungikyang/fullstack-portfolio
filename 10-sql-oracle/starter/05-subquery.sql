-- 서브쿼리 연습

-- TODO: 전체 평균 급여보다 더 많이 받는 직원을 조회하세요. 스칼라 서브쿼리를 쓰세요.
SELECT emp_name, salary
FROM   employees
WHERE  salary > (____);

-- TODO: 부서별 최고 급여자 한 명을 윈도우 함수로 뽑으세요.
SELECT emp_name, dept_id, salary
FROM (
  SELECT e.*,
         ____() OVER (PARTITION BY ____ ORDER BY salary DESC) AS rk
  FROM   employees e
)
WHERE rk = 1;
