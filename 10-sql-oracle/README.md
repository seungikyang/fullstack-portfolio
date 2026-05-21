# 10단계 SQL과 RDBMS (Oracle 중심)

## 목표

관계형 데이터베이스의 핵심 SQL을 손에 익힙니다. 한국 SI/SW 실무의 절대 다수가 Oracle, MySQL, PostgreSQL 같은 RDBMS를 사용합니다. 5단계의 MongoDB만으로는 신입 채용에서 부족합니다.

Oracle SQL 표기를 기본으로 하되, MySQL과 다른 부분은 표로 정리해 비교합니다.

## 실행 방법

세 가지 환경 중 하나를 선택합니다.

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

## 취업 연결

SI/SW 실무에서 SQL은 다음과 같은 가치를 가집니다.

- 대부분의 SI 프로젝트가 RDBMS에 핵심 데이터를 저장합니다.
- 신입에게 요구되는 가장 기본적인 능력은 "JOIN과 GROUP BY로 화면용 쿼리를 짤 수 있는가"입니다.
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

| 기능 | Oracle | MySQL |
| --- | --- | --- |
| 자동 증가 키 | SEQUENCE + TRIGGER 또는 IDENTITY | AUTO_INCREMENT |
| 페이지네이션 | `ROWNUM` 또는 12c부터 `FETCH FIRST N ROWS ONLY` | `LIMIT N OFFSET M` |
| 더미 테이블 | `DUAL` | 없음 (`SELECT 1`) |
| 문자열 연결 | `||` | `CONCAT()` |
| 날짜 함수 | `SYSDATE`, `TO_DATE` | `NOW()`, `STR_TO_DATE` |

## 면접 연습

- 기본 키와 유니크 제약의 차이는 무엇인가요?
- INNER JOIN과 LEFT JOIN의 결과 행 수가 어떻게 달라지나요?
- GROUP BY 절에 없는 컬럼을 SELECT 절에 쓰면 왜 오류가 나나요?
- 트랜잭션이 필요한 이유를 송금 예시로 설명해보세요.
- 인덱스를 무작정 늘리면 안 되는 이유는 무엇인가요?
- NoSQL(MongoDB)과 RDBMS(Oracle) 중 언제 무엇을 선택하나요?
