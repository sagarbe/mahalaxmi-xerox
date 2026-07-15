
// ================= CARD RESIZE =================

function resizeCardImage(dataUrl){

    return new Promise(resolve=>{


        const img = new Image();


        img.onload=function(){


            const canvas =
            document.createElement("canvas");


            // 4.5 x 3 inch ratio
            // 300 DPI approx

            canvas.width = 1350;
            canvas.height = 900;



            const ctx =
            canvas.getContext("2d");



            ctx.fillStyle = "white";

            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );



            ctx.drawImage(

                img,

                0,

                0,

                canvas.width,

                canvas.height

            );



            resolve(

                canvas.toDataURL(
                    "image/jpeg",
                    0.95
                )

            );


        };



        img.src = dataUrl;


    });

}
const orderButton = document.getElementById("orderBtn");

const fileInput = document.getElementById("file");

const paymentRadios = document.getElementsByName("payment");



const upiBox = document.getElementById("upiBox");

let detectedPages = 1;


// ---------------- PDF PAGE COUNT ----------------


fileInput.addEventListener("change", async () => {


    const file = fileInput.files[0];


    if(!file) return;



    if(file.type === "application/pdf"){


        try{


            const buffer = await file.arrayBuffer();


            const pdf =
            await pdfjsLib.getDocument({
                data:buffer
            }).promise;



            detectedPages = pdf.numPages;



        }
        catch(err){


            console.log(err);

            detectedPages = 1;


        }



    }
    else{


        detectedPages = 1;


    }



    pagesDisplay.innerText = detectedPages;


    pageCount = detectedPages;



    if(typeof calculate === "function"){

        calculate();

    }


});






// ---------------- PAYMENT ----------------


paymentRadios.forEach(radio=>{


    radio.addEventListener("change",()=>{


        if(radio.value==="UPI" && radio.checked){


            upiBox.style.display="block";


        }
        else{


            upiBox.style.display="none";


        }


    });


});







// ---------------- PLACE ORDER ----------------


orderButton.addEventListener("click", async()=>{


    const selectedFile =
    fileInput.files[0];



    if(!selectedFile){


        alert("Please select a file");

        return;


    }





    // ================= IMAGE ENHANCE =================


    let uploadFile = selectedFile;



    if(selectedFile.type.startsWith("image/")){


        try{


            let finalImage;


try{

    finalImage =
    await startScanner(selectedFile);

}
catch(err){

    console.log(
        "Scanner failed, using original image"
    );

    finalImage =
    URL.createObjectURL(selectedFile);

}



const service =
document.getElementById("service").value;



// Aadhaar / PAN Resize

if(
    service==="aadhaar" ||
    service==="pan"
){


    finalImage =
    await resizeCardImage(enhancedImage);


}




const response =
await fetch(finalImage);



            const blob =
            await response.blob();




            uploadFile =
            new File(

                [blob],

                selectedFile.name,

                {
                    type:"image/jpeg"
                }

            );



            console.log(
                "Enhanced Image Ready"
            );



        }
        catch(err){


            console.log(
                "Enhance Failed",
                err
            );


        }


    }






    // ---------------- FILE NAME ----------------


    const cleanFileName =
    selectedFile.name
    .replace(/\s+/g,"_")
    .replace(/[^a-zA-Z0-9._-]/g,"");



    const newFileName =
    Date.now()+"_"+cleanFileName;








    // ---------------- UPLOAD ----------------



    const {error:uploadError} =

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


        alert("Upload Failed");

        console.log(uploadError);

        return;


    }







    // ---------------- URL ----------------



    const {data} =

    supabaseClient.storage

    .from("documents")

    .getPublicUrl(newFileName);



    const fileURL =
    data.publicUrl;









    // ---------------- PRINT TYPE ----------------



    let printType =
    "Black & White";



    if(printRadios[1].checked){


        printType="Color";


    }







    // ---------------- COPIES ----------------



    const copies =
    parseInt(copiesInput.value) || 1;







    // ---------------- AMOUNT ----------------



    const amount =

    parseInt(

        totalDisplay.innerText
        .replace("₹","")

    );








    // ---------------- INSERT ORDER ----------------



    const {error:orderError}=

    await supabaseClient

    .from("orders")

    .insert([

    {


        file_name:newFileName,


        file_url:fileURL,


        service:
        document.getElementById("service").value,



        print_type:printType,



        copies:copies,



        page_count:detectedPages,



        amount:amount,



        payment:

        document.querySelector(
        'input[name="payment"]:checked'
        ).value,



        status:"New",



        print_status:"Pending"



    }


    ]);







    if(orderError){


        alert(orderError.message);

        console.log(orderError);

        return;


    }






    alert("✅ Order Placed Successfully");



    location.reload();



});