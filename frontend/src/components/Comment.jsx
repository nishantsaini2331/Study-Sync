import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function Comment({ lectureId }) {
  const [comment, setComment] = useState("");

  async function handleComment() {
    try {
      let res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}comment/${lectureId}`,
        {
          comment,
        },
        {
          withCredentials: true,
        }
      );
      console.log(res);
      setComment("");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  return (
    <div className="bg-white ">
      <div className="">
        <textarea
          value={comment}
          type="text"
          placeholder="Comment..."
          className=" h-[100px] resize-none border rounded-lg w-full p-3 text-lg focus:outline-none"
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          onClick={handleComment}
          className="bg-green-500 px-7 py-2 my-2 rounded-md"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default Comment;
