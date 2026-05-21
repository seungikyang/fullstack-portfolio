-- JOIN 연습. INNER와 LEFT의 결과 차이를 직접 확인하세요.

-- TODO: INNER JOIN으로 직원과 부서명을 함께 조회하세요.
SELECT e.emp_name, d.dept_name
FROM   employees e
____ JOIN departments d ON e.____ = d.____;

-- TODO: LEFT JOIN으로 부서가 없는 직원도 포함해 조회하세요.
SELECT e.emp_name, d.dept_name
FROM   employees e
____ JOIN departments d ON e.____ = d.____;

-- 결과 행 수 차이를 한 줄로 적어보세요.
-- 차이.
