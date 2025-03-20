import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

const USchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  genre: z.string().min(1, "Genre is required"),
  song: z
    .custom(
      (file) => file instanceof FileList && file.length > 0,
      "Song file is required"
    )
    .refine(
      (file) => file[0]?.type === "audio/mpeg",
      "Only MP3 files are allowed"
    ),
  coverImage: z
    .custom(
      (file) => file instanceof FileList && file.length > 0,
      "Cover image is required"
    )
    .refine(
      (file) => file[0]?.type.startsWith("image/"),
      "Only image files are allowed"
    ),
});
function AdminUploadPage() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(USchema),
    mode: "onChange",
  });
  const [coverPreview, setCoverPreview] = useState(null);
  const [songName, setSongName] = useState("");
  const watchCover = watch("coverImage");
  const watchSong = watch("song");
  useEffect(() => {
    if (watchCover && watchCover.length > 0) {
      setCoverPreview(URL.createObjectURL(watchCover[0]));
    } else {
      setCoverPreview(null);
    }
  }, [watchCover]);

  useEffect(() => {
    if (watchSong && watchSong.length > 0) {
      setSongName(watchSong[0].name);
    } else {
      setSongName("");
    }
  }, [watchSong]);
  const onSubmit = async (data) => {
    console.log(data);
    try {
      const { artist, title, genre, coverImage, song } = data;
      const f1 = coverImage[0];
      const f2 = song[0];
      console.log(f1, f2);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("artist", artist);
      formData.append("genre", genre);
      formData.append("coverImage", f1);
      formData.append("song", f2);
      console.log(data.song[0].name);

      const res = await axios.post(
        "http://localhost:3000/api/muzox-/songs/uploadMusic",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log(res.data);
      reset();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-6xl h-full overflow-y-scroll  w-full mx-auto bg-black p-12 rounded-xl shadow-2xl border border-gray-700">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col md:flex-row items-center gap-12"
      >
        <div className="flex flex-col items-start md:w-1/2">
          <div className="w-54 h-54 ml-[3rem] sm:w-65 sm:h-64 rounded-lg   flex items-center border border-gray-300 justify-center text-center  text-White mb-4 overflow-hidden">
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Cover Preview"
                className="w-full h-full object-cover rounded-lg "
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-[3rem] h-[4rem] "
              >
                <path
                  fillRule="evenodd"
                  d="M12 3a1 1 0 0 1 1 1v8h3a1 1 0 0 1 .7 1.7l-4 4a1 1 0 0 1-1.4 0l-4-4A1 1 0 0 1 8 12h3V4a1 1 0 0 1 1-1zm-6 16a1 1 0 1 0 0 2h12a1 1 0 1 0 0-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          <input
            type="file"
            {...register("coverImage")}
            className={`text-sm text-gray-400
              ${
                errors.coverImage
                  ? "border-red-400"
                  : "border-gray-500 hover:border-white"
              }
              border-[1px] rounded-md p-2 outline-none
            `}
          />
          {errors.coverImage && (
            <p className="text-red-400 text-sm mt-1">
              {errors.coverImage.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 md:w-1/2">
          <div className="flex flex-col">
            <input
              type="text"
              placeholder="title"
              {...register("title")}
              className={`w-full p-2 rounded-md bg-black text-white border-[1px] outline-none 
                ${
                  errors.title
                    ? "border-red-400"
                    : "border-gray-500 hover:border-white"
                }
              `}
            />
            {errors.title && (
              <p className="text-red-400 text-sm">{errors.title.message}</p>
            )}
          </div>
          <div className="flex flex-col">
            <input
              type="text"
              placeholder="artist"
              {...register("artist")}
              className={`w-full p-2 rounded-md bg-black text-white border-[1px] outline-none
                ${
                  errors.artist
                    ? "border-red-400"
                    : "border-gray-500 hover:border-white"
                }
              `}
            />
            {errors.artist && (
              <p className="text-red-400 text-sm">{errors.artist.message}</p>
            )}
          </div>
          <div className="flex flex-col">
            <input
              type="text"
              placeholder="genre"
              {...register("genre")}
              className={`w-full p-2 rounded-md bg-black text-white border-[1px] outline-none
                ${
                  errors.genre
                    ? "border-red-400"
                    : "border-gray-500 hover:border-white"
                }
              `}
            />
            {errors.genre && (
              <p className="text-red-400 text-sm">{errors.genre.message}</p>
            )}
          </div>
          <div className="flex flex-col">
            <input
              type="file"
              placeholder="MP3 only"
              {...register("song")}
              className={`w-full p-2 rounded-md bg-black text-white border-[1px] outline-none
                ${
                  errors.song
                    ? "border-red-400"
                    : "border-gray-500 hover:border-white"
                }
              `}
            />
            {errors.song && (
              <p className="text-red-400 text-sm">{errors.song.message}</p>
            )}
            {songName && (
              <p className="text-gray-400 text-sm mt-1">
                <span className="text-white font-semibold">Selected file:</span>{" "}
                {songName}
              </p>
            )}
          </div>
        </div>
      </form>

      <div className="flex justify-center mt-8">
        <button
          type="submit"
          form="hook-form"
          onClick={handleSubmit(onSubmit)}
          className="gradientButton font-extrabold rounded-full px-40 py-4 cursor-pointer"
        >
          UPLOAD
        </button>
      </div>
    </div>
  );
}

export default AdminUploadPage;