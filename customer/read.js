const fileInput = document.querySelector('input');
const preview = document.getElementById('preview');
let arrays = [];
let files = []; // Array to store uploaded files

// Saves a csv file in arrays and splits it up by comma
fileInput.addEventListener('change', () => {
    const fr = new FileReader();
    const uploadedFiles = fileInput.files; // Store uploaded files in a variable
  
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
  
      fr.readAsText(file);
  
      fr.addEventListener('load', () => {
        const csv = fr.result;
  
        const array = csv.split('\r\n').map((line) => {
          return line.split(',');
        });
        arrays.push(array);
        files.push(file); // Store the uploaded file in the files array
        addTaskCustomerQueue(file);
  
        document.getElementById('numFiles').textContent = `Number of files uploaded ${arrays.length}`;
  
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = `Download File ${arrays.length}`;
        downloadBtn.addEventListener('click', (event) => {
          const index = parseInt(event.target.textContent.split(' ')[2]) - 1;
          download(index);
        });
  
        document.body.appendChild(downloadBtn);
      });
    }
  });

function download(index) {
    if (arrays.length > index && files.length > index) {
      const downloadLink = document.createElement('a');
  
      const csvBlob = new Blob([arrays[index].map(line => line.join(',')).join('\n')], { type: 'text/csv' });
  
      const csvUrl = URL.createObjectURL(csvBlob);
  
      downloadLink.href = csvUrl;
      downloadLink.download = files[index].name;
  
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      console.error(`File not found for index ${index}`);
    }
  }