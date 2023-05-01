const accessToken = localStorage.getItem('accessToken');
const errorMessage = document.getElementById('error-message');
const form = document.querySelector('#upload-form');
const fileInput = document.querySelector('input[name="fileupload"]');

let headers = {
  'Authorization': `Bearer ${accessToken}`
};

fetch('/get-task-list-by-user', { headers })
  .then(response => response.json())
  .then(data => {
    let numFiles = document.querySelector("#numFiles");
    console.log(numFiles);
    console.log(data.length);
    numFiles.textContent = 'Number of files uploaded ' + (data.length - 1);
    console.log("Received array from server:");
    console.log(data);

    let shifted = false;
    data.forEach(x => {
      if (x === 'Shift') {
        shifted = true;
        let text = document.createElement('p');
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

  const formData = new FormData();
  formData.append('fileupload', fileInput.files[0]);

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
});

function downloadFileFromServer(e) {
  console.log(e.target.id);
  headers = {
    'url': e.target.id
  };
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '/download', true);
  xhr.responseType = 'blob';
  xhr.onload = function () {
    if (xhr.status === 200) {
      // Create a download link and click it programmatically to initiate download
      const url = window.URL.createObjectURL(xhr.response);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.href = url;
      a.download = e.target.id;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };
  xhr.send();
}


function download(index) {
  const downloadLink = document.createElement('a');

  //Takes an array of arrays and turns it into a csv file, should probably be removed when Viktor has his stuff.
  const csvBlob = new Blob([arrays[index].map(line => line.join(',')).join('\n')], { type: 'text/csv' });

  const csvUrl = URL.createObjectURL(csvBlob);

  downloadLink.href = csvUrl;
  downloadLink.download = files[index].name;

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

/*function Button() {
  let arrays = 0;
  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = `Download File ${arrays.length}`;
  arrays++;
  downloadBtn.classList.add('download-button'); // Add a CSS class to the button
  downloadBtn.addEventListener('click', (event) => {
    const index = parseInt(event.target.textContent.split(' ')[2]) - 1;
    download(index);
    document.getElementById('download-rdy').textContent = `Your file "${files[index].name}" is ready to be downloaded.`; //To be changed later
  })
  document.body.appendChild(downloadBtn);
}*/

function logError() {
  errorMessage.textContent = "Not a valid .csv file"
  errorMessage.style.opacity = 1;
}

