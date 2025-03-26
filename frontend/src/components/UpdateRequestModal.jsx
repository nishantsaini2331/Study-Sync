function UpdateRequestModal({
  isVisible,
  onClose,
  onSubmit,
  updateNote,
  setUpdateNote,
  status,
  setStatus,
  currentStatus,
}) {
  return isVisible ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-6 w-[400px]">
        <h2 className="text-lg font-semibold mb-4">Update Request</h2>
        <div className="flex items-center space-x-4 mb-4">
          <label className="text-gray-600">Status:</label>
          <select
            className="border border-gray-300 rounded-md p-2"
            defaultValue={currentStatus}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 mb-4"
          placeholder="Enter your update note..."
          onChange={(e) => setUpdateNote(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-3 rounded-md"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md"
            onClick={onSubmit}
            // disabled={!updateNote.trim()}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  ) : null;
}

export default UpdateRequestModal;
