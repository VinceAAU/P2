const accessToken = localStorage.getItem('accessToken');
const errorMessage = document.getElementById('error-message');
const form = document.querySelector('#upload-form');
const fileInput = document.querySelector('input[name="fileupload"]');
const realFileBtn = document.getElementById("file-input");
const customBtn = document.getElementById("custom-button");
const customTxt = document.getElementById("nameofFiles");

let headers = {
  'Authorization': `Bearer ${accessToken}`
};

fetch('/get-task-list-by-user', { headers })
  .then(response => response.json())
  .then(data => {
    let numFiles = document.querySelector("#numFiles");
    console.log(numFiles);
    console.log(data.length);
    numFiles.textContent = 'Number of files uploaded: ' + (data.length - 1);
    console.log("Received array from server:");
    console.log(data);

    let shifted = false;
    data.forEach(x => {
      if (x === 'Shift') {
        shifted = true;
        let text = document.createElement('h2');
        text.textContent = "In progress:";
        document.body.appendChild(text);
      } else {
        let text = document.createElement('p');
        text.textContent = x;
        document.body.appendChild(text);
        if (shifted === false) {
          let downloadButton = document.createElement('button');
          downloadButton.textContent = 'Download file';
          downloadButton.id = x;
          downloadButton.classList.add('downloadButtons');
          downloadButton.addEventListener("click", downloadFileFromServer);
          document.body.appendChild(downloadButton);
        }
      }
    });


  })
  .catch(error => console.log(error));

//Gives a warning when user inputs a non csv file
const fileupload = document.querySelector('input');
fileupload.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file.type !== 'text/csv') {
    fileupload.value = "";
    alert("Please pick a csv file");
  }
})


form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (realFileBtn.value === '') {
    logError();
  } else {
    const formData = new FormData();
  formData.append('fileupload', realFileBtn.files[0]);
  realFileBtn.value = ''; // clear chosen file field
  try {
    const response = await fetch('/upload', {
      method: 'POST',
      headers,
      body: formData
    });
    if (response.status !== 204) {
      console.log(response.status)
      logError()
    }
  } catch (error) {
    console.log(error)
  }
    location.reload();
  }
  
});

async function downloadFileFromServer(e) {
  console.log(e.target.id);
  headers = {
    "Authorization": `Bearer ${accessToken}`,
    'url': e.target.id
  };
  await fetch('/download', { headers })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.blob();
    })
    .then(blob => {
      // Create a download link and click it programmatically to initiate download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.href = url;
      a.download = e.target.id;
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
    location.reload();
}


function logError() {
  errorMessage.textContent = "Not a valid .csv file"
  errorMessage.style.opacity = 1;
}


//Makes sure the pseudo button activates the real button
customBtn.addEventListener("click", function(){
    realFileBtn.click();
})

//This is what changes the file name
realFileBtn.addEventListener("change", function(){
  if (realFileBtn.value) {
//That long weird text is neccesary, makes it so the file path is not shown and only the name
    customTxt.innerHTML = realFileBtn.value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];
  } else {
    customTxt.innerHTML = "No file chosen, yet.";
  }
})