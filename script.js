const printFileInput = document.getElementById("file");

const fileNameDisplay = document.getElementById("fileName");

const copiesInput = document.getElementById("copies");

const printRadios = document.getElementsByName("print");

const totalDisplay = document.getElementById("totalPrice");

const rateDisplay = document.getElementById("rate");

const pagesDisplay = document.getElementById("pages");

let pageCount = 1;


printFileInput.addEventListener("change", () => {

    if (printFileInput.files.length > 0) {

        fileNameDisplay.innerHTML = printFileInput.files[0].name;

    }

});


function calculate() {

    let price = 5;

    if (printRadios[1].checked) {

        price = 10;

    }

    rateDisplay.innerHTML = "₹" + price;

    let totalAmount = price * pageCount * parseInt(copiesInput.value);

    totalDisplay.innerHTML = "₹" + totalAmount;

}


printRadios.forEach(radio => {

    radio.addEventListener("change", calculate);

});


copiesInput.addEventListener("input", calculate);


calculate();
