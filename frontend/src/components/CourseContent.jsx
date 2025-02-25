import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

function CourseContent({ lectureIndex, lecture, length }) {
  const [activeLecture, setActiveLecture] = useState(false);

  return (
    <>
      <div
        onClick={() => setActiveLecture(!activeLecture)}
        className={`bg-gray-100 p-4 cursor-pointer border-gray-400 ${
          lectureIndex === length - 1 ? "" : "border-b"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {activeLecture ? <ChevronUp /> : <ChevronDown />}
            <h3 className="text-lg font-bold">{lecture.title}</h3>
          </div>
          <span>Duration: {lecture.duration}</span>
        </div>
      </div>
      {activeLecture && (
        <p
          className={`text-gray-600 p-3  border-gray-400 ${
            lectureIndex === length - 1 ? "" : "border-b"
          }`}
        >
          {lecture.description}
        </p>
      )}
    </>
  );
}

export default CourseContent;
