const orderButton = document.getElementById("orderBtn");

const fileInput = document.getElementById("file");
const serviceSelect = document.getElementById("service");

let detectedPages = 1;


// ---------------- PDF PAGE COUNT ----------------

fileInput.addEventListener("change", async () => {

    const file = fileInput.files[0];

    if (!file) return;


    // PDF
    if (file.type === "application/pdf") {

        try {

            const buffer = await file.arrayBuffer();

            const pdf = await pdfjsLib.getDocument({
                data: buffer
            }).promise;


            detectedPages = pdf.numPages;


        } catch (err) {

            console.log(err);

            detectedPages = 1;

        }

    }
    else {

        // Image
        detectedPages = 1;

    }


    // Update page display
    pagesDisplay.innerText = detectedPages;


    // Update script.js page count
    pageCount = detectedPages;


    // Recalculate amount
    if (typeof calculate === "function") {

        calculate();

    }

});



// ---------------- PLACE ORDER ----------------

orderButton.addEventListener("click", async () => {


    const selectedFile = fileInput.files[0];


    if (!selectedFile) {

        alert("Please select a file");

        return;

    }



    const cleanFileName = selectedFile.name
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "");



    const newFileName =
        Date.now() + "_" + cleanFileName;



    // ---------------- UPLOAD FILE ----------------


    const { error: uploadError } =
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

        alert("Upload Failed");

        console.log(uploadError);

        return;

    }




    // ---------------- GET FILE URL ----------------


    const { data } =
        supabaseClient.storage
        .from("documents")
        .getPublicUrl(newFileName);



    const fileURL = data.publicUrl;



    // ---------------- PRINT TYPE ----------------


    let printType = "Black & White";


    if (printRadios[1].checked) {

        printType = "Color";

    }




    // ---------------- COPIES ----------------


    const copies =
        parseInt(copiesInput.value) || 1;




    // ---------------- AMOUNT ----------------


    const amount =
        parseInt(
            totalDisplay.innerText.replace("₹", "")
        );





    // ---------------- INSERT ORDER ----------------


    const { error: orderError } =
        await supabaseClient
        .from("orders")
        .insert([

        {

            file_name: newFileName,

            file_url: fileURL,

            service: serviceSelect.value,

            print_type: printType,

            copies: copies,

            page_count: detectedPages,

            amount: amount,

            payment: "Pending",

            status: "New",

            print_status: "Pending"

        }

        ]);





    if (orderError) {


        alert(orderError.message);

        console.log(orderError);

        return;


    }




    alert("✅ Order Placed Successfully");


    location.reload();



});