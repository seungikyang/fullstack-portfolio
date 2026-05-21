# 10단계 SQL 문제 모음

`starter/` 폴더의 빈칸을 채워가며 차례대로 실행하세요. 막히면 `answers.md`와 비교합니다.

각 문제는 Oracle 문법 기준입니다. MySQL로 푸는 경우 README의 차이표를 참고해 변환하세요.

## 1번. 테이블 생성과 데이터 입력

`starter/01-ddl.sql`을 채워 `DEPARTMENTS`, `EMPLOYEES` 두 테이블을 만듭니다.

- `DEPARTMENTS`. `dept_id`(PK), `dept_name`(NOT NULL).
- `EMPLOYEES`. `emp_id`(PK), `emp_name`(NOT NULL), `dept_id`(FK), `salary`(NUMBER), `hire_date`(DATE).
- 부서 3개와 직원 6명을 INSERT 하세요.

검증. `SELECT COUNT(*) FROM employees;` 가 6을 반환해야 합니다.

## 2번. 단일 테이블 조회

`starter/02-select.sql`의 빈칸을 채우세요.

- 모든 직원을 급여 내림차순으로 정렬해 조회.
- 급여가 4000 이상인 직원만 조회.
- 입사 연도가 2024인 직원만 조회. (`TO_CHAR(hire_date, 'YYYY')` 사용)

## 3번. 집계와 GROUP BY

`starter/03-aggregate.sql`을 완성하세요.

- 부서별 직원 수.
- 부서별 평균 급여를 100원 단위로 반올림.
- 평균 급여가 4000 이상인 부서만 (`HAVING`).

## 4번. JOIN

`starter/04-join.sql`을 완성하세요.

- `INNER JOIN`. 부서가 지정된 직원만 부서명과 함께 조회.
- `LEFT JOIN`. 부서가 NULL인 직원도 포함해 부서명과 함께 조회. 부서가 없는 행은 어떻게 나오는가?
- 결과 행 수가 두 쿼리에서 어떻게 다른지 비교하세요.

## 5번. 서브쿼리

`starter/05-subquery.sql`을 완성하세요.

- 전체 평균 급여보다 더 많이 받는 직원 조회 (스칼라 서브쿼리).
- 부서별 최고 급여자 한 명씩 조회 (상관 서브쿼리 또는 윈도우 함수).

## 6번. 트랜잭션

`starter/06-transaction.sql`을 직접 실행하세요.

- 송금 시나리오를 두 UPDATE로 작성합니다.
- 한 UPDATE 직후 ROLLBACK 하면 어떻게 되는지 확인하세요.
- 두 UPDATE 후 COMMIT 하면 다른 세션에서 어떻게 보이는지 확인하세요.

## 7번. 인덱스

`starter/07-index.sql`을 실행하세요.

- 10만 건을 INSERT 한 뒤 `WHERE emp_name = '...'` 쿼리의 실행 계획을 확인.
- `emp_name` 컬럼에 인덱스를 만든 뒤 다시 실행 계획을 확인.
- 두 결과의 차이를 한 줄로 기록하세요.

## 자가 점검

- 각 쿼리의 결과를 직접 눈으로 확인했나요?
- JOIN 결과 행 수가 왜 달라지는지 한 문장으로 말할 수 있나요?
- COMMIT을 하지 않은 변경이 다른 세션에서 보이지 않는다는 것을 확인했나요?
