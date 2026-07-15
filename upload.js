// ================= VARIABLES =================

const orderButton = document.getElementById("orderBtn");

const fileInput = document.getElementById("file");

const paymentRadios = document.getElementsByName("payment");

const upiBox = document.getElementById("upiBox");

let detectedPages = 1;


// ================= PAYMENT =================

paymentRadios.forEach(radio=>{

    radio.addEventListener("change",()=>{

        if(
            radio.value==="UPI" &&
            radio.checked
        ){

            upiBox.style.display="block";

        }
        else{

            upiBox.style.display="none";

        }

    });

});



// ================= PLACE ORDER =================

orderButton.addEventListener("click",async()=>{


    console.log("ORDER START");


    const selectedFile=fileInput.files[0];


    if(!selectedFile){

        alert("Please Select File");

        return;

    }



    let uploadFile = selectedFile;



    // ================= USE MANUAL CROPPED FILE =================


    if(typeof croppedFile !== "undefined" && croppedFile){

        uploadFile = croppedFile;

        console.log("Uploading Cropped File");

    }



    // ================= FILE NAME =================


    const cleanFileName = selectedFile.name

        .replace(/\s+/g, "_")

        .replace(/[^a-zA-Z0-9._-]/g, "");



    const newFileName =

        Date.now() + "_" + cleanFileName;



    // ================= UPLOAD =================


    console.log("UPLOAD START");


    const { error: uploadError } =


    await supabaseClient.storage


    .from("documents")


    .upload(

        newFileName,

        uploadFile,

        {

            cacheControl:"3600",

            upsert:false

        }

    );



    if(uploadError){


        console.log(uploadError);

        alert("Upload Failed");

        return;


    }




    // ================= PUBLIC URL =================


    const {data:urlData}=


    supabaseClient.storage


    .from("documents")


    .getPublicUrl(newFileName);



    const fileURL = urlData.publicUrl;




    // ================= PRINT TYPE =================


    let printType="Black & White";


    if(printRadios[1].checked){

        printType="Color";

    }





    // ================= ORDER DATA =================


    const copies =

    parseInt(copiesInput.value)||1;



    const amount =

    parseInt(

        totalDisplay.innerText.replace("₹","")

    );





    const {error:orderError}=


    await supabaseClient


    .from("orders")


    .insert([{


        file_name:newFileName,


        file_url:fileURL,


        service:document.getElementById("service").value,


        print_type:printType,


        copies:copies,


        page_count:pageCount,


        amount:amount,


        payment:document.querySelector(

            'input[name="payment"]:checked'

        ).value,


        status:"New",


        print_status:"Pending"


    }]);





    if(orderError){


        console.log(orderError);


        alert(orderError.message);


        return;


    }





    alert("✅ Order Placed Successfully");


    location.reload();



});