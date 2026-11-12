# 10단계 SQL과 RDBMS (Oracle 중심)

[HTML 목차](../index.html) · 학습 흐름. [문제 풀기](./problems.md) → [단계별 힌트](./hints.md) → [정답 비교](./answers.md) → [완료 체크](../student-checklist.md)

## 목표

관계형 데이터베이스의 핵심 SQL을 손에 익힙니다. Oracle, MySQL, PostgreSQL 같은 RDBMS를 요구하는 웹 백엔드 공고가 많으므로, 5단계 MongoDB와 다른 JOIN·트랜잭션 흐름을 함께 학습합니다.

Oracle SQL 표기를 기본으로 하되, MySQL과 다른 부분은 표로 정리해 비교합니다.

## 기술을 쓰는 이유와 동작 흐름

처음 보는 용어는 [전체 기술 안내서](../technology-guide.md)와 함께 읽으세요. 아래 흐름은 실습을 이해하기 위한 안내이며, 빈칸과 완료 체크는 직접 진행합니다.

| 기술 | 무엇이고, 왜 필요한가요? | 이 실습에서는 어떻게 쓰나요? |
| --- | --- | --- |
| RDBMS·SQL | RDBMS는 행·열로 된 표와 표 사이의 관계를 관리하는 DB이고, SQL은 이 DB에 작업을 요청하는 언어입니다. 직원과 부서를 중복 없이 연결하기 위해 씁니다. | [테이블 생성 실습](./starter/01-ddl.sql)에서 데이터 구조와 기본 데이터를 준비합니다. 이 트랙은 Oracle 표기를 기준으로 합니다. |
| 키·JOIN | 키는 행을 식별하거나 다른 표의 행과 연결하는 값이고, JOIN은 관계를 기준으로 표들을 함께 조회하는 방법입니다. 직원 정보에 부서명을 결합할 수 있습니다. | [JOIN 실습](./starter/04-join.sql)에서 부서가 없는 직원의 처리까지 비교합니다. |
| 트랜잭션 | DB 작업을 한 묶음으로 처리하는 단위입니다. 중간 상태만 남는 일을 막고 변경을 확정하거나 취소할 수 있게 합니다. | [트랜잭션 실습](./starter/06-transaction.sql)에서 두 직원의 급여 변경과 확정·취소를 관찰합니다. |
| 인덱스 | 원하는 데이터를 찾기 위한 별도 탐색 구조입니다. 매번 전체 행을 읽는 부담을 줄일 수 있지만 저장 공간과 갱신 비용이 듭니다. | [인덱스 실습](./starter/07-index.sql)에서 실행 계획(자료를 찾는 경로)을 비교합니다. |

**직원과 부서 조회의 처리 순서:** SQL 클라이언트에서 쿼리 전송 → DB가 문법과 대상을 확인 → 조회 경로를 정해 실행 → 결과 행 반환. 브라우저나 JavaScript가 두 표를 직접 합치는 것이 아니라 DB가 SQL을 처리합니다.

**직접 관찰하기:** 같은 직원 데이터에서 JOIN 종류에 따라 결과 행이 어떻게 달라지는지 비교하세요. 인덱스가 생겼다는 이유만으로 빨라졌다고 단정하지 말고 실행 계획도 확인합니다. 다음 Spring 단계의 JPA 역시 실제 저장을 위해 DB와 SQL을 사용합니다.

## 실행 방법

세 가지 환경 중 하나를 선택합니다.

[SQL 문제 순서](./problems.md)에 맞춰 `starter/01-ddl.sql`부터 `starter/07-index.sql`까지 차례대로 실행합니다.

