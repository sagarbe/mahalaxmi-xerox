const orderButton = document.getElementById("orderBtn");


orderButton.addEventListener("click", async () => {


    const fileInput = document.getElementById("file");
    const serviceSelect = document.getElementById("service");
    const copiesInput = document.getElementById("copies");
    const totalDisplay = document.getElementById("totalPrice");
    const printRadios = document.getElementsByName("print");


    const selectedFile = fileInput.files[0];


    if (!selectedFile) {

        alert("Please select a file");
        return;

    }



    // Clean file name

    const cleanFileName = selectedFile.name
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "");



    const newFileName =
        Date.now() + "_" + cleanFileName;



    console.log(
        "Uploading:",
        newFileName
    );



    // Upload File

    const { data: uploadData, error: uploadError } =
    await supabaseClient.storage
        .from("documents")
        .upload(
            newFileName,
            selectedFile,
            {
                cacheControl: "3600",
                upsert: false
            }
        );



    if (uploadError) {

        console.log(
            "Storage Error:",
            uploadError
        );

        alert(
            "File Upload Failed"
        );

        return;

    }



    console.log(
        "Uploaded:",
        uploadData
    );



    // Public URL

    const { data:urlData } =
    supabaseClient.storage
        .from("documents")
        .getPublicUrl(newFileName);



    const fileURL =
    urlData.publicUrl;



    // Print Type

    let printType =
    "Black & White";


    if(printRadios[1].checked){

        printType="Color";

    }



    // Copies & Amount

    const copies =
    parseInt(copiesInput.value) || 1;


    const amount =
    parseInt(
        totalDisplay.innerText.replace("₹","")
    );




    // Save Order


    const {error:orderError}=

    await supabaseClient
    .from("orders")
    .insert([

        {

            file_name:newFileName,

            file_url:fileURL,

            service:serviceSelect.value,

            print_type:printType,

            copies:copies,

            amount:amount,

            payment:"Pending",

            status:"New",

            page_count:1,

            print_status:"Pending"

        }

    ]);



    if(orderError){


        console.log(
            "Database Error:",
            orderError
        );


        alert(
            "Order Save Failed"
        );

        return;


    }



    alert(
        "Order Placed Successfully!"
    );


    console.log(
        "Order Saved Successfully"
    );


});