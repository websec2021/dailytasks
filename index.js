// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


//The Basics of Client-Side Web Dev
//Jquery for updating name, color, and birthday
$("#name").change(function(){
    $("#output-name").html($("#name").val());
});

$("#color").change(function(){
    $(".input-container").css("background-color", $("#color").val())
    $("#output-color").html("In hex:" + $("#color").val()); 
});

$("#birthday").change(function(){
    $("#output-birthday").html($("#birthday").val());
});

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
let msgRef = rtdb.ref(db, "/Chat");


// submit funciton
// Listens for a submit on the input id #messageForm
// which is where the user enters a message, and adds that 
// Message along with their name to the rtdb
$("#messageForm").submit(function(event){
    let name = $("#name").val()
    if(name == "") {
      alert("Please input your name above");
      return false;
    } 
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

    let userColor = colorNames(name)
    let time = getTime();
    console.log(time);

    rtdb.push(msgRef, {
      name : name,
      msg : text,
      color : userColor,
      time : time
    });

  $("#msg-input").val("");
});


// reloadMsgs:
// Populates the chat app window with all the 
// messages in the rtdb once a new one is added
// or when the page is first loaded.
let loadMsgs = function() {
  rtdb.onValue(msgRef, data => {
    $("#messages").empty();

    $("#messages").append(
      `<li class="msg">
        <i class="name-date">
            <i class="name" style="font-weight: bold">Host: </i>
            <i class="msg-date"></i>
        </i>
        <i class="msg-text"> Hello and Welcome!</i>
      </li>`
    );

    data.forEach(userSnapshot => {
        let name = userSnapshot.val().name;
        let msg = userSnapshot.val().msg;
        let color = userSnapshot.val().color;
        let time = userSnapshot.val().time;
        let key = userSnapshot.key;
        
        event.preventDefault();

        if(getTime().day == time.day){
          $("#messages").append(
            `<li class="msg" id=${key}>
              <i class="name-date"> 
                <i class="name" style="color:${color}; font-weight: bold;">${name}: </i>
                <i class="msg-date"> ${time.hour}:${time.minute} ${time.midday}</i>
              </i>
              <i class="msg-text"> ${msg} </i>
            </li>`
          );
        }
        else{
          $("#messages").append(
            `<li class="msg" id=${key}>
              <i class="name-date"> 
                <i class="name" style="color:${color}; font-weight: bold;">${name}: </i>
                <i class="msg-date"> ${time.day} ${time.hour}:${time.minute} ${time.midday}</i>
              </i>
              <i class="msg-text"> ${msg} </i>
            </li>`
          );
        }
        
    });
    
});
};

// colorNames: Takes in a string (name)
// This function iterates through the messages in the rtdb
// and searches to see if that name belongs to a message,
// if it does, it returns that users color.
// If that name does not exist it generates a color for that user
let colorNames = function(name) {
  let color = "";
  rtdb.onValue(msgRef, data => {
    data.forEach(userSnapshot => {
        let user = userSnapshot.val().name;

        if(user == name){
          color = userSnapshot.val().color;
        }
    });  
  });
  if (color == ""){
    var randomColor = Math.floor(Math.random()*16777215).toString(16);
    return "#" + randomColor; 
  }
  else {
    return color;
  }
};


// getTime: 
// This function gets the day, hour, minute, and midday
// of the current day and returns those values in an
// object.
// returns an object: {string, int, int, string}
let getTime = function(){
  var d = new Date();
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






