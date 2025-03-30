import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import getUser from "../../serverDataHooks/getUser";
import { death } from "../../utils/lottie";
import Loading from "../../components/loaders/Loading";
import { Upload, Music } from "lucide-react";
import { notifyError, notifySuccess } from "../../store/useNotification";

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
      notifySuccess("Song Uploaded Successfully");
      reset();
    } catch (error) {
      notifyError("Song Upload Failed");
    }
  };
  const { data: user } = getUser();

  if (!user || !user?.isAdmin) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        <Loading src={death} className={"md:w-[500px]"}>
          <h1 className="text-center lg:text-left text-white">
            <span className="text-5xl font-extrabold">Looks like you're </span>
            <br />{" "}
            <span className="text-2xl font-semibold">
              not a{" "}
              <span className="uppercase font-normal text-lime-200 underline underline-offset-4 decoration-1 decoration-lime-300">
                verified artist
              </span>{" "}
            </span>
            <br /> <span className="text-red-400 uppercase text-3xl">yet!</span>
          </h1>
        </Loading>
      </div>
    );
  }

  return (
    <div className="max-w-6xl max-lg:pb-[18vh] h-full overflow-y-scroll px-4 w-full mx-auto bg-black p-12 rounded-xl shadow-2xl">
      <h1 className="text-3xl max-sm:text-center font-bold py-2">Upload Song</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col md:flex-row items-center gap-12 p-10 border-5 border-dashed border-gray-400/30"
      >
        <div className="flex flex-col items-center md:w-1/2">
          <label
            htmlFor="cover"
            className="w-54 h-54 sm:w-70 sm:h-70 rounded-lg cursor-pointer flex border-dashed items-center border-4 border-gray-300/20 justify-center text-center  text-White  overflow-hidden"
          >
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Cover Preview"
                className="w-full h-full object-cover rounded-lg "
              />
            ) : (
              <Upload size={100} className="text-gray-300" />
            )}
          </label>
          <input
            type="file"
            id="cover"
            {...register("coverImage")}
            className={`opacity-0 h-0 pointer-events-none`}
          />
          {errors.coverImage && (
            <p className="text-red-400 text-sm mt-1">
              {errors.coverImage.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 md:w-1/2">
          <div className="flex flex-col">
            <h2 className="text-lg mb-1">Song Title</h2>
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
            <h2 className="text-lg mb-1">Song Artist</h2>
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
            <h2 className="text-lg mb-1">Song Genre</h2>
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
          <div className="flex flex-col items-center">
            <label
              htmlFor="Song"
              className="flex justify-center items-center h-[100px] w-[100px] bg-gray-100/10 border-4 overflow-hidden border-dashed rounded-md border-gray-400/10"
            >
              <Music></Music>
            </label>
            <input
              type="file"
              placeholder="MP3 only"
              id="Song"
              {...register("song")}
              className={`opacity-0 h-0 pointer-events-none`}
            />
            {errors.song && (
              <p className="text-red-400 text-sm mt-1">{errors.song.message}</p>
            )}
            {songName && (
              <p className="text-gray-400 text-sm mt-1 text-center">
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
          className="gradientButton font-extrabold rounded-full sm:w-1/3 w-full p-4 cursor-pointer"
        >
          UPLOAD
        </button>
      </div>
    </div>
  );
}

export default AdminUploadPage;
