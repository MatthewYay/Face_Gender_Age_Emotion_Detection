const video = document.getElementById("video");

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/Face_Gender_Age_Emotion_Detection/weights"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/Face_Gender_Age_Emotion_Detection/weights"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/Face_Gender_Age_Emotion_Detection/weights"),
    faceapi.nets.faceExpressionNet.loadFromUri("/Face_Gender_Age_Emotion_Detection/weights"),
    faceapi.nets.ageGenderNet.loadFromUri("/Face_Gender_Age_Emotion_Detection/weights"),
]).then(startVideo);

function startVideo(){
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio:false,
    }).then(
        (stream)=>{
            video.srcObject = stream;
        }
    ).catch(
        (error)=>{
            console.log(error);
        }
    );
}

video.addEventListener("play" , ()=>{
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    faceapi.matchDimensions(canvas, {height: video.videoHeight, width: video.videoWidth});

    setInterval(async ()=>{
        const detection = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();
        canvas.getContext("2d").clearRect(0,0, canvas.width, canvas.height);

        const resizedDetections = faceapi.resizeResults(detection, {
            height: video.videoHeight,
            width: video.videoWidth,
        });

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        resizedDetections.forEach(detection => {
            const box = detection.detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, { 
                label: Math.round(detection.age) + " years old, " + detection.gender,
            });
            drawBox.draw(canvas);
        });

        console.log(detection);
    }, 100);
});