import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Upload, ListMusic } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "../../store/useNotification";
import { normalRequest, queryClient } from "../../utils/axiosRequests.config";

function CreatePlaylist() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: { playListCover: [] },
  });
  const [coverPreview, setCoverPreview] = useState(null);
  const storeDataWithExpiry = (key, value, ttl) => {
    const now = new Date();
    const item = {
      value,
      expiry: now.getTime() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  };

  const {
    ref: fileInputRef,
    onChange: fileInputOnChange,
    ...fileInputProps
  } = register("playListCover", {
    required: "Playlist cover is required",
    validate: {
      acceptedFormats: (files) => {
        if (files && files.length > 0) {
          const file = files[0];
          return (
            ["image/jpeg", "image/jpg", "image/png"].includes(file.type) ||
            "Only PNG, JPG images are allowed"
          );
        }
        return "Playlist cover is required";
      },
      maxSize: (files) => {
        if (files && files.length > 0) {
          const file = files[0];
          return file.size <= 3 * 1024 * 1024 || "Max size is 3MB";
        }
        return "Playlist cover is required";
      },
    },
  });

  const mutation = useMutation({
    mutationKey: "createPlaylist",
    mutationFn: async (formData) => {
      try {
        const res = await normalRequest.post(
          "/playlist/create-playlist",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        return res?.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log(data);
      notifySuccess(data?.message);
      queryClient.setQueryData(["playlists"], (oldData) => {
        if (!oldData) {
          return { data: [data?.data] };
        }
        const newData = { ...(oldData || []) };
        newData.data = [...(oldData?.data || []), data?.data];
        return newData;
      });
      storeDataWithExpiry("recent", data?.message, 172800000);
    },
    onError: (error) => {
      let errorMsg = error?.response?.data?.message;
      console.log(error);
      if (error.statusCode === 500) {
        errorMsg = "Failed to create playlist";
      }
      notifyError(errorMsg);
    },
  });

  // Handle file change to set the cover preview.
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("name", data.title);
    formData.append("description", data.description);
    formData.append("playListCover", data?.playListCover?.[0]);
    mutation.mutate(formData);
  };

  return (
    <div className="flex flex-col items-center gap-y-6 p-5 bg-zinc-950 text-white min-h-screen">
      <h1 className="font-semibold flex items-center text-2xl sm:text-4xl text-left gap-3">
        <span className="text-orange-600">
          <ListMusic size={30} />
        </span>
        Create Playlist
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-full max-w-md"
      >
        <h1>Cover Image</h1>
        <label className="font-medium" htmlFor="fileInput">
          <div className="w-full h-48 border-2 border-dashed border-gray-400 flex flex-col items-center justify-center rounded-md cursor-pointer bg-white/10">
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Playlist Cover"
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={30} className="text-gray-300" />
                <p className="text-gray-300 text-sm">
                  Click to upload cover image
                </p>
                <p className="text-gray-400 text-xs">PNG, JPG up to 3MB</p>
              </div>
            )}
          </div>
        </label>
        <input
          id="fileInput"
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          className="opacity-0 pointer-events-none h-0"
          {...fileInputProps}
          ref={fileInputRef}
          onChange={(e) => {
            handleFileChange(e);
            fileInputOnChange(e);
          }}
        />
        {errors.playListCover && (
          <p className="text-red-500 text-sm">{errors.playListCover.message}</p>
        )}

        <label className="font-medium">Title</label>
        <input
          type="text"
          {...register("title", {
            required: "Title is required",
            minLength: { value: 5, message: "Title is required" },
            maxLength: {
              value: 50,
              message: "Title must be at most 50 characters",
            },
          })}
          className="border p-2 rounded-md w-full bg-white/10 text-white placeholder-gray-500"
          placeholder="My Playlist"
        />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}

        <label className="font-medium">Description</label>
        <textarea
          {...register("description", {
            required: "Description is required",
            minLength: { value: 10, message: "Description is required" },
            maxLength: {
              value: 100,
              message: "Description must be at most 100 characters",
            },
          })}
          className="border p-2 rounded-md w-full h-20 bg-white/10 text-white placeholder-gray-500"
          placeholder="Collection of my songs..."
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
        <button
          type="submit"
          className="bg-orange-600 text-white py-2 px-4 rounded-md text-lg hover:bg-orange-700 transition"
        >
          Create Playlist
        </button>
      </form>
    </div>
  );
}

export default CreatePlaylist;
