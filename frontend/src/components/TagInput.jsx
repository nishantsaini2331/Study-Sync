import React from 'react';
import { PlusCircle, X } from 'lucide-react';
import { Button } from './Button';



export function TagInput({ tags, onAddTag, onRemoveTag }) {
  const [newTag, setNewTag] = React.useState('');

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag('');
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Course Tags
      </label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add a tag"
          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
        />
        <Button type="button" onClick={handleAddTag}>
          <PlusCircle className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              className="hover:text-blue-600"
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}