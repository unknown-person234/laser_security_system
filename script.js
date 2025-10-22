document.addEventListener('DOMContentLoaded', () => {
    const motionStatusDiv = document.getElementById('motionStatus');
    const systemMessageP = document.getElementById('systemMessage');
    const liveVideo = document.getElementById('liveVideo');
    const recordingIndicator = document.getElementById('recordingIndicator');
    const noFeedOverlay = document.getElementById('noFeedOverlay');
    const eventLogList = document.getElementById('eventLogList');

    let isMotionDetected = false;
    let recordingTimeout = null;
    let recordingStartTime = null;

    // --- Simulation Functions (Replace with actual system integration later) ---

    // Function to add an event to the log
    function addEventToLog(message, type = 'info') {
        const now = new Date();
        const timestamp = `[${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
        const li = document.createElement('li');
        li.innerHTML = `<span class="timestamp">${timestamp}</span> ${message}`;
        eventLogList.prepend(li); // Add to the top
        // Keep log from getting too long
        if (eventLogList.children.length > 20) {
            eventLogList.removeChild(eventLogList.lastChild);
        }
    }

    // Simulate motion detection
    function simulateMotionDetection(detected) {
        if (detected && !isMotionDetected) {
            isMotionDetected = true;
            motionStatusDiv.innerHTML = '<i class="fas fa-check-circle"></i> <p>MOTION DETECTED</p>';
            motionStatusDiv.classList.add('active');
            systemMessageP.textContent = 'System Armed & Active. Recording started.';
            addEventToLog('Motion Detected. Recording started.');
            startRecording();
        } else if (!detected && isMotionDetected) {
            isMotionDetected = false;
            motionStatusDiv.innerHTML = '<i class="fas fa-shield-alt"></i> <p>NO MOTION</p>';
            motionStatusDiv.classList.remove('active');
            systemMessageP.textContent = 'System Armed. Monitoring area.';
            addEventToLog('Motion Cleared. Recording will stop soon.');
            // Start countdown to stop recording
            stopRecordingAfterDelay();
        } else if (!detected && !isMotionDetected) {
             // If already not detecting motion and received another "no motion"
             // Ensure status is correct if it was just initializing
            motionStatusDiv.innerHTML = '<i class="fas fa-shield-alt"></i> <p>NO MOTION</p>';
            motionStatusDiv.classList.remove('active');
            systemMessageP.textContent = 'System Armed. Monitoring area.';
        }
    }

    // Start video recording simulation
    function startRecording() {
        clearTimeout(recordingTimeout); // Clear any pending stop recording calls
        if (liveVideo.style.display === 'none' || liveVideo.srcObject === null) {
            // Simulate camera stream. In a real system, this would be a WebSocket or WebRTC stream.
            // For now, we can play a placeholder video or just show the indicator.
            // If you have a test video file, you can set liveVideo.src = 'your-video-file.mp4';
            
            // For true live camera, you'd use navigator.mediaDevices.getUserMedia or connect to a backend stream
            // Example:
            // navigator.mediaDevices.getUserMedia({ video: true })
            //     .then(stream => {
            //         liveVideo.srcObject = stream;
            //         liveVideo.play();
            //         liveVideo.style.display = 'block';
            //         noFeedOverlay.style.display = 'none';
            //         recordingIndicator.style.display = 'block';
            //     })
            //     .catch(err => {
            //         console.error("Error accessing camera: ", err);
            //         // Fallback if no camera or permissions denied
            //         liveVideo.style.display = 'none';
            //         noFeedOverlay.style.display = 'flex';
            //         noFeedOverlay.querySelector('p').textContent = 'Camera Unavailable';
            //     });

            // For now, let's just show the recording indicator and hide the overlay
            liveVideo.style.display = 'block'; // Assume video is now 'playing'
            noFeedOverlay.style.display = 'none';
            recordingIndicator.style.display = 'block';
            addEventToLog('Live video stream active.');
        } else {
            // If video is already playing, just ensure recording indicator is on
            recordingIndicator.style.display = 'block';
        }
        recordingStartTime = Date.now();
    }

    // Stop video recording simulation after a delay
    function stopRecordingAfterDelay() {
        if (recordingTimeout) clearTimeout(recordingTimeout);
        recordingTimeout = setTimeout(() => {
            recordingIndicator.style.display = 'none';
            liveVideo.style.display = 'none'; // Hide video element
            noFeedOverlay.style.display = 'flex'; // Show overlay
            addEventToLog('No motion for 10s. Recording stopped.');
            recordingStartTime = null; // Reset recording start time
        }, 10000); // 10 seconds delay
    }

    // Initial state setup
    addEventToLog('Dashboard Loaded. Awaiting system connection.');
    
    // Simulate initial system connection
    setTimeout(() => {
        simulateMotionDetection(false); // System starts with no motion
    }, 2000); // Simulate 2-second connection time


    // --- How you would integrate with your laser system (Conceptual) ---
    /*
    This part is highly dependent on how your laser security system communicates.
    Common methods include:
    1.  **WebSockets:** For real-time, bi-directional communication.
        let ws = new WebSocket("ws://your-laser-system-ip:port/ws");
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'motion_event') {
                simulateMotionDetection(data.detected); // Or direct update
            }
            // Handle video stream URLs, etc.
        };
        ws.onopen = () => console.log("WebSocket connected!");
        ws.onclose = () => console.log("WebSocket disconnected.");
        ws.onerror = (err) => console.error("WebSocket error: ", err);

    2.  **REST API Polling:** Your website periodically asks the system for updates.
        setInterval(() => {
            fetch("http://your-laser-system-ip:port/api/status")
                .then(response => response.json())
                .then(data => {
                    simulateMotionDetection(data.motion_detected);
                    // Update video source if URL changes, etc.
                })
                .catch(error => console.error("Error fetching status:", error));
        }, 3000); // Every 3 seconds

    3.  **MQTT:** A lightweight messaging protocol often used in IoT. Requires a broker.
        // You'd use an MQTT.js client and subscribe to topics
        // client.on('message', (topic, message) => { /* handle message * / });
    */

    // --- Developer Controls for Testing (Remove for production) ---
    // You can click the status card to toggle motion detection for testing
    motionStatusDiv.parentElement.addEventListener('click', () => {
        simulateMotionDetection(!isMotionDetected);
        addEventToLog(`Manually toggled motion to: ${!isMotionDetected}`);
    });

    // For demonstration, let's make the video play a sample if motion is detected
    // In a real scenario, 'liveVideo.srcObject' would be set from your actual camera stream.
    if (liveVideo) {
        liveVideo.src = "https://www.w3schools.com/html/mov_bbb.mp4"; // Sample video
        liveVideo.loop = true; // Loop the sample video
    }
});