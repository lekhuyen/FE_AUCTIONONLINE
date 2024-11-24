import Select from "react-select";

export const CategoryDropDown = ({ value, options, handleCategoryChange }) => {

  return (
    <>
      <Select id="category"
        options={options}
        value={value}
        onChange={handleCategoryChange}
      />
    </>
  );
};
