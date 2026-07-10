const printFileInput = document.getElementById("file");
const fileNameDisplay = document.getElementById("fileName");

const copiesInput = document.getElementById("copies");
const printRadios = document.getElementsByName("print");

const totalDisplay = document.getElementById("totalPrice");
const rateDisplay = document.getElementById("rate");
const pagesDisplay = document.getElementById("pages");

let pageCount = 1;

// File Name
printFileInput.addEventListener("change", () => {

    if (printFileInput.files.length > 0) {
        fileNameDisplay.textContent = printFileInput.files[0].name;
    } else {
        fileNameDisplay.textContent = "No file selected";
    }

    pagesDisplay.textContent = pageCount;

    calculate();

});

// Calculate Price
function calculate() {

    let price = 5;

    if (printRadios[1].checked) {
        price = 10;
    }

    rateDisplay.textContent = "₹" + price;

    const copies = parseInt(copiesInput.value) || 1;

    const total = price * pageCount * copies;

    totalDisplay.textContent = "₹" + total;
}

printRadios.forEach(radio => {
    radio.addEventListener("change", calculate);
});

copiesInput.addEventListener("input", calculate);

calculate();
