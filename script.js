const printOptions = document.getElementsByName("print");
const copiesInput = document.getElementById("copies");
const totalPrice = document.getElementById("totalPrice");

function calculatePrice() {

let price = 5;

if (printOptions[1].checked) {
price = 10;
}

let copies = parseInt(copiesInput.value);

totalPrice.innerHTML = "₹ " + (price * copies);

}

printOptions.forEach(radio=>{
radio.addEventListener("change",calculatePrice);
});

copiesInput.addEventListener("input",calculatePrice);

calculatePrice();
