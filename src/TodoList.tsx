import { TodoItem } from './TodoItem';
import { Todo } from './types/Todo';
import React from 'react';

type Props = {
  todos: Todo[];
  onDelete: (id: number) => void;
  deletingTodos: number[];
  onToggle: (id: number) => void;
  onRename: (id: number, editedTitle: string) => void;
  hasError: boolean;
};

export const TodoList: React.FC<Props> = ({
  todos,
  onDelete,
  deletingTodos,
  onToggle,
  onRename,
  hasError,
}) => (
  <section className="todoapp__main" data-cy="TodoList">
    {todos.map(todo => (
      <TodoItem
        key={todo.id}
        todo={todo}
        onDelete={onDelete}
        isLoading={deletingTodos.includes(todo.id)}
        onToggle={onToggle}
        onToggleRename={onRename}
        hasError={hasError}
      />
    ))}
  </section>
);
