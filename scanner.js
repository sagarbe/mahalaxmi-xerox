// ================= WAIT OPENCV =================

function waitForOpenCV(){

    return new Promise(resolve=>{


        if(window.cv && cv.Mat){

            resolve();

        }
        else{

            setTimeout(
                ()=>waitForOpenCV().then(resolve),
                100
            );

        }


    });

}





// ================= IMAGE SCANNER =================


async function startScanner(file){


    await waitForOpenCV();



    return new Promise((resolve,reject)=>{


        const reader =
        new FileReader();




        reader.onload=function(e){


            const img =
            new Image();



            img.onload=function(){


                try{


                    let src =
                    cv.imread(img);



                    let gray =
                    new cv.Mat();



                    cv.cvtColor(

                        src,

                        gray,

                        cv.COLOR_RGBA2GRAY

                    );





                    // Blur

                    cv.GaussianBlur(

                        gray,

                        gray,

                        new cv.Size(5,5),

                        0

                    );






                    // Edge

                    let edges =
                    new cv.Mat();



                    cv.Canny(

                        gray,

                        edges,

                        75,

                        200

                    );






                    // Contours

                    let contours =
                    new cv.MatVector();



                    let hierarchy =
                    new cv.Mat();



                    cv.findContours(

                        edges,

                        contours,

                        hierarchy,

                        cv.RETR_EXTERNAL,

                        cv.CHAIN_APPROX_SIMPLE

                    );







                    let maxArea = 0;

                    let bestRect = null;






                    for(
                        let i=0;
                        i<contours.size();
                        i++
                    ){



                        let cnt =
                        contours.get(i);



                        let area =
                        cv.contourArea(cnt);




                        if(area > maxArea){


                            let rect =
                            cv.boundingRect(cnt);



                            if(
                                rect.width > 100 &&
                                rect.height > 100
                            ){


                                maxArea = area;


                                bestRect = rect;


                            }


                        }


                    }








                    let output;



                    // Crop document

                    if(bestRect){


                        output =
                        src.roi(

                            new cv.Rect(

                                bestRect.x,

                                bestRect.y,

                                bestRect.width,

                                bestRect.height

                            )

                        );


                    }
                    else{


                        output =
                        src;


                    }







                    // Enhance brightness contrast


                    cv.convertScaleAbs(

                        output,

                        output,

                        1.3,

                        15

                    );







                    const canvas =
                    document.createElement("canvas");




                    cv.imshow(

                        canvas,

                        output

                    );







                    const result =
                    canvas.toDataURL(

                        "image/jpeg",

                        0.95

                    );







                    resolve(result);







                    src.delete();

                    gray.delete();

                    edges.delete();

                    contours.delete();

                    hierarchy.delete();

                    output.delete();



                }

                catch(err){


                    reject(err);


                }



            };




            img.src =
            e.target.result;



        };




        reader.readAsDataURL(file);



    });



}