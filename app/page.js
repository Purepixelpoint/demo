import ImageCarousel from "@/components/imageCarousel";

let images = ["https://buildingworld-dev.s3.ap-south-1.amazonaws.com/Images/ideas/30157007073de968.webp", 
              "https://buildingworld-dev.s3.ap-south-1.amazonaws.com/Images/ideas/1709423b3ce394e7.webp",
              "https://buildingworld-dev.s3.ap-south-1.amazonaws.com/Images/ideas/9423b3ce394e7d63.webp",
              "https://bw-production.s3.ap-south-1.amazonaws.com/Images/ideas/699a4dc34c2667cd.webp",
              ]

export default function Home() {
  return (
    <div>
     
        <h1>Image Carousel</h1>
       
        <ImageCarousel images={images} index={1}/>
    </div>
  );
}
