const accessToken = localStorage.getItem('accessToken');

const headers = {
  'Authorization': `Bearer ${accessToken}`
};

fetch('/get-task-list-by-user', { headers })
  .then(response => response.json())
  .then(data => {
    console.log("Received array from server:");
    console.log(data);

  })
  .catch(error => console.error(error));

  const form = document.querySelector('#upload-form');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.querySelector('input[name="fileupload"]');
    const formData = new FormData();
    formData.append('fileupload', fileInput.files[0]);

    try {
      const response = await fetch('/customer/costumerPage/upload', {
        method: 'POST',
        headers,
        body: formData
      });

      // handle response
    } catch (error) {
      // handle error
    }
  });



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
