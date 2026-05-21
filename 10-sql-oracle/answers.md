# 10단계 SQL 정답 예시

정답을 먼저 보지 마세요. 직접 작성해보고 막혔을 때만 비교합니다.

## 1번 정답 예시

```sql
CREATE TABLE departments (
  dept_id   NUMBER PRIMARY KEY,
  dept_name VARCHAR2(50) NOT NULL
);

CREATE TABLE employees (
  emp_id    NUMBER PRIMARY KEY,
  emp_name  VARCHAR2(50) NOT NULL,
  dept_id   NUMBER,
  salary    NUMBER(10, 2),
  hire_date DATE DEFAULT SYSDATE,
  CONSTRAINT fk_emp_dept FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

INSERT INTO departments VALUES (10, '개발팀');
INSERT INTO departments VALUES (20, '영업팀');
INSERT INTO departments VALUES (30, '인사팀');

INSERT INTO employees VALUES (1, '김개발', 10, 5000, DATE '2024-03-01');
INSERT INTO employees VALUES (2, '이영업', 20, 4200, DATE '2023-08-15');
INSERT INTO employees VALUES (3, '박인사', 30, 3800, DATE '2024-06-01');
INSERT INTO employees VALUES (4, '최코드', 10, 4500, DATE '2024-01-10');
INSERT INTO employees VALUES (5, '정신입', 10, 3200, DATE '2025-02-01');
INSERT INTO employees VALUES (6, '한무소속', NULL, 3000, DATE '2024-11-20');

COMMIT;
```

설명. `FOREIGN KEY`로 부서가 없는 dept_id 입력을 막습니다. 6번 직원은 dept_id가 NULL이라 LEFT JOIN 실험에 활용합니다.

## 2번 정답 예시

```sql
-- 전체 직원, 급여 내림차순
SELECT emp_id, emp_name, salary
FROM   employees
ORDER BY salary DESC;

-- 급여 4000 이상
SELECT *
FROM   employees
WHERE  salary >= 4000;

-- 2024년 입사자
SELECT *
FROM   employees
WHERE  TO_CHAR(hire_date, 'YYYY') = '2024';
```

## 3번 정답 예시

```sql
SELECT dept_id, COUNT(*) AS cnt
FROM   employees
GROUP BY dept_id;

SELECT dept_id, ROUND(AVG(salary), -2) AS avg_salary
FROM   employees
GROUP BY dept_id;

SELECT dept_id, AVG(salary) AS avg_salary
FROM   employees
GROUP BY dept_id
HAVING AVG(salary) >= 4000;
```

설명. `WHERE`는 행 필터, `HAVING`은 그룹 필터입니다. `HAVING`을 `WHERE`로 바꾸면 오류가 납니다.

## 4번 정답 예시

```sql
-- INNER JOIN
SELECT e.emp_name, d.dept_name
FROM   employees e
INNER JOIN departments d ON e.dept_id = d.dept_id;

-- LEFT JOIN
SELECT e.emp_name, d.dept_name
FROM   employees e
LEFT JOIN departments d ON e.dept_id = d.dept_id;
```

설명. INNER JOIN 결과는 5행, LEFT JOIN 결과는 6행입니다. 6번 직원(한무소속)은 INNER에서 빠지고 LEFT에서는 `dept_name`이 NULL로 나옵니다.

## 5번 정답 예시

```sql
-- 평균보다 더 받는 직원
SELECT emp_name, salary
FROM   employees
WHERE  salary > (SELECT AVG(salary) FROM employees);

-- 부서별 최고 급여자 (윈도우 함수)
SELECT emp_name, dept_id, salary
FROM   (
  SELECT e.*, RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rk
  FROM   employees e
)
WHERE  rk = 1;
```

## 6번 정답 예시

```sql
-- 세션 A
UPDATE employees SET salary = salary - 1000 WHERE emp_id = 1;
UPDATE employees SET salary = salary + 1000 WHERE emp_id = 2;
-- 두 UPDATE 모두 성공한 뒤에만 COMMIT
COMMIT;

-- 실험. 첫 UPDATE만 한 뒤 ROLLBACK 하면 둘 다 원래대로 돌아갑니다.
UPDATE employees SET salary = salary - 1000 WHERE emp_id = 1;
ROLLBACK;
```

설명. 송금은 둘 다 성공하거나 둘 다 실패해야 합니다. 트랜잭션이 없으면 한쪽만 빠져 데이터가 깨집니다(원자성).

## 7번 정답 예시

```sql
-- 실행 계획 확인
EXPLAIN PLAN FOR
SELECT * FROM employees WHERE emp_name = '김개발';
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
-- 인덱스 없으면 TABLE FULL SCAN.

CREATE INDEX idx_emp_name ON employees(emp_name);

EXPLAIN PLAN FOR
SELECT * FROM employees WHERE emp_name = '김개발';
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
-- 인덱스가 잡히면 INDEX RANGE SCAN.
```

설명. 인덱스는 검색 성능을 올리지만 INSERT/UPDATE/DELETE 비용을 늘립니다. 자주 검색하는 컬럼에만 만들어야 합니다.

## 자주 막히는 부분

- `ORA-00904: invalid identifier`. 컬럼 이름 오타 또는 작은따옴표 대신 큰따옴표를 쓴 경우.
- `ORA-00942: table or view does not exist`. 권한 부족, 스키마 prefix 누락, 또는 테이블이 아직 안 만들어진 경우.
- `ORA-01400: cannot insert NULL into ...`. NOT NULL 컬럼에 NULL을 넣으려고 한 경우.
- `ORA-02292: integrity constraint violated - child record found`. 외래 키가 걸린 부모를 삭제할 때.

## 자격증 연계

- SQLD. 1과목 데이터 모델링, 2과목 SQL 기본/활용. 이 단계의 4~5번 문제와 거의 동일한 범위입니다.
- 정보처리기사 실기. 데이터베이스 SQL 단답형이 매년 나옵니다.
