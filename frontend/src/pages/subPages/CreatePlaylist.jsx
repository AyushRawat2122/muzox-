import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, ListMusic } from "lucide-react";

const PlaylistSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  playListCover: z
    .any()
    .refine((file) => file?.length > 0, "Playlist cover is required")
    .refine(
      (file) =>
        ["image/jpeg", "image/jpg", "image/png"].includes(
          file[0].type
        ),
      "Only PNG, JPG images are allowed"
    )
    .refine((file) => file[0].size <= 3 * 1024 * 1024, "Max size is 10MB"),
});

function CreatePlaylist() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(PlaylistSchema),
    mode: "onChange",
  });

  const [coverPreview, setCoverPreview] = useState(null);
  const coverWatch = watch("playListCover");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
      setValue("playListCover", [file], { shouldValidate: true });
    }
  };

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
  };

  return (
    <div className="flex flex-col items-center gap-y-6 p-5 bg-zinc-950 text-white min-h-screen">
      <h1 className="font-semibold flex text-2xl text-left gap-3">
        <span className="text-orange-600">
          <ListMusic size={23} />
        </span>
        Create Playlist
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-full max-w-md"
      >
    
        <label className="font-medium">Cover Image</label>
        <div
          className="w-full h-48 border-2 border-dashed border-gray-600 flex flex-col items-center justify-center rounded-md cursor-pointer bg-gray-800"
          onClick={() => document.getElementById("fileInput").click()}
        >
          {coverPreview ? (
            <img
              src={coverPreview}
              alt="Playlist Cover"
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={30} className="text-gray-400" />
              <p className="text-gray-400 text-sm">Click to upload cover image</p>
              <p className="text-gray-600 text-xs">PNG, JPG up to 3MB</p>
            </div>
          )}
        </div>
        <input
          id="fileInput"
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/gif"
          className="hidden"
          {...register("playListCover")}
          onChange={handleFileChange}
        />
        {errors.playListCover && <p className="text-red-500 text-sm">{errors.playListCover.message}</p>}

       
        <label className="font-medium">Title</label>
        <input
          type="text"
          {...register("title")}
          className="border p-2 rounded-md w-full bg-gray-800 text-white placeholder-gray-500"
          placeholder="My Playlist"
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}

      
        <label className="font-medium">Description</label>
        <textarea
          {...register("description")}
          className="border p-2 rounded-md w-full h-20 bg-gray-800 text-white placeholder-gray-500"
          placeholder=" collection of my  songs..."
        />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
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