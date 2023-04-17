console.log("init");
const checkbox = document.querySelector("#startButton");

checkbox.addEventListener("click", checkboxClick, false);

function checkboxClick(event) {
    event.preventDefault();
    toggleLogin(event)
}

async function toggleLogin(event){ // async await 
    console.log ("funcS");
    const button = document.querySelector("#submitBtn_id");
    
    var username = document.getElementById("name_id");
    var password = document.getElementById("password_id");
    console.log(username['value'] + password['value'])

    const bodyData = new URLSearchParams();
    bodyData.append('username', username['value']);
    bodyData.append('password', password['value']);

    fetch('/worker/html/test-fetch', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: bodyData
    })
    .then(response => console.log(response))    

    //var responsedata = response.stringify() //response.body 
    //.then(response => console.log(response))
    //.catch(err => console.log(err));
    //console.log(response);
    //console.log(responsedata);
 
}

async function fetchData(bodyData){
    
    return(response);
}

function throwError(){
    let warn = "preventDefault() won't let you check this!<br>";
    document.getElementById("id1").innerHTML += warn;
}