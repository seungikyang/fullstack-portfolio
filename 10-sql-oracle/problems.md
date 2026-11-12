# 10단계 SQL 문제 모음

[단계 설명](./README.md) · 학습 흐름. [문제](./problems.md) → [단계별 힌트](./hints.md) → [정답 비교](./answers.md) → [완료 체크](../student-checklist.md)

## 실습 파일 바로 열기

SQL 파일을 번호 순서대로 열어 빈칸을 채우고 Oracle에서 실행하세요.

- [1번 DDL 코드 보기](./starter/01-ddl.sql?view=source)
- [2번 SELECT 코드 보기](./starter/02-select.sql?view=source)
- [3번 집계 코드 보기](./starter/03-aggregate.sql?view=source)
- [4번 JOIN 코드 보기](./starter/04-join.sql?view=source)
- [5번 서브쿼리 코드 보기](./starter/05-subquery.sql?view=source)
- [6번 트랜잭션 코드 보기](./starter/06-transaction.sql?view=source)
- [7번 인덱스 코드 보기](./starter/07-index.sql?view=source)

`starter/` 폴더의 빈칸을 채워가며 차례대로 실행하세요. 막히면 먼저 `hints.md`의 1~3단계를 순서대로 보고, 마지막에만 `answers.md`와 비교합니다.

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
- `LEFT JOIN`. 부서가 NULL인 직원도 포함해 부서명과 함께 조회. 미일치 행의 의미는 아래 L01에서 고릅니다.
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
- 아래 4지선다 L02에서 실행 계획 비교의 적절한 기준을 고르세요.

## 자가 점검 — 4지선다

보기 하나를 고르고 접힌 정답·해설을 확인하세요. 실제 실습 완료 여부는 실행 기록과 완료 체크에서 확인합니다.

### PS10-01. SQL 쿼리의 결과를 검증하는 적절한 방법은?

SQL 쿼리의 결과를 검증하는 적절한 방법은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. SQL 문장이 파싱되면 반환 값도 무조건 요구사항과 같다.
2. 결과를 열어 보지 않고 실행 버튼을 눌렀다는 사실만 기록한다.
3. 모든 SELECT는 데이터와 관계없이 항상 같은 행을 반환한다.
4. 준비한 데이터의 기대 행·값·정렬을 실제 결과와 대조한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

문법 성공과 업무 결과의 정확성은 다릅니다. 조건·집계·정렬이 요구한 결과와 일치하는지 준비 데이터로 확인합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W428)

### PS10-02. LEFT JOIN의 미일치 행을 설명한 것은?

LEFT JOIN의 미일치 행을 설명한 것은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. 왼쪽 행은 유지되고 일치하는 오른쪽 값이 없으면 오른쪽 컬럼은 NULL로 나타난다.
2. 미일치 왼쪽 행은 INNER JOIN처럼 언제나 제거된다.
3. 오른쪽 모든 컬럼에 자동으로 0이 들어간다.
4. 오른쪽에서 같은 키가 여러 번 일치해도 결과는 반드시 한 행이다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

LEFT JOIN 자체는 미일치 왼쪽 행을 유지합니다. 추가 WHERE가 이를 제외할 수 있고, 일대다 매칭은 여러 결과 행을 만들 수 있습니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W429)

### PS10-03. Oracle의 일반적인 READ COMMITTED 두 세션 실험에서 미확정 변경을 확인할 때 알맞은 것은?

Oracle의 일반적인 READ COMMITTED 두 세션 실험에서 미확정 변경을 확인할 때 알맞은 것은? — 알맞은 설명 또는 답변 방식을 고르세요.

1. 다른 세션도 언제나 같은 미확정 값을 읽는다.
2. 변경 세션은 자신의 변경을 보고 다른 세션은 COMMIT 전 해당 미확정 변경을 읽지 않는다.
3. SELECT를 실행하면 모든 다른 세션의 변경이 자동 COMMIT된다.
4. ROLLBACK을 하면 이미 확정된 모든 과거 트랜잭션도 삭제된다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

조건은 READ COMMITTED에서 두 세션을 구분한 실험입니다. COMMIT 후 새 조회의 결과와 ROLLBACK 후 상태도 비교해 관찰합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W430)

<!-- written-choice:start -->
## 설명·개념 확인 — 4지선다

SQL 관찰 설명 문제 · [웹에서 채점하기](../quiz/index.html?bank=written&category=sql)

보기 네 개 중 하나를 선택하고 접힌 정답·해설을 확인하세요.

### L01. JOIN 행 수의 해석

JOIN 행 수의 해석 — 알맞은 설명 또는 답변 방식을 고르세요.

1. LEFT JOIN은 항상 INNER JOIN보다 정확히 한 행 많다.
2. 미일치 행의 유지 여부와 일대다 매칭 개수에 따라 결과가 달라진다.
3. JOIN은 항상 왼쪽 행 수와 같다.
4. JOIN의 결과 수는 데이터와 조건에 영향을 받지 않는다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

일치 관계와 미일치 행을 함께 확인합니다. 일대다 결합은 왼쪽 한 행을 여러 결과 행으로 만들 수 있습니다.

</details>

### L02. 인덱스 전후 실행 계획

인덱스 전후 실행 계획 — 알맞은 설명 또는 답변 방식을 고르세요.

1. 인덱스를 만들면 모든 쿼리가 O(1)임을 선언한다.
2. 실행 계획 없이 반드시 빨라졌다고 기록한다.
3. 같은 쿼리의 접근 경로·비용·측정을 비교하고 인덱스가 항상 선택되는 것은 아님을 확인한다.
4. 인덱스가 있으면 데이터 검증을 생략한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

실행 계획과 실제 측정을 구분합니다. 선택도와 데이터 규모에 따라 전체 스캔이 선택될 수도 있습니다.

</details>
<!-- written-choice:end -->
