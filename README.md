
# Video Calling Application using WebRTC 📱🎥

Welcome to the Video Calling Application! This React Native app allows users to connect with each other via video calls using WebRTC. Once registered, users can log in, browse through a list of contacts, and initiate or receive video calls. The app is designed to provide a seamless and efficient communication experience, making it easy to stay connected with others through high-quality video interactions.

---

## Screenshots
<img src="https://github.com/user-attachments/assets/e0adc756-b1ef-493b-9a6c-7bff307f8ec8" alt="Screenshot 1724224573" width="233" /> <img src="https://github.com/user-attachments/assets/40085cc6-cefd-47f5-b9bd-635dd308c1c9" alt="Screenshot 1724224575" width="233" /> <img src="https://github.com/user-attachments/assets/cf2d0c13-2f82-464b-a151-632520abec25" alt="Screenshot 1724224561" width="233" />

##
<img src="https://github.com/user-attachments/assets/65df42c1-1784-4115-9a89-003a8759a943" alt="Screenshot 2024-08-21 at 12 46 42 PM" width="350" /> <img src="https://github.com/user-attachments/assets/0c17fae6-88e6-45d4-86e5-4e48b814e901" alt="Screenshot 2024-08-21 at 12 49 12 PM" width="350" />

---
## 🚀 Getting Started

### 1. **Starting the Server**

1. **Open the project** in VS Code or any other IDE.
2. **Update the Mongodb url** in server directory.
3. **Navigate to the server directory** by running the following command in the terminal:

   ```bash
   cd server
   ```

4. **Install dependencies**:

   ```bash
   yarn
   ```

5. **Start the server**:

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
   adb -s emulator-5556 reverse tcp:3100 tcp:3100
   adb -s RZ8NA0RPWHL reverse tcp:3100 tcp:3100
   ```

   > **Note**: Connect two devices.

4. **Run the app**:

   ```bash
   npx react-native run-android
   ```
