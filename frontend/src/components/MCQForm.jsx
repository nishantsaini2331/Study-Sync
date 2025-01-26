import React from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { MCQ } from '../types/course';


export function MCQForm({ mcq, onMCQChange, onSubmit }) {
  const handleOptionChange = (index , value) => {
    const newOptions = [...mcq.options];
    newOptions[index] = value;
    onMCQChange({ ...mcq, options: newOptions });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Question"
        value={mcq.question}
        onChange={e => onMCQChange({ ...mcq, question: e.target.value })}
        required
      />

      {mcq.options.map((option, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            label={`Option ${index + 1}`}
            value={option}
            onChange={e => handleOptionChange(index, e.target.value)}
            required
          />
          <input
            type="radio"
            name="correctOption"
            checked={mcq.correctOption === index}
            onChange={() => onMCQChange({ ...mcq, correctOption: index })}
            className="mt-6"
          />
        </div>
      ))}

      <Button type="submit">Add MCQ</Button>
    </form>
  );
}