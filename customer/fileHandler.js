const fileInput = document.querySelector('input');
//Change skal måske ændres til submit
fileInput.addEventListener("change", e => {
  e.preventDefault();

  const endpoint = "../master/queue.js";
  const formData = new FormData();

  console.log(fileInput.files);
  formData.append("fileInput", fileInput.files[0])

  fetch(endpoint, {
    method: "post",
    body: formData
  }).catch(console.error);
})




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

function Button() {
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
}



