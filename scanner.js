// ================= WAIT OPENCV =================

function waitForOpenCV(){

    return new Promise(resolve=>{

        let timer=setInterval(()=>{

            if(window.cv && cv.Mat){

                clearInterval(timer);
                resolve();

            }

        },100);

    });

}





// ================= DISTANCE =================

function distance(p1,p2){

    return Math.sqrt(
        Math.pow(p1.x-p2.x,2)+
        Math.pow(p1.y-p2.y,2)
    );

}




// ================= ORDER POINTS =================

function sortCorners(points){

    points.sort((a,b)=>a.y-b.y);


    let top =
    points.slice(0,2)
    .sort((a,b)=>a.x-b.x);


    let bottom =
    points.slice(2,4)
    .sort((a,b)=>a.x-b.x);


    return [

        top[0],      // top left
        top[1],      // top right
        bottom[1],   // bottom right
        bottom[0]    // bottom left

    ];

}






// ================= SCANNER =================


async function startScanner(file){


await waitForOpenCV();



return new Promise((resolve,reject)=>{


const reader=new FileReader();



reader.onload=function(e){


const img=new Image();



img.onload=function(){



try{


let src=cv.imread(img);



let original=src.clone();




// Gray

let gray=new cv.Mat();


cv.cvtColor(
src,
gray,
cv.COLOR_RGBA2GRAY
);




// Remove shadow

cv.GaussianBlur(
gray,
gray,
new cv.Size(5,5),
0
);




// Adaptive threshold

// ================= EDGE DETECTION =================

let thresh = new cv.Mat();


cv.Canny(
    gray,
    thresh,
    50,
    150
);





// Contours

let contours=new cv.MatVector();

let hierarchy=new cv.Mat();



cv.findContours(

thresh,

contours,

hierarchy,

cv.RETR_EXTERNAL,

cv.CHAIN_APPROX_SIMPLE

);






let best=null;

let maxArea=0;





for(let i=0;i<contours.size();i++){


let cnt=contours.get(i);


let area=cv.contourArea(cnt);



if(area>maxArea){



let peri=cv.arcLength(
cnt,
true
);



let approx=new cv.Mat();



cv.approxPolyDP(

cnt,

approx,

0.02*peri,

true

);



if(approx.rows===4){


maxArea=area;

best=approx;


}


}



}






let output;




// ===== Perspective =====


if(best){


let pts=[];



for(let i=0;i<4;i++){


pts.push({

x:best.data32S[i*2],

y:best.data32S[i*2+1]

});


}



let corners=
sortCorners(pts);




const widthTop = distance(corners[0], corners[1]);
const widthBottom = distance(corners[3], corners[2]);

const heightLeft = distance(corners[0], corners[3]);
const heightRight = distance(corners[1], corners[2]);

const width = Math.max(widthTop, widthBottom);
const height = Math.max(heightLeft, heightRight);



let srcTri=cv.matFromArray(

4,

1,

cv.CV_32FC2,

[

corners[0].x,corners[0].y,

corners[1].x,corners[1].y,

corners[2].x,corners[2].y,

corners[3].x,corners[3].y

]

);




let dstTri=cv.matFromArray(

4,

1,

cv.CV_32FC2,

[

0,0,

width,0,

width,height,

0,height

]

);




let M=cv.getPerspectiveTransform(

srcTri,

dstTri

);



output=new cv.Mat();



cv.warpPerspective(

src,

output,

M,

new cv.Size(
width,
height
)

);



console.log(
"Document Straightened"
);



}

else{


output=original;


console.log(
"Original Used"
);


}







// ===== Enhance =====



cv.convertScaleAbs(

output,

output,

1.25,

20

);





let canvas=document.createElement("canvas");


cv.imshow(

canvas,

output

);



let result=
canvas.toDataURL(
"image/jpeg",
0.95
);




resolve(result);







src.delete();

original.delete();

gray.delete();

thresh.delete();

contours.delete();

hierarchy.delete();



}

catch(err){


console.log(err);

reject(err);


}



};



img.src=e.target.result;


};



reader.readAsDataURL(file);



});


}