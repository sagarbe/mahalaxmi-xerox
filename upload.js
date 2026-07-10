const orderBtn = document.getElementById("orderBtn");

const uploadInput = document.getElementById("file");


orderBtn.addEventListener("click", async () => {

    const file = uploadInput.files[0];


    if (!file) {

        alert("Please select a file.");

        return;

    }


    const uploadFileName = Date.now() + "_" + file.name;


    const { data, error } = await supabaseClient.storage

        .from("documents")

        .upload(uploadFileName, file);


    if (error) {

        alert(error.message);

        console.log(error);

        return;

    }


    const fileUrl =
    "https://xtwffnvrykavuorvzpjj.supabase.co/storage/v1/object/public/documents/" + uploadFileName;


    alert("File Uploaded Successfully");


    console.log(fileUrl);


});
