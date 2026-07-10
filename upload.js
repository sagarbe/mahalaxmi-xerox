const fileInput = document.getElementById("file");
const orderBtn = document.getElementById("orderBtn");

const copiesInput = document.getElementById("copies");

const printOptions = document.getElementsByName("print");


orderBtn.addEventListener("click", async () => {

    const file = fileInput.files[0];

    if (!file) {
        alert("Please select file");
        return;
    }


    let printType = "Black & White";
    let amount = 5;


    if(printOptions[1].checked){
        printType = "Color";
        amount = 10;
    }


    let copies = Number(copiesInput.value);


    let totalAmount = amount * copies;


    // Upload File

    const fileName = Date.now() + "_" + file.name;


    const {error:uploadError} = await supabase.storage
    .from("documents")
    .upload(fileName,file);



    if(uploadError){

        alert("Upload Failed");
        console.log(uploadError);
        return;

    }



    const fileUrl =
    "https://xtwffnvrykavuorvzpjj.supabase.co/storage/v1/object/public/documents/"
    + fileName;



    // Save Order

    const {data,error} = await supabase
    .from("orders")
    .insert([{

        file_name:file.name,

        file_url:fileUrl,

        service:"Document Print",

        print_type:printType,

        copies:copies,

        amount:totalAmount,

        payment:"Pending",

        status:"Pending",

        print_status:"Pending"

    }]);



    if(error){

        console.log(error);

        alert("Order Save Failed");

    }
    else{

        alert("Order Placed Successfully");

    }


});
