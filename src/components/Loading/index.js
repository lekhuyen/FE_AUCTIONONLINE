import { DNA } from "react-loader-spinner";

const Loading = () => {
  return (
    <div className="fixed top-0 bottom-0 left-0 
      w-full height-full z-50 bg-[#cbd5e1] flex items-center justify-center">
      <DNA
        visible={true}
        height="50"
        width="50"
        ariaLabel="dna-loading"
        wrapperStyle={{}}
        wrapperClass="dna-wrapper"
      />
    </div>
  );
};

export default Loading;