1. **Oracle XE(Express Edition)** 로컬 설치. 학습용 무료 버전입니다.
2. **Oracle Live SQL** (https://livesql.oracle.com). 설치 없이 브라우저에서 바로 실행합니다.
3. **DBeaver** + 위 둘 중 하나 연결. 학습용 SQL 클라이언트.

```sql
-- Oracle Live SQL에 접속 후 starter/01-ddl.sql 내용을 순서대로 붙여넣어 실행합니다.
```

설치가 어려우면 Live SQL을 먼저 쓰세요. 면접에서 "환경 구축에 너무 시간을 빼앗기지 않고 SQL을 빨리 손에 익혔다"고 말할 수 있는 편이 낫습니다.

## 완료 기준

- `EMPLOYEES`, `DEPARTMENTS` 두 테이블을 생성하고 샘플 데이터를 INSERT 했습니다.
- 단일 테이블 SELECT, WHERE, ORDER BY, GROUP BY, HAVING을 모두 실행했습니다.
- INNER JOIN과 LEFT JOIN의 차이를 SELECT 결과 행 수로 설명할 수 있습니다.
- 서브쿼리(스칼라, 인라인 뷰)를 한 번 이상 작성했습니다.
- 트랜잭션의 COMMIT, ROLLBACK을 직접 실험했습니다.
- 인덱스 적용 전후 실행 계획을 비교하고 조회 방식이 달라진 이유를 설명할 수 있습니다.

완료로 표시하기 전 [학습 근거 4종](../student-checklist.md#단계마다-남길-4종-근거)에 실행한 SQL, 결과 행, 해결한 SQL 오류, 쿼리가 있는 파일 위치를 기록합니다.

## 취업 연결

SI/SW 실무에서 SQL은 다음과 같은 가치를 가집니다.

- 대부분의 SI 프로젝트가 RDBMS에 핵심 데이터를 저장합니다.
- 많은 웹 백엔드 공고에서 JOIN과 집계 쿼리를 읽고 수정하는 능력을 확인합니다.
- 정보처리기사, SQLD 자격증의 SQL 영역과 직결됩니다.

이 단계가 끝나면 "Oracle 환경에서 EMP/DEPT 스타일 테이블을 설계해 JOIN과 GROUP BY로 부서별 집계 쿼리를 작성했다"고 설명할 수 있어야 합니다.

## 핵심 개념

- DDL(`CREATE`, `ALTER`, `DROP`)과 DML(`SELECT`, `INSERT`, `UPDATE`, `DELETE`).
- 기본 키와 외래 키, NOT NULL, UNIQUE 제약.
- JOIN의 종류. INNER, LEFT, RIGHT, FULL OUTER.
- 집계 함수와 GROUP BY, HAVING.
- 서브쿼리. 스칼라, 인라인 뷰, 상관 서브쿼리.
- 트랜잭션. ACID, COMMIT, ROLLBACK, SAVEPOINT.
- 인덱스의 개념. 왜 검색이 빨라지고 왜 INSERT가 느려지는가.
- Oracle vs MySQL 차이. 시퀀스, ROWNUM 대 LIMIT, DUAL 테이블.

## Oracle vs MySQL 주요 차이

| 기능         | Oracle                                          | MySQL                  |
| ------------ | ----------------------------------------------- | ---------------------- |
| 자동 증가 키 | SEQUENCE + TRIGGER 또는 IDENTITY                | AUTO_INCREMENT         |
| 페이지네이션 | `ROWNUM` 또는 12c부터 `FETCH FIRST N ROWS ONLY` | `LIMIT N OFFSET M`     |
| 더미 테이블  | `DUAL`                                          | 없음 (`SELECT 1`)      |
| 문자열 연결  | `\|\|`                                          | `CONCAT()`             |
| 날짜 함수    | `SYSDATE`, `TO_DATE`                            | `NOW()`, `STR_TO_DATE` |

## 면접 연습

<!-- written-choice:start -->
4지선다 문제입니다. 보기 하나를 고르고 접힌 정답·해설을 확인하세요.

### R10-01. 기본 키와 유니크 제약의 차이는 무엇인가요?

기본 키와 유니크 제약의 차이는 무엇인가요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 기본 키는 같은 테이블에 여러 독립 기본 키를 둘 수 있다.
2. 기본 키는 모든 DB에서 NULL을 허용한다.
3. 유니크 제약은 모든 DB에서 NULL을 똑같이 처리한다.
4. 기본 키는 한 행의 대표 식별자이며 NULL을 허용하지 않고, 유니크 제약은 중복을 제한한다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

테이블의 기본 키는 하나이며 여러 컬럼을 묶은 복합 키일 수 있습니다. 유니크 제약의 NULL 처리 세부 사항은 DB 구현을 확인합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W208)

### R10-02. INNER JOIN과 LEFT JOIN의 결과 행 수가 어떻게 달라지나요?

INNER JOIN과 LEFT JOIN의 결과 행 수가 어떻게 달라지나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. LEFT JOIN은 오른쪽에 일치가 없어도 왼쪽 행을 유지하며 오른쪽 값은 NULL이 될 수 있다.
2. INNER JOIN은 무조건 왼쪽의 모든 행을 유지한다.
3. LEFT JOIN은 일치하지 않는 왼쪽 행을 모두 제거한다.
4. 두 JOIN은 어떤 데이터에도 반드시 같은 결과를 낸다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

결합 조건과 일치하지 않는 행의 유지 여부를 비교합니다. WHERE 조건은 결과에 추가 영향을 줍니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W209)

