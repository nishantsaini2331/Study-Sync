import React from "react";

function DashboardHeader({
  title,
  description,
  role = "default",
  isShowBtn = false,
  onClick = () => {},
}) {
  const headerColor = {
    student: "bg-indigo-600",
    instructor: "bg-blue-600",
    admin: "bg-green-600",
    default: "bg-indigo-600",
  };

  return (
    <div className={`${headerColor[role]} px-4 py-5 sm:px-6`}>
      {isShowBtn && (
        <button
          onClick={onClick}
          className="bg-black text-white px-6 my-1 py-2 rounded-full "
        >
          Back
        </button>
      )}
      <h3 className="text-lg font-medium leading-6 text-white">{title}</h3>
      <p className="mt-1 max-w-2xl text-sm text-indigo-100">{description}</p>
    </div>
  );
}

export default DashboardHeader;
