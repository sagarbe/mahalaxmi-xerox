const printFileInput = document.getElementById("file");
const fileNameDisplay = document.getElementById("fileName");

const copiesInput = document.getElementById("copies");
const printRadios = document.getElementsByName("print");

const totalDisplay = document.getElementById("totalPrice");
const rateDisplay = document.getElementById("rate");
const pagesDisplay = document.getElementById("pages");

let pageCount = 1;

let bwPrice = 5;
let colorPrice = 10;

// LOAD PRICE FROM SUPABASE
async function loadPrices() {


    const { data, error } =
    await supabaseClient
    .from("settings")
    .select("*");



    if(error){

        console.log(error.message);

        calculate();

        return;

    }

    

    data.forEach(item => {


        if(item.key === "bw_price"){

            bwPrice = Number(item.value);

        }



        if(item.key === "color_price"){

            colorPrice = Number(item.value);

        }


    });

    console.log("B/W Price:", bwPrice);
    console.log("Color Price:", colorPrice);

    calculate();


}

// FILE SELECT
printFileInput.addEventListener("change", () => {

    if (printFileInput.files.length > 0) {
        fileNameDisplay.innerText = printFileInput.files[0].name;
    } else {
        fileNameDisplay.innerText = "No file selected";
    }

    pagesDisplay.innerText = pageCount;

    calculate();

});

// CALCULATE TOTAL
function calculate() {

    let price = bwPrice;

    if (printRadios[1].checked) {
        price = colorPrice;
    }

    rateDisplay.innerText = "₹" + price;

    const copies = parseInt(copiesInput.value) || 1;

    const total = price * pageCount * copies;

    totalDisplay.innerText = "₹" + total;

}

// EVENTS
printRadios.forEach(radio => {
    radio.addEventListener("change", calculate);
});

copiesInput.addEventListener("input", calculate);

// START
loadPrices();