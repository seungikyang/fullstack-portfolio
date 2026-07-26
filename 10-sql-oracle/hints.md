# 10단계 단계별 힌트

[단계 설명](./README.md) · [문제로 돌아가기](./problems.md) · [완료 체크](../student-checklist.md)

한 번에 모두 읽지 말고, 막힌 문제의 1단계부터 차례로 확인하세요.

## 1번. 테이블 생성과 데이터 입력

### 1단계. 개념 환기

- 기본 키는 행을 식별하고, 외래 키는 다른 테이블의 키와 관계를 제한합니다.
- `NOT NULL`은 값 생략을 막고, 컬럼 타입은 저장 가능한 값의 형태를 정합니다.

### 2단계. 접근 방향

- 참조받는 부서 테이블을 먼저 만들고 직원 테이블을 나중에 만드세요.
- 각 기본 키와 필수 이름 컬럼을 먼저 채운 뒤 외래 키 제약을 연결하세요.
- 부서 데이터를 먼저 INSERT한 다음 직원 데이터를 넣으세요.

### 3단계. SQL 문법 수준

```sql
CREATE TABLE child_table (
  id       NUMBER PRIMARY KEY,
  parent_id NUMBER,
  CONSTRAINT constraint_name
    FOREIGN KEY (parent_id) REFERENCES parent_table(id)
);

INSERT INTO table_name (column_a, column_b) VALUES (value_a, value_b);
```

## 2번. 단일 테이블 조회

### 1단계. 개념 환기

- `WHERE`는 행을 거르고 `ORDER BY`는 결과 순서를 정합니다.
- 날짜를 연도 문자열로 비교할 때 Oracle의 변환 함수를 사용할 수 있습니다.

### 2단계. 접근 방향

- 각 요구사항을 하나의 SELECT로 분리해 작성하세요.
- 급여 정렬에는 급여 컬럼과 내림차순 키워드를 연결하세요.
- 입사 연도 조건은 날짜 컬럼을 4자리 연도 문자열로 바꾼 뒤 비교하세요.

### 3단계. SQL 절 수준

```sql
SELECT columns
FROM employees
WHERE /* 급여 또는 연도 조건 */
ORDER BY /* 정렬 컬럼 */ DESC;

TO_CHAR(/* 날짜 컬럼 */, 'YYYY')
```

## 3번. 집계와 GROUP BY

### 1단계. 개념 환기

- 집계 함수는 여러 행을 하나의 값으로 요약합니다.
- 집계 전 행 조건은 `WHERE`, 집계 후 그룹 조건은 `HAVING`에 둡니다.
- SELECT의 일반 컬럼은 GROUP BY에도 포함해야 합니다.

### 2단계. 접근 방향

- 부서 id를 그룹 기준으로 고정하고 필요한 집계 함수만 바꾸세요.
- 평균 급여를 먼저 구한 뒤 반올림 함수로 감싸세요.
- 평균 조건은 그룹 생성 후 검사되도록 배치하세요.

### 3단계. SQL 함수 수준

```sql
SELECT group_column, COUNT(*) AS count_alias
FROM table_name
GROUP BY group_column;

SELECT group_column, ROUND(AVG(number_column), /* 자릿수 */)
FROM table_name
GROUP BY group_column
HAVING AVG(number_column) >= /* 기준값 */;
```

## 4번. JOIN

### 1단계. 개념 환기

- INNER JOIN은 양쪽에 연결 행이 있는 결과만 남깁니다.
- LEFT JOIN은 왼쪽 테이블 행을 모두 남기고 연결이 없으면 오른쪽 컬럼을 NULL로 표시합니다.

### 2단계. 접근 방향

- 직원 테이블을 왼쪽에 두고 부서 id끼리 연결하세요.
- 두 쿼리는 JOIN 종류만 바꾸고 SELECT와 ON 조건은 같게 유지하세요.
- 부서가 없는 직원 한 명이 어느 결과에 포함되는지 확인하세요.

### 3단계. JOIN 시그니처 수준

```sql
SELECT e.employee_column, d.department_column
FROM employees e
/* INNER 또는 LEFT */ JOIN departments d
  ON e.department_key = d.department_key;
```

## 5번. 서브쿼리

### 1단계. 개념 환기

- 스칼라 서브쿼리는 한 값을 반환해 바깥 쿼리의 비교 기준이 됩니다.
- 윈도우 함수는 행을 없애지 않고 그룹별 순위를 붙일 수 있습니다.

### 2단계. 접근 방향

- 전체 평균 급여 SELECT를 괄호 안에 넣고 바깥 급여와 비교하세요.
- 부서별로 나눈 뒤 급여 내림차순 순위를 매기세요.
- 순위가 가장 앞선 행만 바깥 쿼리에서 남기세요.

### 3단계. SQL 함수 수준

```sql
WHERE salary > (SELECT /* 전체 평균 */ FROM employees)

ROW_NUMBER() OVER (
  PARTITION BY /* 부서 */
  ORDER BY salary DESC
) AS rank_alias
```

## 6번. 트랜잭션

### 1단계. 개념 환기

- 트랜잭션은 여러 변경을 하나의 작업 단위로 묶습니다.
- `ROLLBACK`은 미확정 변경을 되돌리고 `COMMIT`은 변경을 확정합니다.

### 2단계. 접근 방향

- 송금 전 두 계좌의 값을 기록하세요.
- 차감과 증가 UPDATE 사이 또는 직후에 조회하고 ROLLBACK 결과를 비교하세요.
- 별도 세션을 열어 COMMIT 전후의 가시성을 확인하세요.

### 3단계. SQL 명령 수준

```sql
UPDATE accounts SET balance = /* 계산 */ WHERE id = /* 계좌 */;
ROLLBACK;

UPDATE accounts SET balance = /* 계산 */ WHERE id = /* 계좌 */;
COMMIT;
```

두 UPDATE의 실제 계산식과 금액은 문제 시나리오에 맞게 직접 작성하세요.

## 7번. 인덱스

### 1단계. 개념 환기

- 인덱스는 검색용 자료구조를 추가해 조회 경로를 바꿀 수 있습니다.
- 읽기 성능의 이점 대신 저장 공간과 쓰기 비용이 늘어납니다.

### 2단계. 접근 방향

- 같은 데이터와 같은 WHERE 조건으로 인덱스 생성 전후를 비교하세요.
- 실행 계획에서 전체 스캔과 인덱스 접근 관련 단어를 찾으세요.
- 단순 실행 시간 한 번보다 실행 계획의 접근 방식 차이를 기록하세요.

### 3단계. SQL 명령 수준

```sql
EXPLAIN PLAN FOR
SELECT * FROM table_name WHERE search_column = /* 값 */;

CREATE INDEX index_name ON table_name(search_column);

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
```

3단계까지 확인한 뒤에도 막히면 마지막으로 [정답 예시와 비교하세요](./answers.md).
