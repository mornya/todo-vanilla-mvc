# Todo Vanilla/MVC

## About
Todo 앱 MVC 및 바닐라스크립트로 구현
> URL: https://mornya.github.io/todo-vanilla-mvc/

## Project Setup
린트/테스트를 수행하기 위해 lintest 라는 개발도구를 사용하였으므로 글로벌 영역에 설치해주세요.
```bash
$ npm install -g @lintest/cli

$ npm install

# 만약 IDE 내에서 린트 룰셋을 참조하기 위한 파일을 생성해야 할 때 실행해주세요.
$ lintest export

# 개발서버를 실행합니다.
$ npm start
```

## 구현 내용
요구사항에 맞추어 TODO 앱을 구현하기 위해 아래와 같은 구조와 방법들이 사용되었습니다.

### 앱 디렉토리 구조
```
/
├── build                   # 빌드 결과물 디렉토리
├── node_modules            # node.js 디펜던시 디렉토리
├── public                  # 정적 리소스 디렉토리 (빌드시 build 디렉토리에 복제)
├── src                     # 앱 소스 디렉토리
│   ├── assets              # 번들링 될 리소스들의 디렉토리
│   │   ├── images          # 앱 내 사용될 이미지들
│   │   └── app.scss        # 앱 전체 스타일
│   ├── components          # 각 역할별 코드 디렉토리
│   │   ├── Controller.ts   # 액션 컨트롤 담당
│   │   ├── Model.ts        # 데이터 모델 담당
│   │   └── View.ts         # 유저 뷰 컨트롤 담당
│   ├── utils               # 도구 객체 디렉토리
│   │   ├── helper.ts       # 유틸리티성 코드
│   │   ├── Observer.ts     # 메시지 처리를 위한 메인 옵져버
│   │   └── Store.ts        # 스토리지 I/O 담당
│   └── index.ts            # 앱 엔트리
├── test                    # 테스트케이스 디렉토리
│   └── helper.test.ts      # helper 모듈 테스트케이스
├── types                   # 앱 전체 참조 타입 정의 디렉토리
├── .eslintignore           # ESLint 검사 미대상 파일 목록 정의
├── .eslintrc               # ESLint 룰셋 설정
├── .prettierrc             # prettier 적용 설정
├── build.ts                # 빌드 실행시 수행 (npm run build)
├── dev-server.config.ts    # webpack-dev-server 설정
├── jest.config.json        # Jest 설정
├── lintest.config.js       # Lintest 설정
├── package.json            # 앱 패키지 설정
├── package-lock.json       # NPM deps lock
├── README.md               # 현재 파일
├── server.ts               # 로컬개발을 위한 서버 구동시 수행 (npm start)
├── tsconfig.json           # 앱 타입스크립트 설정 (기본 확장)
├── tsconfig-cli.json       # CLI 전용 타입스크립트 설정 (기본 확장)
├── tsconfig-default.json   # 기본 타입스크립트 설정
└── webpack.config.ts       # webpack 설정
```

### 빌드환경 구성
빌드환경은 webpack (v5) 및 webpack-dev-server (v4)를 사용하여 요구되는 사항에 대해서만 설정해두었습니다.
- 빌드시 (npm run build) 결과물은 `/build` 디렉토리에 생성됩니다.
- 엔트리포인트 파일은 `/index.js` 입니다.
- 코드 내 import 시 기본 확장자는 `*.ts`, `*.js` 파일만 인식되며, `/src`, `/node_modules` 순서로 모듈을 탐색합니다.
- import 디렉토리 별칭으로 `~/*`는 `/` 디렉토리 기준, `@/*`는 `/src` 디렉토리 기준 절대경로로 인식하도록 합니다.
- 트렌스파일에 사용될 로더는 타입스크립트 빌드를 위해 `ts-loader`, scss 컴파일을 위해 `scss-loader`/`css-loader`/`style-loader` 등을 추가.
- 사용 플러그인은 아래와 같습니다.
  - `CleanWebpackPlugin`: 빌드시 `/build` 디렉토리 내 파일을 삭제.
  - `CopyWebpackPlugin`: 빌드시 `/public` 디렉토리 내 파일 전체 복제.
  - `ForkTsCheckerWebpackPlugin`: 서버기동 후 개발진행하는 동안 코드 타입 체크를 할 수 있도록 함.
- webpack-dev-server (v4) 버전 이용시 HMR 및 liveReload 기능이 자동으로 inject되어 특별한 설정 없이도 해당 기능이 사용되어집니다. v3 버전시 사용했던 방식은 설정 파일 내 주석으로 대체해두겠습니다.
- 모든 설정파일 및 코드는 타입스크립트로 작성되었고, 실행은 `ts-node`를 사용합니다.
- `nodemon`으로 서버재시작 필요시 감지하도록 했습니다.

