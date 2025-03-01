export const formatDate = (dateString, isShowTime = false) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: isShowTime ? "numeric" : undefined,
    minute: isShowTime ? "numeric" : undefined,
  });
};
