## Installation and Execution

### Versions

Versions for the application, libraries, frameworks, and dependencies as of May 20, 2023:

- Qs-mobile: **1.0.0**
- react: **18.2.0**
- react-native: **0.71.3**
- expo: **48.0.6**
- babel/core: **7.20.0**
- typescript: **4.9.4**

Emulator versions used during testing as of May 20, 2023:

- Android: **Android 31**
- iOS: **iOS 16.4**



This installation guide covers the setup for a functional development environment on either Android or iOS.


### Emulator

If the system does not already have an emulator installed, Android Studio is required for Android, or Xcode for iOS. The respective platforms have their own clear guides on how to do this:

**iOS:** [Running Your App in Simulator or on a Device](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device)

**Android:** [Managing AVDs](https://developer.android.com/studio/run/managing-avds)

### Node

Node installation assumes that the user already has the package manager for the current operating system installed. This guide uses Homebrew for macOS, Chocolatey for Windows, or Advanced Package Tool for Ubuntu/Debian. If you are using a different operating system or a Linux distribution that is not a Debian derivative, refer to its package manager instead.

macOS: 

```shell
brew install node`
```

Windows: 
```shell 
choco install nodejs.install 
```

Ubuntu/Debian:

```shell 
sudo apt install -y nodejs
```

Then, check that the correct versions are installed by running:

```shell
node -v && npm -v
```

### Startup

Navigate to the root folder of the project:

```shell
cd project-root-folder
```


Install dependencies:

```shell
npm install
```

Run either:

```shell
npm run android
```

or

```shell
npm run ios
```

The Expo console will appear, where you can press various hotkeys. Some useful ones are:

- `a`: Open in Android
- `i`: Open in iOS
- `r`: Reload app
- `j`: Open debugger

If you want to test the application on a physical mobile device instead of an emulator, you can also download the ExpoGo application from the App Store or Play Store and scan the QR code that appears in the Expo console.
