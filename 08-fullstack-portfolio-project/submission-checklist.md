# 제출 전 체크리스트

이 파일은 Career Hub를 GitHub, 이력서, 지원서에 첨부하기 전에 확인하는 목록입니다.

## 실행 검증

- [ ] `npm install`이 성공합니다.
- [ ] `npm run lint`가 성공합니다.
- [ ] `npm run format:check`가 성공합니다.
- [ ] `npm run test:unit` (Vitest 단위·통합 테스트)이 성공합니다.
- [ ] `npm run build`가 성공합니다.
- [ ] `npm run test:api` (실제 서버 smoke test)가 성공합니다.
- [ ] `npm run audit:submit`이 성공합니다.
- [ ] `npm run verify` (위 항목을 한 번에 실행)가 성공합니다.
- [ ] ZIP으로 제출한다면 `npm run clean:generated`를 실행했습니다.

## GitHub 정리

- [ ] `node_modules`는 커밋하지 않습니다.
- [ ] `dist`는 배포 방식에 따라 필요할 때만 포함합니다.
- [ ] `.env`는 커밋하지 않습니다.
- [ ] `data/career-hub.json`은 로컬 실행 데이터이므로 커밋하지 않습니다.
- [ ] ZIP 제출 시 `node_modules`, `dist`, `data/career-hub.json`을 포함하지 않습니다.
- [ ] `.env.example`은 포함합니다.
- [ ] `README.md`, `learning-map.md`, `resume-assets.md`, `submission-checklist.md`는 포함합니다.
- [ ] `server/openapi.json`과 `Dockerfile`/`docker-compose.yml`/`render.yaml`/`fly.toml`도 포함합니다(자체 문서화와 배포 매니페스트 증거).

## 지원서 설명

- [ ] 프로젝트 한 줄 소개를 말할 수 있습니다.
- [ ] 루트 [폴더부터 실무까지 학습 가이드](../folder-to-practice-guide.md)를 기준으로 1~8번 폴더의 흐름을 말할 수 있습니다.
- [ ] 1~7단계가 Career Hub에 어떻게 연결되는지 설명할 수 있습니다.
- [ ] 인증, CRUD, 저장소 계층, 검증 스크립트를 설명할 수 있습니다.
- [ ] JSON 저장소를 선택한 이유와 DB 교체 방향을 설명할 수 있습니다.
- [ ] `npm run verify`가 어떤 검증을 하는지 설명할 수 있습니다.

## 보안 확인

- [ ] 비밀번호는 평문으로 저장되지 않습니다.
- [ ] 로그인 응답에 `passwordHash`가 노출되지 않습니다.
- [ ] 보호 API는 토큰 없이 접근하면 401을 반환합니다.
- [ ] `JWT_SECRET`은 배포 시 실제 비밀값으로 바꿉니다.
