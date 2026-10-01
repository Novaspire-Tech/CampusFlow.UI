import { toast } from "react-toastify";

export const confirmToast = (message: string) =>
  new Promise<boolean>((resolve) => {
    const id = toast.info(
      () => (
        <div>
          <p className="mb-2">{message}</p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => {
                resolve(true);
                toast.dismiss(id);
              }}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Yes
            </button>
            <button
              onClick={() => {
                resolve(false);
                toast.dismiss(id);
              }}
              className="bg-gray-300 text-gray-800 px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false }
    );
  });
