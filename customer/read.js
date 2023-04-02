const fileInput = document.querySelector('input');
const preview = document.getElementById('preview');


//Saves a csv file in arrays and splits it up by comma
fileInput.addEventListener('change', () => {
    const fr = new FileReader();
    fr.readAsText(fileInput.files[0]);

    fr.addEventListener('load', () => {
        const csv = fr.result;

        const array = csv.split('\r\n').map((line) => {
            return line.split(',');
        });

        console.log(array);
    })
})