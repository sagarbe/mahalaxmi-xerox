// ================= VARIABLES =================

const serviceSelect = document.getElementById("service");
const printFileInput = document.getElementById("file");
const fileNameDisplay = document.getElementById("fileName");
const copiesInput = document.getElementById("copies");
const printRadios = document.getElementsByName("print");
const totalDisplay = document.getElementById("totalPrice");
const rateDisplay = document.getElementById("rate");
const pagesDisplay = document.getElementById("pages");
const previewImage = document.getElementById("previewImage");
const printArea = document.getElementById("printArea");

let cropper = null;
let croppedImage = null;

let pageCount = 1;

let bwPrice = 5;
let colorPrice = 10;


// ================= LOAD PRICE =================

async function loadPrices(){

    const {data,error} = await supabaseClient
    .from("settings")
    .select("*")
    .eq("id",1)
    .single();

    if(error){

        console.log(error);

        calculate();

        return;

    }

    bwPrice = Number(data.bw_price);
    colorPrice = Number(data.color_price);

    calculate();

}



// ================= SERVICE CHANGE =================

serviceSelect.addEventListener("change",()=>{

    pageCount=1;

    pagesDisplay.innerText=pageCount;

    const service=serviceSelect.value;

    if(
        service==="aadhaar" ||
        service==="pan"
    ){

        printArea.style.width="4.5in";
        printArea.style.height="3in";

    }
    else{

        printArea.style.width="100%";
        printArea.style.height="auto";

    }

    calculate();

});



// ================= FILE SELECT =================

printFileInput.addEventListener("change",()=>{

    const file=printFileInput.files[0];

    if(!file){

        fileNameDisplay.innerText="No file selected";

        previewImage.src="";

        if(cropper){

            cropper.destroy();

            cropper=null;

        }

        return;

    }

    fileNameDisplay.innerText=file.name;

        if(file.type.startsWith("image/")){

        const reader = new FileReader();

        reader.onload = function(e){

            previewImage.src = e.target.result;

            previewImage.onload = function(){

                if(cropper){

                    cropper.destroy();

                }

                cropper = new Cropper(previewImage,{

                    viewMode:1,

                    autoCropArea:1,

                    responsive:true,

                    movable:true,

                    zoomable:true,

                    cropBoxMovable:true,

                    cropBoxResizable:true,

                    background:false

                });

            };

        };

        reader.readAsDataURL(file);

    }

    else{

        previewImage.src="";

        if(cropper){

            cropper.destroy();

            cropper=null;

        }

    }

    calculate();

});



// ================= CALCULATE =================

function calculate(){

    let price = bwPrice;

    if(printRadios[1].checked){

        price = colorPrice;

    }

    rateDisplay.innerText = "₹"+price;

    const copies =
    parseInt(copiesInput.value)||1;

    const total =
    price *
    pageCount *
    copies;

    totalDisplay.innerText =
    "₹"+total;

}



// ================= PRINT TYPE =================

printRadios.forEach(radio=>{

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

// ================= PDF PAGE COUNT =================

printFileInput.addEventListener("change", async () => {

    const file = printFileInput.files[0];

    if (!file) return;

    if (file.type === "application/pdf") {

        try {

            const buffer = await file.arrayBuffer();

            const pdf = await pdfjsLib.getDocument({
                data: buffer
            }).promise;

            pageCount = pdf.numPages;

        }
        catch (err) {

            console.log(err);

            pageCount = 1;

        }

    }
    else {

        pageCount = 1;

    }

    pagesDisplay.innerText = pageCount;

    calculate();

});



// ================= REALTIME PRICE =================

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

    bwPrice = Number(payload.new.bw_price);

    colorPrice = Number(payload.new.color_price);

    calculate();

}

)

.subscribe();



// ================= GET CROPPED IMAGE =================

function getCroppedImage(){

    if(!cropper){

        return null;

    }

    const canvas = cropper.getCroppedCanvas({

        imageSmoothingEnabled:true,

        imageSmoothingQuality:"high"

    });

    return canvas.toDataURL(
        "image/jpeg",
        0.95
    );

}



// ================= START =================

loadPrices();

// ================= APPLY CROP =================

const cropBtn = document.getElementById("applyCrop");

if (cropBtn) {

    cropBtn.addEventListener("click", () => {

        if (!cropper) {

            alert("Please upload an image first.");

            return;

        }

        const canvas = cropper.getCroppedCanvas({

            imageSmoothingEnabled: true,

            imageSmoothingQuality: "high"

        });

        previewImage.src = canvas.toDataURL("image/jpeg", 0.95);

        cropper.destroy();

        cropper = null;

        alert("✅ Crop Applied");

    });

}