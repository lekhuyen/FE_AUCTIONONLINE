import Select from "react-select";

export const CategoryDropDown = ({ value, options, handleCategoryChange, placeholder }) => {

  return (
    <>
      <Select id="category"
        options={options}
        value={value}
        onChange={handleCategoryChange}
        placeholder={placeholder || "Select a category"}
      />
    </>
  );
};
