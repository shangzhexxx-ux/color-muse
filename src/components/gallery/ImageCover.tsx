interface ImageCoverProps {
  imageUrl: string;
}

const ImageCover = ({ imageUrl }: ImageCoverProps) => {
  return (
    <div className="bg-white rounded-t-2xl flex flex-col items-center justify-center pt-8 pb-8 px-8">
      <div className="mb-4 text-[11px] text-gray-300 font-sans tracking-[0.4em] uppercase font-bold">
        #COLOR MUSE
      </div>
      <div className="relative w-full h-[360px] sm:h-[400px] rounded-lg overflow-hidden shadow-md bg-white">
        <img
          src={imageUrl}
          alt="Uploaded inspiration"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default ImageCover;
