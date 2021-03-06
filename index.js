// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
import * as fbauth from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBBzU9M3z574t6_7sMXJ4LcahHpBasqoWI",
  authDomain: "websec-4156e.firebaseapp.com",
  databaseURL: "https://websec-4156e-default-rtdb.firebaseio.com",
  projectId: "websec-4156e",
  storageBucket: "websec-4156e.appspot.com",
  messagingSenderId: "963481751669",
  appId: "1:963481751669:web:06162faf02fe4f9ad5a83c",
  measurementId: "G-E2X373W36Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let db = rtdb.getDatabase(app);
let auth = fbauth.getAuth(app);
let msgRef = rtdb.ref(db, "/Chat");
let userRef = rtdb.ref(db, "/users");

// Msg object
// holds all the information held in a single message
class Msg {
  constructor(key, uid, name, color, time, msg) {
    this.key = key;
    this.uid = uid;
    this.name = name;
    this.color = color;
    this.time = time;
    this.msg = msg;
  }
}

var User = new Object();

// When "Sign up!" is clicked, brings you to the register page
$("#sign-up").on("click", ()=>{
  window.location.href = "register.html";
});

// Register for an account
$("#register-button").on("click", ()=>{
  let email = $("#regemail").val();
  let p1 = $("#regpass1").val();
  let p2 = $("#regpass2").val();
  let username = $("#regusername").val()

  //Checking to see if email is in proper format
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if(!email.match(mailformat)){
    alert("You have entered a invalid email address!");
    clearReg();
    return;
  }

  //Checking to see if passwords are the same
  if (p1 != p2){
    alert("Passwords don't match!");
    clearReg();
    return;
  }

  //Getting ID of user and pushing username
  //and role
  fbauth.createUserWithEmailAndPassword(auth, email, p1).then(somedata=>{
    User.uid = somedata.user.uid;
    User.username = username;
    let usernameRef = rtdb.ref(db, `/users/${somedata.user.uid}/username`);
    let colorRef = rtdb.ref(db, `/users/${somedata.user.uid}/color`);
    let userRoleRef = rtdb.ref(db, `/users/${somedata.user.uid}/roles/user`);

    //Pushing user data to firebase
    rtdb.set(usernameRef, User.username);
    rtdb.set(colorRef, getColor(User.uid));
    rtdb.set(userRoleRef, true);  
    
    window.location.href = "chat.html";
    return User;
  }).catch(function(error) { 
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode);
    console.log(errorMessage);
    alert(errorMessage);
    //clearReg();
  });
});

//Login using your account credentials
$("#login-button").on("click", ()=>{
  let email = $("#logemail").val();
  let pwd = $("#logpass").val();
  fbauth.signInWithEmailAndPassword(auth, email, pwd).then(
    somedata=>{
    
    console.log("Login Successful");
    window.location.href = "chat.html";

    }).catch(function(error) {
      // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode);
    console.log(errorMessage);
    alert(errorMessage);
    //clearReg();
    });
});

//Get user information
fbauth.onAuthStateChanged(auth, user => {
  if (!!user){
    console.log("User Created");
    User.uid = user.uid;

    //Finding username of user
    rtdb.onValue(userRef, ss=>{
      let userObj = ss.val();
        if (!!userObj && userObj.hasOwnProperty(User.uid)){
          User.username = userObj[User.uid].username;
          $('#username').append(User.username);
          User.color = userObj[User.uid].color;

        }
    });
  } else {
    console.log("User not created");
  }
  return user
});


// clearReg
// clears the input fields on the login
// and register options
function clearReg() {
  $("#regemail").val("");
  $("#regpass1").val("");
  $("#regpass2").val("");
  $("#regusername").val("");

}

// MsgHTML: takes in a Msg object
// returns the approprate html to append for a message
function msgHTML(Msg) {

  //Checking to see if the message was sent today.
  //If not, append the day of the week to the time
  if(getTime().day == Msg.time.day){
    return (
      `<li class="msg" id=${Msg.key}>
        <i class="name-date"> 
          <i class="name" style="color:${Msg.color}; font-weight: bold;">${Msg.name}: </i>
          <i class="msg-date"> ${Msg.time.hour}:${Msg.time.minute} ${Msg.time.midday}</i>
        </i>
        <i class="msg-details">
          <i class="msg-text"> ${Msg.msg} </i> 
          <input class="details-btn"; type="button"; value="..."></button> 
        </i>
      </li>`)
  }

  else{
    return (
      `<li class="msg" id=${Msg.key}>
        <i class="name-date"> 
          <i class="name" style="color:${Msg.color}; font-weight: bold;">${Msg.name}: </i>
          <i class="msg-date"> ${Msg.time.day} ${Msg.time.hour}:${Msg.time.minute} ${Msg.time.midday}</i>
        </i>
        <i class="msg-details">
          <i class="msg-text"> ${Msg.msg} </i> 
          <input class="details-btn"; type="button"; value="..."></button> 
        </i>
      </li>`
    );
  }
}


