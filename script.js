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

const cropBox = document.getElementById("cropBox");

const p1 = document.getElementById("p1");
const p2 = document.getElementById("p2");
const p3 = document.getElementById("p3");
const p4 = document.getElementById("p4");


let croppedFile = null;

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


    pageCount = 1;

    pagesDisplay.innerText = pageCount;


    const service = serviceSelect.value;


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


    const file = printFileInput.files[0];


    if(!file){

        fileNameDisplay.innerText="No file selected";

        previewImage.src="";

        cropBox.style.display="none";

        return;

    }



    fileNameDisplay.innerText=file.name;



    if(file.type.startsWith("image/")){


        const reader = new FileReader();



        reader.onload=function(e){


            previewImage.src=e.target.result;


            previewImage.onload=function(){


                cropBox.style.display="block";


                resetCropPoints();


            };


        };



        reader.readAsDataURL(file);


    }
    else{


        previewImage.src="";

        cropBox.style.display="none";


    }



    calculate();


});

// ================= MANUAL CROP POINT POSITION =================


function resetCropPoints(){


    p1.style.left="0%";
    p1.style.top="0%";


    p2.style.right="0%";
    p2.style.top="0%";


    p3.style.right="0%";
    p3.style.bottom="0%";


    p4.style.left="0%";
    p4.style.bottom="0%";


}



// ================= DRAG POINT FUNCTION =================


function dragPoint(point){


    point.addEventListener("mousedown",(e)=>{


        e.preventDefault();



        function move(ev){


            const rect = previewImage.getBoundingClientRect();



            let x =
            ((ev.clientX - rect.left) / rect.width) * 100;



            let y =
            ((ev.clientY - rect.top) / rect.height) * 100;



            if(x<0) x=0;

            if(x>100) x=100;


            if(y<0) y=0;

            if(y>100) y=100;



            point.style.left=x+"%";

            point.style.top=y+"%";



        }



        function stop(){


            document.removeEventListener(
                "mousemove",
                move
            );


            document.removeEventListener(
                "mouseup",
                stop
            );


        }



        document.addEventListener(
            "mousemove",
            move
        );


        document.addEventListener(
            "mouseup",
            stop
        );



    });



}





dragPoint(p1);

dragPoint(p2);

dragPoint(p3);

dragPoint(p4);




// ================= CALCULATE =================


function calculate(){


    let price=bwPrice;



    if(printRadios[1].checked){

        price=colorPrice;

    }



    rateDisplay.innerText="₹"+price;



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


printFileInput.addEventListener(
"change",
async()=>{


const file=printFileInput.files[0];


if(!file)return;



if(file.type==="application/pdf"){


try{


const buffer =
await file.arrayBuffer();



const pdf =
await pdfjsLib.getDocument({
data:buffer
}).promise;



pageCount=pdf.numPages;



}
catch(err){


console.log(err);


pageCount=1;


}


}
else{


pageCount=1;


}



pagesDisplay.innerText=pageCount;


calculate();



});

// ================= APPLY CROP =================

const cropBtn = document.getElementById("applyCrop");

cropBtn.addEventListener("click",()=>{


if(!previewImage.src){

alert("Upload image first");

return;

}


const img = new Image();

img.src = previewImage.src;


img.onload = ()=>{


const imgRect = previewImage.getBoundingClientRect();

const scaleX = img.naturalWidth / imgRect.width;
const scaleY = img.naturalHeight / imgRect.height;


// crop box position

const box = cropBox.getBoundingClientRect();


const x =
(box.left - imgRect.left) * scaleX;


const y =
(box.top - imgRect.top) * scaleY;


const width =
box.width * scaleX;


const height =
box.height * scaleY;



const canvas =
document.createElement("canvas");


canvas.width = width;

canvas.height = height;


const ctx =
canvas.getContext("2d");



ctx.drawImage(

img,

x,
y,

width,
height,

0,
0,

width,
height

);


console.log("Crop Canvas Size:", canvas.width, canvas.height);
canvas.toBlob((blob)=>{


croppedFile = new File(

[blob],

"cropped.jpg",

{
type:"image/jpeg"
}

);



const reader = new FileReader();

reader.onload = function(e){

    previewImage.src = e.target.result;

};

reader.readAsDataURL(croppedFile);



console.log(
"FINAL CROPPED FILE",
croppedFile
);



alert("✅ Crop Applied Successfully");


},

"image/jpeg",

0.95);



};



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