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

const notifyError = (error) => {
  toast.error(error, {
    position: "top-right",
    hideProgressBar: false,
    closeOnClick: true,
    theme: "dark",
  });
};

const notifyInfo = (Info) => {
  toast.info(Info, {
    position: "top-right",
    hideProgressBar: false,
    closeOnClick: true,
    theme: "dark",
  });
};


export { notifyError, notifySuccess, notifyWarning , notifyInfo};
