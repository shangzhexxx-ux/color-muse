interface ImageCoverProps {
  imageUrl: string;
}

const ImageCover = ({ imageUrl }: ImageCoverProps) => {
  return (
    <div className="bg-white rounded-t-2xl flex flex-col items-center justify-center pt-4 pb-4 px-4">
      <div className="mb-4 text-[11px] text-gray-300 font-sans tracking-[0.4em] uppercase font-bold">
        #COLOR MUSE
      </div>
      <div className="relative w-full h-[360px] sm:h-[400px] rounded-lg overflow-hidden shadow-md">
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-60"
          aria-hidden="true"
        />
        <img
          src={imageUrl}
          alt="Uploaded inspiration"
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default ImageCover;
