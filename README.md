
# Video Calling Application using WebRTC 📱🎥

Welcome to the Video Calling Application! This React Native app allows users to connect with each other via video calls using WebRTC. Once registered, users can log in, browse through a list of contacts, and initiate or receive video calls. The app is designed to provide a seamless and efficient communication experience, making it easy to stay connected with others through high-quality video interactions.

---

## Screenshots

<!DOCTYPE html>
<html>
<head>
    <style>
        .slider {
            position: relative;
            max-width: 600px;
            margin: auto;
            overflow: hidden;
        }
        .slides {
            display: flex;
            transition: transform 0.5s ease-in-out;
        }
        .slides img {
            max-width: 100%;
            height: auto;
        }
        .navigation {
            position: absolute;
            top: 50%;
            width: 100%;
            display: flex;
            justify-content: space-between;
            transform: translateY(-50%);
        }
        .prev, .next {
            background-color: rgba(0,0,0,0.5);
            color: white;
            border: none;
            padding: 10px;
            cursor: pointer;
        }
    </style>
</head>
<body>

<div class="slider">
    <div class="slides">
        <img src="https://github.com/user-attachments/assets/e0adc756-b1ef-493b-9a6c-7bff307f8ec8" alt="Screenshot 1724224573">
        <img src="https://github.com/user-attachments/assets/40085cc6-cefd-47f5-b9bd-635dd308c1c9" alt="Screenshot 1724224575">
        <img src="https://github.com/user-attachments/assets/cf2d0c13-2f82-464b-a151-632520abec25" alt="Screenshot 1724224561">
        <img src="https://github.com/user-attachments/assets/65df42c1-1784-4115-9a89-003a8759a943" alt="Screenshot 2024-08-21 at 12 46 42 PM">
        <img src="https://github.com/user-attachments/assets/0c17fae6-88e6-45d4-86e5-4e48b814e901" alt="Screenshot 2024-08-21 at 12 49 12 PM">
    </div>
    <div class="navigation">
        <button class="prev" onclick="moveSlide(-1)">&#10094;</button>
        <button class="next" onclick="moveSlide(1)">&#10095;</button>
    </div>
</div>

<script>
    let index = 0;

    function moveSlide(step) {
        const slides = document.querySelector('.slides');
        const totalSlides = slides.children.length;
        index = (index + step + totalSlides) % totalSlides;
        slides.style.transform = `translateX(${-index * 100}%)`;
    }
</script>

</body>
</html>


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
