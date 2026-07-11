import printer from "pdf-to-printer";

export async function printPDF(filePath) {

    try {

        await printer.print(filePath, {
            printer: "Brother DCP-T430W Printer"
        });

        console.log("✅ Printed Successfully");

        return true;

    } catch (err) {

        console.log("❌ Print Failed");
        console.log(err);

        return false;

    }

}