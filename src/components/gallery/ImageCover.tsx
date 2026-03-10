interface ImageCoverProps {
  imageUrl: string;
}

const ImageCover = ({ imageUrl }: ImageCoverProps) => {
  return (
    <div className="bg-white rounded-t-2xl flex flex-col items-center justify-center pt-8 pb-8 px-8">
      <div className="mb-8 text-[11px] text-gray-300 font-sans tracking-[0.4em] uppercase font-bold">
        #COLOR MUSE
      </div>
      <img
        src={imageUrl}
        alt="Uploaded inspiration"
        className="w-full h-auto object-contain rounded-lg shadow-md"
      />
    </div>
  );
};

export default ImageCover;
