const MAX_FILE_SIZE_MB = 2;

const logoValidate =(required:boolean) => (file: File) => {
    if(required){
    if (!file) {
      return "Logo is required";
    }
    if (!file.type.startsWith("image/")) {
      return "Please select a valid image file.";
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return "Image must be less than 2MB.";
    }
  }
  };

  export default logoValidate;