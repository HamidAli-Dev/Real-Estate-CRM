import React, { useState } from "react";

import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";
import { X, Plus } from "lucide-react";

interface TagsProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
}

export const Tags: React.FC<TagsProps> = ({
  tags,
  onChange,
  placeholder = "Add tag...",
  maxTags = 10,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue) && tags.length < maxTags) {
      onChange([...tags, trimmedValue]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-3">
      {/* Input and Add Button */}
      <div className="flex space-x-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || tags.length >= maxTags}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleAddTag}
          disabled={
            disabled ||
            !inputValue.trim() ||
            tags.includes(inputValue.trim()) ||
            tags.length >= maxTags
          }
          size="sm"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="px-3 py-1 text-sm bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                disabled={disabled}
                className="ml-2 hover:bg-blue-300 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Max Tags Info */}
      {tags.length >= maxTags && (
        <p className="text-xs text-gray-500">Maximum {maxTags} tags allowed</p>
      )}
    </div>
  );
};
