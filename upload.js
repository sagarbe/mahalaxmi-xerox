const fileInput = document.getElementById("file");
const orderBtn = document.getElementById("orderBtn");

orderBtn.addEventListener("click", async () => {

    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file.");
        return;
    }

    const fileName = Date.now() + "_" + file.name;

    const { data, error } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

    if (error) {
        alert("File Upload Failed");
        console.log(error);
        return;
    }

    const fileUrl =
        "https://xtwffnvrykavuorvzpjj.supabase.co/storage/v1/object/public/documents/" + fileName;

    alert("File Uploaded Successfully");

    console.log(fileUrl);

});
