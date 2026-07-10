const fileInput=document.getElementById("file");

const fileName=document.getElementById("fileName");

const copies=document.getElementById("copies");

const radios=document.getElementsByName("print");

const total=document.getElementById("totalPrice");

const rate=document.getElementById("rate");

const pages=document.getElementById("pages");

let pageCount=1;

fileInput.addEventListener("change",()=>{

if(fileInput.files.length>0){

fileName.innerHTML=fileInput.files[0].name;

}

});

function calculate(){

let price=5;

if(radios[1].checked){

price=10;

}

rate.innerHTML="₹"+price;

let totalAmount=price*pageCount*parseInt(copies.value);

total.innerHTML="₹"+totalAmount;

}

radios.forEach(r=>{

r.addEventListener("change",calculate);

});

copies.addEventListener("input",calculate);

calculate();
