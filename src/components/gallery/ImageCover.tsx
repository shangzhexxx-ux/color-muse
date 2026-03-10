interface ImageCoverProps {
  imageUrl: string;
}

const ImageCover = ({ imageUrl }: ImageCoverProps) => {
  return (
    <div className="bg-white rounded-t-2xl flex flex-col items-center justify-center pt-4 pb-4 px-4">
      <div className="mb-4 text-[11px] text-gray-300 font-sans tracking-[0.4em] uppercase font-bold">
        #COLOR MUSE
      </div>
      <div className="relative group">
        <img 
          src={imageUrl} 
          alt="Uploaded inspiration" 
          className="max-h-[400px] w-auto object-contain rounded-lg shadow-md"
        />
      </div>
    </div>
  );
};

export default ImageCover;
