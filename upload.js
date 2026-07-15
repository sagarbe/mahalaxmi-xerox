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

    let uploadFile=selectedFile;



    // ================= USE CROPPED IMAGE =================

    if(
        selectedFile.type.startsWith("image/") &&
        cropper
    ){

        const canvas=
        cropper.getCroppedCanvas({

            imageSmoothingEnabled:true,

            imageSmoothingQuality:"high"

        });

        const blob=
        await new Promise(resolve=>

            canvas.toBlob(
                resolve,
                "image/jpeg",
                0.95
            )

        );

        uploadFile=
        new File(

            [blob],

            selectedFile.name,

            {

                type:"image/jpeg"

            }

        );

        console.log("Manual Crop Ready");

    }



    // Aadhaar Resize

    if(
        document.getElementById("service").value==="aadhaar" ||
        document.getElementById("service").value==="pan"
    ){

        const response=
        await fetch(
            URL.createObjectURL(uploadFile)
        );

        const blob=
        await response.blob();

        const dataUrl=
        await new Promise(resolve=>{

            const r=new FileReader();

            r.onload=e=>resolve(e.target.result);

            r.readAsDataURL(blob);

        });

        const resized=
        await resizeCardImage(dataUrl);

        const res=
        await fetch(resized);

        const finalBlob=
        await res.blob();

        uploadFile=
        new File(

            [finalBlob],

            selectedFile.name,

            {

                type:"image/jpeg"

            }

        );

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

            cacheControl: "3600",

            upsert: false

        }

    );



    if(uploadError){

        console.log(uploadError);

        alert("Upload Failed");

        return;

    }



    // ================= PUBLIC URL =================

    const { data } =

    supabaseClient.storage

    .from("documents")

    .getPublicUrl(newFileName);



    const fileURL = data.publicUrl;



    // ================= PRINT TYPE =================

    let printType = "Black & White";

    if(printRadios[1].checked){

        printType = "Color";

    }



    // ================= ORDER =================

    const copies =
    parseInt(copiesInput.value) || 1;

    const amount =
    parseInt(
        totalDisplay.innerText.replace("₹","")
    );



    const { error: orderError } =

    await supabaseClient

    .from("orders")

    .insert([{

        file_name: newFileName,

        file_url: fileURL,

        service: document.getElementById("service").value,

        print_type: printType,

        copies: copies,

        page_count: pageCount,

        amount: amount,

        payment: document.querySelector(
            'input[name="payment"]:checked'
        ).value,

        status: "New",

        print_status: "Pending"

    }]);



    if(orderError){

        console.log(orderError);

        alert(orderError.message);

        return;

    }



    alert("✅ Order Placed Successfully");

    location.reload();

});