### R10-03. GROUP BY 절에 없는 컬럼을 SELECT 절에 쓰면 왜 오류가 나나요?

GROUP BY 절에 없는 컬럼을 SELECT 절에 쓰면 왜 오류가 나나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 어떤 비집계 컬럼도 모든 DB에서 자유롭게 SELECT할 수 있다.
2. 집계하지 않는 SELECT 표현식은 해당 DB의 그룹화 규칙을 만족해야 한다.
3. GROUP BY는 모든 행을 항상 삭제한다.
4. GROUP BY가 있으면 SUM이나 COUNT를 사용할 수 없다.

<details>
<summary>정답·해설 확인</summary>

**정답: 2번**

그룹당 어떤 값을 선택할지 명확해야 합니다. SQL 방언과 함수 종속 허용 규칙의 차이도 확인합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W210)

### R10-04. 트랜잭션이 필요한 이유를 송금 예시로 설명해보세요.

트랜잭션이 필요한 이유를 송금 예시로 설명해보세요.

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 쿼리를 작성하지 않아도 DB가 모든 업무를 자동 수행한다.
2. 트랜잭션은 HTTP 응답 색상을 바꾸는 기능이다.
3. 여러 데이터 변경을 한 단위로 확정하거나 취소한다.
4. 트랜잭션 안의 첫 UPDATE는 실패해도 절대로 되돌릴 수 없다.

<details>
<summary>정답·해설 확인</summary>

**정답: 3번**

송금처럼 함께 성공해야 하는 변경에 사용합니다. COMMIT과 ROLLBACK 결과를 관찰합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W211)

### R10-05. 인덱스를 무작정 늘리면 안 되는 이유는 무엇인가요?

인덱스를 무작정 늘리면 안 되는 이유는 무엇인가요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 인덱스가 많을수록 모든 쓰기가 반드시 빨라진다.
2. 인덱스는 테이블 크기와 무관하게 공간을 전혀 쓰지 않는다.
3. 인덱스만 만들면 모든 쿼리가 반드시 같은 실행 계획을 쓴다.
4. 조회에 도움을 줄 수 있지만 공간과 쓰기 유지 비용이 든다.

<details>
<summary>정답·해설 확인</summary>

**정답: 4번**

조건과 선택도에 따라 실행 계획이 다릅니다. 읽기 이점과 쓰기 비용을 함께 확인합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W212)

### R10-06. NoSQL(MongoDB)과 RDBMS(Oracle) 중 언제 무엇을 선택하나요?

NoSQL(MongoDB)과 RDBMS(Oracle) 중 언제 무엇을 선택하나요?

보기 중 알맞은 설명 또는 답변 방식 하나를 고르세요.

1. 데이터 모양·조회 패턴·트랜잭션·확장 요구를 비교해 선택한다.
2. NoSQL은 어떤 제품도 트랜잭션을 지원하지 않는다.
3. MongoDB를 쓰면 데이터 검증이 전혀 필요 없다.
4. RDBMS는 규모가 커지면 사용할 수 없다.

<details>
<summary>정답·해설 확인</summary>

**정답: 1번**

NoSQL은 하나의 공통 기능 목록이 아닙니다. 제품별 보장과 요구 사항을 비교해야 하며 MongoDB도 트랜잭션을 지원합니다.

</details>

[웹에서 이 문제 채점하기](../quiz/index.html?bank=written&question=W213)

<!-- written-choice:end -->
