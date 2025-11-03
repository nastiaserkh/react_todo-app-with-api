/* eslint-disable jsx-a11y/label-has-associated-control */
import { Todo } from './types/Todo';
import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';

type Props = {
  todo: Todo;
  onDelete: (id: number) => void;
  isLoading?: boolean;
  onToggle: (id: number) => void;
  onToggleRename: (id: number, editedTitle: string) => void;
  hasError: boolean;
};

export const TodoItem: React.FC<Props> = ({
  todo,
  onDelete,
  isLoading = false,
  onToggle,
  onToggleRename,
  hasError,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);

  const handleRename = () => {
    const normalizedTitle = editedTitle.trim();

    if (normalizedTitle === todo.title) {
      return;
    }

    if (!normalizedTitle) {
      onDelete(todo.id);

      return;
    }

    onToggleRename(todo.id, normalizedTitle);
  };

  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && !isLoading && !hasError) {
      setIsEditing(false);
    }

    if (!isEditing && hasError) {
      setIsEditing(true);
    }
  }, [isLoading, hasError]);

  useEffect(() => {
    field.current?.focus();
  }, [isEditing]);

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', {
        completed: todo.completed,
      })}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          disabled={isLoading}
          onChange={() => onToggle(todo.id)}
        />
      </label>

      {!isEditing && (
        <span
          data-cy="TodoTitle"
          className="todo__title"
          onDoubleClick={() => setIsEditing(true)}
        >
          {todo.title}
        </span>
      )}

      {isEditing && (
        <>
          <form
            onSubmit={event => {
              event.preventDefault();

              setIsEditing(false);
              handleRename();
            }}
          >
            <input
              ref={field}
              data-cy="TodoTitleField"
              type="text"
              className="todo__title-field"
              placeholder="Empty todo will be deleted"
              value={editedTitle}
              onChange={event => setEditedTitle(event.target.value)}
              onBlur={() => {
                if (todo.title === editedTitle) {
                  setIsEditing(false);
                }

                handleRename();
              }}
              onKeyUp={event => {
                if (event.key === 'Escape') {
                  setIsEditing(false);
                  setEditedTitle(todo.title);
                }
              }}
            />
          </form>

          <div data-cy="TodoLoader" className="modal overlay">
            <div className="modal-background has-background-white-ter" />
            <div className="loader" />
          </div>
        </>
      )}

      {/* Remove button appears only on hover */}
      {!isEditing && (
        <button
          type="button"
          className="todo__remove"
          data-cy="TodoDelete"
          onClick={() => onDelete(todo.id)}
          disabled={isLoading}
        >
          ×
        </button>
      )}

      {/* overlay will cover the todo while it is being deleted or updated */}
      {/* {isLoading && ( */}
      <div
        data-cy="TodoLoader"
        className={classNames('modal overlay', { 'is-active': isLoading })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
      {/* )} */}
    </div>
  );
};
