
# Video Calling Application using WebRTC 📱🎥

Welcome to the Video Calling Application! This React Native app allows users to connect with each other via video calls using WebRTC. Once registered, users can log in, browse through a list of contacts, and initiate or receive video calls. The app is designed to provide a seamless and efficient communication experience, making it easy to stay connected with others through high-quality video interactions.

---

## 🚀 Getting Started

### 1. **Starting the Server**

1. **Open the project** in VS Code or any other IDE.
2. **Navigate to the server directory** by running the following command in the terminal:

   ```bash
   cd server
   ```

3. **Install dependencies**:

   ```bash
   yarn
   ```

4. **Start the server**:

   ```bash
   yarn start
   ```

### 2. **Running the Project**

1. **Install project dependencies**:

   ```bash
   yarn
   ```

   or

   ```bash
   npm install
   ```

2. **List connected devices**:

   ```bash
   adb devices
   ```

   **Example output**:

   ```
   List of devices attached
   emulator-5554 device
   emulator-5556 device
   RZ8NA0RPWHL device
   ```

3. **Reverse the port for each device or simulator**:

   ```bash
   adb -s <device or simulator name> reverse tcp:3500 tcp:3500
   ```

   **Example**:

   ```bash
   adb -s emulator-5556 reverse tcp:3500 tcp:3500
   adb -s RZ8NA0RPWHL reverse tcp:3500 tcp:3500
   ```

   > **Note**: Connect two devices.

4. **Run the app**:

   ```bash
   npx react-native run-android
   ```