// submit funciton
// Listens for a submit on the input id #messageForm
// which is where the user enters a message, and adds that 
// Message along with their name to the rtdb
$("#messageForm").submit(function(event){
    
    let text = $("#msg-input").val()
    if(text == ""){
      alert("Message can not be blank");
      return false;
    } 

    // Kinda like an admin function I guess.
    // If text input is "clearDB" the database is 
    // emptied, lazy rn to add a buttom action.
    if (text == "clearDB") {
      event.preventDefault();
      rtdb.set(msgRef, {});
      $("#msg-input").val("");
      return;
    }

    event.preventDefault();
    let name = User.username;
    let userColor = User.color;
    let time = getTime();
    event.preventDefault();

    //Pushing new message to the database.
    rtdb.push(msgRef, {
      name : name,
      uid : User.uid,
      msg : text,
      color : userColor,
      time : time
    });
    event.preventDefault();


  $("#msg-input").val("");
});


// reloadMsgs:
// Populates the chat app window with all the 
// messages in the rtdb once a new one is added
// or when the page is first loaded.
let loadMsgs = function() {
  rtdb.onValue(msgRef, data => {
    $("#messages").empty();
    let hostMsg = new Msg("key", "none", "Host", "lightgray", getTime(), "Hello and Welcome!")
    $("#messages").append(msgHTML(hostMsg));

    data.forEach(userSnapshot => {
        let newMsg = new Msg(userSnapshot.key, userSnapshot.val().uid, userSnapshot.val().name, userSnapshot.val().color, 
        userSnapshot.val().time, userSnapshot.val().msg)
        event.preventDefault();
        $("#messages").append(msgHTML(newMsg));
    });
  });

  //Finding if User is admin
  rtdb.onValue(userRef, ss=>{
    let userObj = ss.val();
      if (!!userObj && userObj.hasOwnProperty(User.uid)){
        User.username = userObj[User.uid].username;
        $('#username').append(User.username);
        User.color = userObj[User.uid].color;
        if(userObj[User.uid].roles.user == "admin") {
          $("#info").append("<div> I am the admin!</div>")
          rtdb.onValue(userRef, ss=>{
            let userObj = ss.val();
            $("#info").append(`<p>${JSON.stringify(userObj)}</p>`)


          });
        }
      }
  });
};



// colorNames: Takes in a string (name)
// This function iterates through the messages in the rtdb
// and searches to see if that name belongs to a message,
// if it does, it returns that users color.
// If that name does not exist it generates a color for that user
let getColor = function() {
  var randomColor = Math.floor(Math.random()*16777215).toString(16);
  return "#" + randomColor; 
};


// getTime: 
// This function gets the day, hour, minute, and midday
// of the current day and returns those values in an
// object.
// returns an object: {string, int, int, string}
let getTime = function(){
  var d = new Date();
  console.log(d)
  var hours = d.getHours();
  var hour = ((hours + 11) % 12 + 1);

  if(d.getMinutes() < 10) { var minute = "0" + d.getMinutes().toString(); }
  else{ var minute = d.getMinutes(); }
  
  if (hours > 12){ var midday = "pm"; }
  else{ var midday = "am"; }

  var weekday = new Array(7);
  weekday[0] = "Sun";
  weekday[1] = "Mon";
  weekday[2] = "Tues";
  weekday[3] = "Wed";
  weekday[4] = "Thurs";
  weekday[5] = "Fri";
  weekday[6] = "Sat";

  var day = weekday[d.getDay()];

  return {day, hour, minute, midday};
};




//Calling reloadMsgs
loadMsgs();


//Functions for editing messages.

//Setting global vaiables to be used in multiple functinos
let isclicked = false;
let text = "";
let msgID = ""

//When the details button of a message is clicked
$(document).on("click",".details-btn",function() {
  //Getting message ID
  msgID = $(this).closest('li').attr('id').toString()
  let id = "#" + msgID

  //Changing color to green and creating input field
  if(isclicked == false){ 
    text = $(id).children(".msg-details").children(".msg-text").text()
    $(id).css( "background-color", "rgba(126, 255, 133, 0.4)" );
    let htmltext = `<input type='text' class='edit-msg' placeholder='Edit:${text}'>`
    $(id).children(".msg-details").children(".msg-text").replaceWith(htmltext);
    isclicked = true;
  }
  //Removing the green from the message if details button is clicked again with no
  //input being submitted.
  else {
    $(id).removeAttr('style');
    let htmltext = `<i class='msg-text'> ${text} </i>`;
    $(id).children(".msg-details").children(".edit-msg").replaceWith(htmltext);
    isclicked = false;
  }
});

//When input field is submitted on edited message
$(document).on("keypress", ".edit-msg", function(event) {
  if(event.which == 13){
    //Writitng the new message to the database
    let ref = rtdb.ref(db, `/Chat/${msgID}/msg`);
    let newMsg = $(".edit-msg").val()
    rtdb.set(ref, newMsg).then(() => {
      loadMsgs();
    })
    .catch(() => {
      //Catching any errors and making message red
      let id = "#" + msgID
      $(id).css( "background-color", "rgba(255, 0, 0, 0.4)" );
      setTimeout(() => {
        $(id).removeAttr('style');
      }, 1000)
    });
    isclicked = false;

  }
});