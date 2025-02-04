# CAI Meza Mobile App

The CAI Meza mobile app is a simple mobile application that allows users to submit pictures to the CAI Meza portal. The app is built using [Capacitor](https://capacitorjs.com/) and plain JavaScript. The app features a login screen and an upload page for taking or selecting pictures from the device's gallery.


## Prerequisites

Before you begin, ensure that you have installed:

- **Node.js** (v14 or later is recommended) and npm.  
  [Download Node.js](https://nodejs.org/)

- **Capacitor CLI:** Install globally or use npx.  
  ```bash
  npm install -g @capacitor/cli
  ```

- **Android Studio:** For building and running the Android app.  
  [Download Android Studio](https://developer.android.com/studio)

- **Java JDK:** Make sure you have the Java Development Kit installed and the `JAVA_HOME` environment variable properly set.

- **Vite:** Used for bundling the web assets.  
  [Vite Documentation](https://vitejs.dev/)


## Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Charitable-Analytics-International/meza-mobileapp.git
   cd meza-mobileapp
   ```

2. **Install Dependencies:**
   ```bash
   npm install --force
   ```

3. **Build the Web Assets:**
  A **build.sh** script is provided to help automate the remaining build process.



## Manifest Configuration

Ensure the following permissions are set in the Android Manifest file that can be found [here](./android/app/src/main/AndroidManifest.xml)

    <!-- Permissions -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.CAMERA"/>


## Debugging

Use the developer console of your web browser,

    chrome://inspect/#devices


## Building the Android App (APK)

1. **Build the Web Assets:**
   ```bash
   ./build.sh
   ```

2. **Create a Signing Key (if you don't have one):**
    ```bash
    keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
    ```

3. **Build the Android App:** In Android Studio, open the project and build the app using the `Build > Generate Signed Bundle / APK` option. Follow the instructions to generate a signed APK.

4. **Versioning:** Increment the version number in the `android/app/build.gradle` file.
    ```
    android {
      ...
      defaultConfig {
        ...
        versionCode 1
        versionName "1.0"
    ```
