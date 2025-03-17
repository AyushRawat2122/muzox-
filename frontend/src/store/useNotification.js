import { toast } from "react-toastify";

const notifySuccess = (successMsg) => {
  toast.success(successMsg, {
    position: "top-right",
    hideProgressBar: false,
    closeOnClick: true,
    theme: "dark",
  });
};

const notifyWarning = (warning) => {
  toast.warning(warning, {
    position: "top-right",
    hideProgressBar: false,
    closeOnClick: true,
    theme: "dark",
  });
};

const notifyError = (warning) => {
  toast.error(warning, {
    position: "top-right",
    hideProgressBar: false,
    closeOnClick: true,
    theme: "dark",
  });
};

export { notifyError, notifySuccess, notifyWarning };
