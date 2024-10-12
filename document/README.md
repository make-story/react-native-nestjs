# react-native

ReactNative

https://www.inflearn.com/course/%EB%A7%9B%EC%A7%91-%EC%A7%80%EB%8F%84%EC%95%B1-%EB%A7%8C%EB%93%A4%EA%B8%B0-reactnative-nestjs

`study.git/ReactNative/환경구축.md` 내용 참고!

강의에서 사용하는버전은 0.72.6 버전

## React Native IOS 실행

`애플 M2 탑재된 맥OS의 경우에는 npm run ios 명령을 실행하기 전에 다음 작업을 수행`해야 합니다.

VSCode 에서 ios/Podfile 열고,

```
# Note that if you have use_frameworks! enabled, Flipper will not work and
# you should disable the next line.
```

위 주석을 찾아 다음 라인의 코드를 주석처리 합니다. (Flipper)

다음으로 터미널에서 프로젝트 내부의 ios 디렉토리로 이동한 뒤, ios 에서 사용하는 라이브러리를 설치

```bash
$ cd ios
$ pod install
$ cd ../
$ npm run ios
```

또는

```bash
$ cd ios
$ rm -rf Pods
$ rm -rf Podfile.lock
$ pod install
```

1. Xcode를 프로젝트명.xcworkspace 로 열어줍니다. (예: react-native.git/app/ios/app.xcworkspace)
2. Product > Clean Build Folder 를 실행합니다.
3. ▶︎ 를 눌러 실행합니다.

또는

homebrew 등으로 관련 도구(Node.js 또는 NVM 등)을 설치하면서,
ios 폴더 내부 NVM 버전세팅이 돌아가는 코드의 문제가 있을 수 있음.
이 경우, 'npx react-native init app' CLI 명령으로 프로젝트 다시 생성

https://reactnative.dev/docs/environment-setup?platform=ios&package-manager=yarn#optional-using-a-specific-version-or-template

또는

공식페이지 가이드에 따라 진행  
iOS에 문제가 있는 경우 다음을 실행하여 종속성을 다시 설치해 보세요.

https://reactnative.dev/docs/environment-setup?platform=ios&package-manager=yarn#creating-a-new-application

- 'cd ios' 폴더로 이동합니다.
- 'bundle install' 번들러를 설치
- 'bundle exec pod install' CocoaPods 에서 관리하는 iOS 종속성을 설치

```
Run instructions for Android:
• Have an Android emulator running (quickest way to get started), or a device connected.
• cd "react-native.git/app" && npx react-native run-android

Run instructions for iOS:
• cd "react-native.git/app/ios"

    • Install Cocoapods
      • bundle install # you need to run this only once in your project.
      • bundle exec pod install
      • cd ..

    • npx react-native run-ios
    - or -
    • Open app/ios/app.xcodeproj in Xcode or run "xed -b ios"
    • Hit the Run button

Run instructions for macOS:
• See https://aka.ms/ReactNativeGuideMacOS for the latest up-to-date instructions.
```

# 유용한 추가 패키지 설치

```bash
# React Native WebView 설치
npm install react-native-webview

# React Navigation 관련 패키지 설치
npm install @react-navigation/native @react-navigation/stack react-navigation-stack

# 추가적으로 필요한 패키지 설치 (주의! react-native 에 맞는 버전 설치!!)
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler@^2.16.0

# TypeScript 관련 패키지 설치 (개발 환경)
npm install --save-dev @types/react-native @types/react-navigation @types/react-navigation-stack
```

iOS 의 경우, 신규 NPM 설치 후

```
cd ios && pod install
```

# 주의사항

Geolocation 권한:  
사용자 위치를 가져오기 위해서는 Android 및 iOS에서 위치 권한이 필요합니다. AndroidManifest.xml 파일과 Info.plist 파일에서 위치 권한을 설정해야 합니다.

# 네이티브 설정(iOS/Android)

iOS 와 Android 환경에서 react-native-webview 와 react-navigation 의 네이티브 디펜던시를 처리하기 위해  
추가적으로 네이티브 설정을 해야 할 수 있습니다.

## iOS:

WebView 나 네이티브 모듈을 사용하는 라이브러리를 추가한 후에는 CocoaPods 명령을 실행해야 합니다.

```
cd ios && pod install
```

## Android:

React Native가 자동으로 링크되지 않으면, MainApplication.java 에 수동으로 패키지를 추가해야 할 수 있습니다.  
하지만 최신 버전의 React Native에서는 보통 자동으로 처리됩니다.
