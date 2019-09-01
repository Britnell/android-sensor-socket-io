# android-sensor-socket-io

Interface to send Android phone sensor data over Socket.io to a NodeJS server &amp; web interface / GUI

# Summary

  * The [Android app termux](https://termux.com/) is used to run scripts 
  * This allows sensors (and much more) to be read through command-line 
  * Node js runs a child_process to read data from the built in motion sensors and sends it via socket.io to wherever you want
  * this could readily be adjusted to send over MQTT or other
  * I wrote a demo node.js server that receives the data with socket.io, performes sensor fusion with Madgwick algorithm and broadcasts via socket.io
  * a demo web page that receives this data, displays the values and a few demo visualisations


### I. Setting up Termux

  ### [The Termux Wiki](https://wiki.termux.com/wiki/Main_Page) is a great reference and can do much more than just motion sensor data

  1. Install [Termux](https://play.google.com/store/apps/details?id=com.termux) and [Termux API](https://play.google.com/store/apps/details?id=com.termux.api) Android Apps. The API is used for you to give Termux permissions to access phone sensor data, location etc. These will pop up later when you first use the commands.
  
  1. Install [Hacker's Keyboard](https://play.google.com/store/apps/details?id=org.pocketworkstation.pckeyboard) as this has the directional arrows etc. 

  1. Setup [Storage](https://wiki.termux.com/wiki/Internal_and_external_storage)
  Run `$ termux-setup-storage ` (without the $ of course) and give permission to access storage
  Just like in linux you can see content in current folder with `ls` and change into a folder with `cd FOLDERNAME` and go out of the current folder with `cd ..`.

  Now you can see a folder called *storage* and in it a folder called *shared* , so go into it with `cd storage/shared` this brings me into the folder I can see from my PC over USB cable. So I set up a new folder here where I can run scripts form Termux but also drop the code files from my laptop so I can edit them easily there.

  1. Installation
   * You can install with `$ pkg install ____`
   * Run `$ apt update && apt upgrade` to update, for good measures
   * Run `$ pkg install nodejs` 
   * Run `$ pkg install termux-api` to begin using the API
   * Run `$ pkg upgrade` to upgrade all packages, for good measures

   1. Termux API
   Try out the [Termux command line API calls](https://wiki.termux.com/wiki/Termux:API)
   You can do anything here from setting brightness, sending notifications, checking battery status, reading a text with TTS, taking a photo, recording the microphone to getting GPS location. Try these out since the first time you run the command you need to allow and give the permissions so you can use them later.

   1. [termux-sensor](https://wiki.termux.com/wiki/Termux-sensor) is what I focused on
   Run `$termux-sensor -l` to get a list of sensors available on your device, they all have different names.
   You can then read one sensor with `$ termux-sensor -s NAME` - where NAME can just be part of the name. For me accel, gyro and magn were enough.
   You can set the interval at which it is reading with `-d 500` e.g. for 500 ms. This is useful for readability when first testing.
   By default the reading will run continuously and you can cancel with `ctrl + c` , but you can also choose how many values to read with the flag `-n 100` = 100 values.

   A to do for later is to chose via socket with sensors are being read as there are many interesting ones
   Facing | gives 1 or 2 depending if phones is lying flat facing up or down
   Basic-gestures | seems to read gestures such as shaking
   Stk3x1x alsprx | gave output from proximity sensor, but essentially 1 or 0 if my phone is right in front of a surface or not
   wake-up | some are also called wake up and could maybe be used for interrupts / flags

### II. Node code (Android side)
   
   1. I set up a folder for all my code with `mkdir` and you might have to setup permission with `chmod 777`
   Install node packages normally with `$ npm install PACKAGE --save`

   1. [NPM node-cmd](https://www.npmjs.com/package/node-cmd)
   I first used the node-cmd package which was simple and great for testing so I wanted to mention it. It is great for running API calls such as changing brightness, taking photo, reading battery etc.  
   See `node_cmd_test.js`

   1. [Child process](https://nodejs.org/api/child_process.html)
   After trying a few packages and methods I suggest using node.js v12 package child_process, as with this you can create a child process that runs a sensor-api command to read data *continuously* and can then kill the process when finished. Some packages I tried did not have permissions and were blocked by OS.
    * The first test of this is `stdstream.js`. 
    * Then `termux_socket.js` to create a new datastream that read -n values and then opens new, but there is quite a delay with termux before any command is executed
   
   Thus the best method is `termux_socket2.js` which can start and stop the datastream, but creating a new child process, then killing it and cleaning the sensor with `termux-sensor -c` for clean-up.

### III. termux node

 My first test was XI. Node-server, however I simplified a bit so now the node script running on the android reads the data and starts a socket.io server, and sends the data to any client that connects to the socket.
 This is way simpler, then any browser / GUI can connect to the socket and receive the data.

 For this see folder `/termux_node` 

 The `termux_node.js` script should be copied and run on the android device through termux. This requires `$ npm install socket.io node-cmd ahrs --save` 
 then open up any of the .html files to open a GUI in browser that will connect to the android-node-socket.io-server. Just find out the IP address of the android phone ( `$ ifconfig `) and replace in the connect code.

### XI. Node-server with [Socket.io](https://www.npmjs.com/package/socket.io)

   I like using Socket.io a lot for connecting different nodes to each other and sending data around.
   See `/static_server` 
   * Socket.io
   * Uses Express for simple web-server
   * [npm : AHRS](https://www.npmjs.com/package/ahrs) - performs sensor fusion of Gyro+accel+magnetometer

   So this is just a basic server that the android node connects to (so you could have more than one android device). It receives the data and just broadcasts it on socket. Then the AHRS pckage additionally performs sensor fusion. This is working well but not as well as I expected. 
   * I added the parameter that measures time between frames and this improved performance a lot
   * still not alwasy as good as expected, but right now this could still be due to the android phone / sensors or even just because the magnetometer is getting bad readings as I am indoors and there is metal and electronics around.

### with Web GUI
   
   2. In the first box are displayed directly the Accelerometer, Gyroscope and Magnetometer values.
   2. A *Gyroscope wheel* example that only takes the gyro's yaw value to turn a steering wheel
   2. in the second box are the *Euler Angles* as calculated by AHRS with Madgwick algorithm
   2. I then added some move some shapes according to the Euler angles with GSAP's TweenMax. The values for that had to be converted into degrees again etc and are displayed under 'Object'
   2. Click the center button to change to 'origin' of all the moving objects to align with the phone in your hand
   2. I quickly added a pointer cursor example. This currently takes no calibration just moves the cursor between +-15 degree or so. In heavy need of some smoothing

### V. Run
   
   Run the node server, check your IP address / hostname and edit it in the termux_socket code on the android device. Drop the file onto your android working folder and run it through termux. 
   Open the GUI in your browser on localhost:
   My devices disconnect every now and then, probably just because of noisy WiFi. but the great thing about socket is that it automatically re-connects.

   ***Important***
   Turn and rotate the phone around in your hand a bit. The algorithm needs a few values to settle in and a few turns to find its magnetic bearing and reference. If values are not what you expect then restart the termux_node server and rotate the phone around again.