### 구현 기술
- 화면 전체 스타일링은 SCSS 문법을 이용하였습니다.
- 사용되는 이미지는 체크박스 스타일링에 사용되었습니다.
- 코드는 요구사항대로 모두 바닐라스크립트로 구현했습니다.
- 코드는 MVC 및 Observer 패턴 등을 활용하여 관심사의 분리가 되도록 작성했습니다.
- 헬퍼 모듈의 `reactive` 메소드는 vue3의 reactive 메소드를 비슷하게 흉내내어 작성되었습니다.
- 아이템 목록의 TODO 아이템 레이아웃은 `index.html` 파일의 아이템 템플릿을 클론하여
  생성된 DocumentFragment에 변수값과 기능을 붙여 DOM에 새로 끼워넣는 방식을 사용합니다.
  > 처음에는 cloneNodes를 이용하여 DOM을 복제 후 해당 노드를 top-down으로 훑어내려가면서
  변수값과 기능을 붙였는데, 이 때 cloned된 DOM 노드의 특성상 BFS 알고리즘으로 탐색되지 않아
  DFS 탐색 알고리즘으로 변경했습니다. 결국 `<template>` 태그 사용법으로 변경되었습니다.
- TODO 아이템을 추가/수정 할 경우 입력폼 값을 저장할 때 XSS 대응되도록했고, 정교하게 처리하면 오버스펙일듯하여 HTML 태그만 치환하기만 했습니다.
- 데이터 저장공간은 로컬스토리지 이용했습니다 (세션스토리지로도 가능).
- 그 외 주석으로 추가된 부분 참고부탁드립니다.

### 흐름 및 처리
- 뷰와 컨트롤러 간의 통신
  - 단방향 메시지 통신을 위해 `Observer` 객체를 활용하는 방법을 선택했습니다.
  - 옵저버 객체를 생성하여 `Controller` 객체와 `View` 객체에 주입.
  - 뷰는 주입된 옵저버를 통해 이벤트 생성자 역할.
  - 컨트롤러는 주입된 옵저버를 통해 이벤트 수신자 역할.
  - 뷰에서 사용자 액션을 받게되면 UI처리를 하거나 컨트롤러로 이벤트 메시지를 전달하여 `Model` 객체 호출.
  - 컨트롤러에는 1개의 상태값을 가지고 있습니다.
    해당 상태값이 변경되는 것을 reactive하게 판단할 수 있으며,
    TODO 아이템 목록이 존재하는지 여부에 따라 다른 화면을 보여주는 처리를 위함입니다.
- 컨트롤러와 모델
  - 컨트롤러에서 데이터 변경요청에 대한 처리를 위해 모델을 이용하여 데이터를 가공하여 `Storage` 객체를 통해 I/O를 수행합니다.
  - 비동기 처리를 하지 않기 때문에 콜백이나 이벤트 전달을 하지는 않습니다.

## 기타
- 코드 인벤션은 prettier 설정 및 린트 룰셋을 이용했습니다.
- 코드 린트/테스트를 위해 `Lintest` CLI를 사용했습니다.
  이는 프로젝트마다 ESLint / Jest 등의 설정을 따로 하지않고 일관된 룰셋 적용을 위해
  제가 만들어 사용중인 툴입니다. 자세한 내용은 [여기를 클릭해주세요](https://www.npmjs.com/package/@lintest/cli).
- 린트는 `ESLint` 및 추가 플러그인을 이용하여 CLI에서 혹은 dev-server에서 코드검증을 실행합니다.
- 테스트케이스는 `Jest` 테스트도구를 이용합니다.
- 린트/테스트시 사용되는 설정인 `.eslintrc` 및 `jest.config.json` 파일은 `lintest export` 명령으로 추출되어 생성된 파일입니다.
- 개인일정상 일부 코드에 대한 테스트케이스만 만들게 되었습니다.

### Available scripts
`package.json`에 정의된 `script` 항목에 대한 내용은 아래와 같습니다.

#### `postinstall` / `postuninstall`
Lintest CLI 를 실행하기 위한 기초작업을 수행합니다. npm install / uninstall 실행시 초기설정이 진행됩니다.

#### `build`
프로덕션 모드로 `build` 디렉토리에 리소스들을 번들링합니다.
```bash
$ npm run build
```

#### `start`
HMR/liveReload 등이 적용된 로컬 개발서버를 실행합니다.
```bash
$ npm start
```

#### `check`
타입스크립트 컴파일러를 실행하여 타입 오류 등에 대한 검증을 수행합니다.
```bash
$ npm run check
```

#### `lint`
Lintest CLI를 실행하여 코드 린트 체크합니다.
```bash
$ npm run lint
$ lintest lint
```

#### `lint:fix`
Lintest CLI를 실행하여 코드 린트 체크 및 자동교정합니다.
```bash
$ npm run lint:fix
$ lintest lint --fix
```

#### `test`
Lintest CLI를 실행하여 `Jest` 기동 및 테스트케이스를 수행합니다.
```bash
$ npm run test
$ lintest test
```

#### `test:watch`
Lintest CLI를 실행하여 watch mode로 테스트케이스를 수행합니다.
```bash
$ npm run test:watch
$ lintest test --watch
```

#### `test:coverage`
Lintest CLI를 실행하여 테스트 커버리지 데이터를 수집하여 `/coverage` 디렉토리에 출력합니다.
```bash
$ npm run test:coverage
$ lintest test --coverage
```

## License
프로젝트 라이센스는 [LICENSE](LICENSE) 파일 참조.
