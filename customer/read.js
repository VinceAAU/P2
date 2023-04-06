const fileInput = document.querySelector('input');
const preview = document.getElementById('preview');
let csv;

//Saves a csv file in arrays and splits it up by comma
fileInput.addEventListener('change', () => {
    const fr = new FileReader();
    fr.readAsText(fileInput.files[0]);

    fr.addEventListener('load', () => {
        const csv = fr.result;

        array = csv.split('\r\n').map((line) => {
            return line.split(',');
        });

        console.log(array);
    })
})

function download() {
    const downloadLink = document.createElement('a');

    // Create the CSV file as a Blob
    const csvBlob = new Blob([array.join('\n')], { type: 'text/csv' });

    // Create a URL for the Blob
    const csvUrl = URL.createObjectURL(csvBlob);

    // Set the download link href to the URL
    downloadLink.href = csvUrl;

    // Set the download link download attribute to the filename
    downloadLink.download = fileInput.files[0].name;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
} 