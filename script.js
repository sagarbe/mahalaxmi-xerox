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


// ================= LOAD PRICE =================

async function loadPrices() {


    const { data, error } =
    await supabaseClient
    .from("settings")
    .select("*")
    .eq("id",1)
    .single();



    if(error){

        console.log(error.message);

        calculate();

        return;

    }



    bwPrice = Number(data.bw_price);

    colorPrice = Number(data.color_price);



    console.log("B/W Price:", bwPrice);

    console.log("Color Price:", colorPrice);



    calculate();


}



// ================= FILE SELECT =================

printFileInput.addEventListener("change", () => {


    if(printFileInput.files.length > 0){

        fileNameDisplay.innerText =
        printFileInput.files[0].name;

    }
    else{

        fileNameDisplay.innerText =
        "No file selected";

    }


    pagesDisplay.innerText = pageCount;


    calculate();


});




// ================= CALCULATE =================

function calculate(){


    let price = bwPrice;



    if(printRadios[1].checked){

        price = colorPrice;

    }



    rateDisplay.innerText =
    "₹" + price;



    const copies =
    parseInt(copiesInput.value) || 1;



    const total =
    price * pageCount * copies;



    totalDisplay.innerText =
    "₹" + total;


}




// ================= PRINT TYPE =================

printRadios.forEach(radio => {


    radio.addEventListener(
        "change",
        calculate
    );


});




// ================= COPIES =================

copiesInput.addEventListener(
    "input",
    calculate
);




// ================= REALTIME PRICE UPDATE =================

supabaseClient
.channel("price-update")
.on(
    "postgres_changes",
    {
        event:"UPDATE",
        schema:"public",
        table:"settings",
        filter:"id=eq.1"
    },
    (payload)=>{


        console.log(
            "LIVE PRICE UPDATE:",
            payload.new
        );



        bwPrice =
        Number(payload.new.bw_price);



        colorPrice =
        Number(payload.new.color_price);



        calculate();


    }
)
.subscribe();




// ================= START =================

loadPrices();