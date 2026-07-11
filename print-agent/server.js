import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import fs from "fs";
import { unlink } from "fs/promises";
import { printPDF } from "./print.js";


const SUPABASE_URL = "https://xtwffnvrykavuorvzpjj.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0d2ZmbnZyeWthdnZ2cGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2ODI3MzUsImV4cCI6MjA5OTI1ODczNX0.kioSLl0LdUUvC02gdCHDstn4J2eBUVW_Nuo7JJeDXjo";


const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


console.log("🚀 Print Agent Started...");


let isPrinting = false;



async function checkOrders(){


    if(isPrinting) return;



    try{


        // Only Paid or Cash orders will print

        const { data: order, error } = await supabase
            .from("orders")
            .select("*")
            .eq("print_status","Pending")
            .in("payment",["Paid","Cash"])
            .order("id",{ascending:true})
            .limit(1)
            .maybeSingle();



        if(error){

            console.log(
                "❌ Fetch Error:",
                error.message
            );

            return;

        }



        if(!order){

            return;

        }



        isPrinting = true;



        console.log(
            "🖨 Printing Order:",
            order.id
        );



        // Change status Printing


        const {error:printingError}=await supabase
            .from("orders")
            .update({

                print_status:"Printing"

            })
            .eq("id",order.id);



        if(printingError){

            console.log(
                "❌ Printing Status Error:",
                printingError.message
            );

        }



        // Download PDF


        const fileName = `order_${order.id}.pdf`;



        const response = await axios({

            url:order.file_url,

            method:"GET",

            responseType:"stream"

        });



        await new Promise((resolve,reject)=>{


            const writer =
            fs.createWriteStream(fileName);



            response.data.pipe(writer);



            writer.on(
                "finish",
                resolve
            );


            writer.on(
                "error",
                reject
            );


        });



        console.log(
            "📄 PDF Downloaded"
        );



        // Print


        const printed =
        await printPDF(fileName);



        if(printed){



            const {data,error:updateError}=await supabase
                .from("orders")
                .update({

                    print_status:"Printed",

                    printer_name:
                    "Brother DCP-T430W Printer",

                    print_time:
                    new Date().toISOString()

                })
                .eq("id",order.id)
                .select();



            if(updateError){


                console.log(
                    "❌ Database Update Error:",
                    updateError.message
                );


            }
            else{


                console.log(
                    "✅ Database Updated:",
                    data
                );


            }



            console.log(
                "✅ Order Printed"
            );



        }
        else{


            await supabase
            .from("orders")
            .update({

                print_status:"Failed"

            })
            .eq("id",order.id);



            console.log(
                "❌ Print Failed"
            );


        }




        // Delete PDF file


        try{

            await unlink(fileName);

        }
        catch{}



    }
    catch(err){


        console.log(
            "❌ Agent Error:",
            err.message
        );


    }
    finally{


        isPrinting=false;


    }


}



// Check every 3 seconds

setInterval(
    checkOrders,
    3000
);



// Start

checkOrders();