let video;
let poseNet;
let pose;
let skeleton;
let brain;
let state='waiting';
let targetLabel;
let x1,x2, y1, y2, x3, y3, x4, y4, y5, x5;
let k = 0;
let audio;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
}


function gotPoses(poses) {
  mulFacHeight = (windowHeight)/480;
  factor = -(windowWidth - video.width);
  mul = (windowWidth)/640;
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    if(state == 'collecting') {
        let inputs = [];
        for(let i = 0; i < pose.keypoints.length; i++) {
            let x = pose.keypoints[i].position.x * mul + factor;
            let y = pose.keypoints[i].position.y * mulFacHeight;
            inputs.push(x);
            inputs.push(y);
        }
        
    }
  }
}

function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {
  push();
  background(220);
  translate(video.width, 0);
  scale(-1, 1);
  factor = -(windowWidth - video.width);
  mulFacHeight = windowHeight/480;
  image(video, factor, 0, windowWidth, windowHeight);
  mul = windowWidth/640;
  if (pose) {
    let eyeR = pose.rightEye;
    let eyeL = pose.leftEye;
    //let d = dist(eyeR.x * mul + factor, eyeR.y * mulFacHeight, eyeL.x * mul + factor, eyeL.y * mulFacHeight);
    
    let d = dist(eyeR.x * mul + factor, eyeR.y * mulFacHeight, eyeL.x * mul + factor, eyeL.y * mulFacHeight);
    fill(0, 255, 0);
    ellipse(pose.rightWrist.x * mul + factor, pose.rightWrist.y * mulFacHeight, 32);
    ellipse(pose.leftWrist.x * mul + factor, pose.leftWrist.y * mulFacHeight, 32);
    ellipse(pose.rightElbow.x * mul + factor, pose.rightElbow.y * mulFacHeight, 32);
    ellipse(pose.leftElbow.x * mul + factor, pose.leftElbow.y * mulFacHeight, 32);
    
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x * mul + factor;
      let y = pose.keypoints[i].position.y * mulFacHeight;
      fill(255, 0, 0);
      ellipse(x,y,16,16);
    }
    
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(255);
      line(a.position.x * mul + factor, a.position.y * mulFacHeight,b.position.x * mul + factor,b.position.y * mulFacHeight);      
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      rightShoulder = pose.rightShoulder;
      leftShoulder = pose.leftShoulder;
      rightElbow = pose.rightElbow;
      leftElbow = pose.leftElbow;
      leftHip = pose.leftHip;
      leftKnee = pose.leftKnee;
      rightKnee = pose.rightKnee;
      rightHip = pose.rightHip;
      rightAnkle = pose.rightAnkle;
      leftAnkle = pose.leftAnkle;
      leftWrist = pose.leftWrist;
      rightWrist = pose.rightWrist;
    }
    pop();
    slopeRightHipKnee = Math.tanh((rightHip.y - rightKnee.y)/(rightHip.x - rightKnee.x));
    
    slopeLeftHipKnee = Math.tanh((leftHip.y - leftKnee.y)/(leftHip.x - leftKnee.x));
    
    condition1L = leftKnee.confidence > 0.5 && leftHip.confidence > 0.5 && slopeLeftHipKnee <= (10 * 3.14)/180 && slopeLeftHipKnee >= - (10 * 3.14)/180;
    
    condition2L = (rightKnee.confidence > 0.5 && rightHip.confidence > 0.5 && slopeRightHipKnee <= (10 * 3.14)/180 && slopeRightHipKnee >= - (10 * 3.14)/180);
      
    slopeRightAnkleKnee = Math.tanh((rightAnkle.y - rightKnee.y)/(rightAnkle.x - rightKnee.x));
      
    slopeLeftAnkleKnee = Math.tanh((leftAnkle.y - leftKnee.y)/(leftAnkle.x - leftKnee.x));
      
    slopeRightHipShoulder = Math.tanh((rightHip.y - rightShoulder.y)/(rightHip.x - rightShoulder.x));
      
    slopeLeftHipShoulder = Math.tanh((leftHip.y - leftShoulder.y)/(leftHip.x - leftShoulder.x));
      
    slopeLeftElbowShoulder = Math.tanh((leftElbow.y - leftShoulder.y)/(leftElbow.x - leftShoulder.x));  
      
    slopeRightElbowShoulder = Math.tanh((rightElbow.y - rightShoulder.y)/(rightElbow.x - rightShoulder.x));
      
    slopeRightAnkleHip = Math.tanh((rightAnkle.y - rightHip.y)/(rightAnkle.x - rightHip.x));
      
    slopeLeftAnkleHip = Math.tanh((leftAnkle.y - leftHip.y)/(leftAnkle.x - leftHip.x));
      
    val = 3.14/180;
      
    condition1Ex = Math.abs(rightAnkle.x - rightKnee.x) <= 10 && slopeLeftHipKnee <= 50 * val && slopeRightAnkleKnee <= -40 * val && slopeRightAnkleKnee >= -60 * val && leftHip.confidence > 0.5 && rightAnkle.confidence > 0.5 && rightKnee.confidence > 0.5; 
      
    condition2Ex = Math.abs(rightAnkle.x - rightKnee.x) <= 10 && slopeRightHipKnee <= 50 * val && slopeLeftAnkleKnee <= -40 * val && slopeLeftAnkleKnee >= -60 * val && rightAnkle.confidence > 0.5 && rightHip.confidence > 0.5 && leftAnkle.confidence > 0.5 && leftKnee.confidence > 0.5;
    
      
    slope = Math.tanh((rightShoulder.y - leftElbow.y)/(rightShoulder.x - leftElbow.x));
      
    if(condition1Ex || condition2Ex){
      fill(255, 0, 255);
      noStroke();
      textSize(128);
      textAlign(CENTER, CENTER);                
      fill(0, 255, 0);
      text('Warrior II Pose', width / 2, height / 2);
    } else if(rightShoulder.confidence > 0.5 && leftElbow.confidence > 0.5 && slope <= (3 * 3.14)/180 && slope >= -(3 * 3.14)/180) {
      fill(255, 0, 255);
      noStroke();
      textSize(128);
      textAlign(CENTER, CENTER);                
      fill(0, 255, 0);
      text('Arms Straight', width / 2, height / 2);
    } else if(condition1L || condition2L) {
      fill(255, 0, 255);
      noStroke();
      textSize(128);
      textAlign(CENTER, CENTER);                
      fill(0, 255, 0);
      text('Lunges', width / 2, height / 2);
    } 
  }
}