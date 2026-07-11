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

    const { data, error } = await supabaseClient
        .from("settings")
        .select("*")
        .eq("id", 1)
        .single();

    if (error) {
        console.log(error.message);
        calculate();
        return;
    }

    bwPrice = Number(data.bw_price);
    colorPrice = Number(data.color_price);

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