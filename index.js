
function changeBackgroundColor() {
    var name = document.getElementById("name").value;
    var color = document.getElementById("color").value;
    var birthday = document.getElementById("birthday").value;

    elements = document.getElementsByClassName("input-container")
    
    for(var i = 0; i < elements.length; i++){
        elements[i].style.backgroundColor = color;
    }

    document.getElementById("output-name").innerHTML = name;
    document.getElementById("output-color").innerHTML = "In Hex: " + color
    document.getElementById("output-birthday").innerHTML = birthday;

}
  
