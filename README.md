<!--  ==== ==== ==== ==== Starting the Server ==== ==== ==== ====  -->
<!-- Open the project in VS Code or any other IDE. -->
<!-- Run the following commands in the terminal -->

cd server
yarn
yarn start

<!--  ==== ==== ==== ==== Running the Project ==== ==== ==== ====  -->
<!-- Run: -->

yarn OR npm install

<!-- List the connected devices: -->

adb devices

<!-- Example output: -->

List of devices attached
emulator-5554 device
emulator-5556 device
RZ8NA0RPWHL device

<!-- Reverse the port for each device or simulator: -->

adb -s <device or simulator name> reverse tcp:3500 tcp:3500

<!-- Example: -->

adb -s emulator-5556 reverse tcp:3500 tcp:3500
adb -s RZ8NA0RPWHL reverse tcp:3500 tcp:3500

<!-- NOTE: Connect two devices. -->

<!-- Run the app: -->

npx react-native run-android
