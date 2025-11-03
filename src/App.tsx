/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import * as TodosService from './api/todos';
import classNames from 'classnames';
import { TodoList } from './TodoList';
import { TodoStatusFilter } from './types/TodoStatusFilter';
import { TodoItem } from './TodoItem';
import { NewTodo } from './NewTodo';
import { Filter } from './Filter';

function getFilteredTodos(todos: Todo[], status: TodoStatusFilter) {
  let preparedTodos = todos;

  if (status === TodoStatusFilter.Completed) {
    preparedTodos = preparedTodos.filter(todo => todo.completed);
  } else if (status === TodoStatusFilter.Active) {
    preparedTodos = preparedTodos.filter(todo => !todo.completed);
  }

  return preparedTodos;
}

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<TodoStatusFilter>(
    TodoStatusFilter.All,
  );
  const [todoTitle, setTodoTitle] = useState('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [blockInput, setBlockInput] = useState(false);
  const [editingTodos, setEditingTodos] = useState<number[]>([]);
  const [displayError, setDisplayError] = useState(false);

  const activeTodosCount = todos.filter(todo => !todo.completed).length;

  const hasCompletedTodos = todos.some(todo => todo.completed);

  useEffect(() => {
    setLoading(true);

    TodosService.getTodos()
      .then(setTodos)
      .catch(() => {
        setError('Unable to load todos');
        setDisplayError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!error) {
      return;
    }

    const timer = setTimeout(() => {
      setDisplayError(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [error]);

  const handleAddTodo = () => {
    const normalizedTitle = todoTitle.trim();

    if (!normalizedTitle) {
      setError('Title should not be empty');
      setDisplayError(true);

      return;
    }

    setTempTodo({
      id: 0,
      title: normalizedTitle,
      completed: false,
      userId: USER_ID,
    });
    setBlockInput(true);

    TodosService.addTodo({
      title: normalizedTitle,
      userId: USER_ID,
      completed: false,
    })
      .then(newTodo => {
        setTodos(currentTodos => [...currentTodos, newTodo]);
        setTodoTitle('');
      })
      .catch(() => {
        setError('Unable to add a todo');
        setDisplayError(true);
      })
      .finally(() => {
        setTempTodo(null);
        setBlockInput(false);
      });
  };

  function deleteTodo(id: number) {
    setEditingTodos(prev => [...prev, id]);

    TodosService.deleteTodo(id)
      .then(() => {
        setTodos(currentTodos => currentTodos.filter(todo => todo.id !== id));
        setEditingTodos(prev => prev.filter(todoId => todoId !== id));
      })
      .catch(() => {
        setError('Unable to delete a todo');
        setDisplayError(true);
      });
    // .finally(() =>
    //   setEditingTodos(prev => prev.filter(todoId => todoId !== id)),
    // );
  }

  const clearCompleted = () => {
    const completedTodos = todos.filter(todo => todo.completed);

    completedTodos.forEach(todo => {
      TodosService.deleteTodo(todo.id)
        .then(() => {
          // eslint-disable-next-line @typescript-eslint/no-shadow
          setTodos(prevTodos =>
            prevTodos.filter(current => current.id !== todo.id),
          );
        })
        .catch(() => {
          setError('Unable to delete a todo');
          setDisplayError(true);
        });
    });
  };

  const toggleTodo = (id: number) => {
    setEditingTodos(prev => [...prev, id]);

    const todoToUpdate = todos.find(todo => todo.id === id);

    TodosService.updateTodo(id, {
      completed: !todoToUpdate?.completed,
    })
      .then(updated => {
        setTodos(prev =>
          prev.map(todo =>
            id === todo.id ? { ...todo, completed: updated.completed } : todo,
          ),
        );
      })
      .catch(() => {
        setError('Unable to update a todo');
        setDisplayError(true);
      })
      .finally(() => {
        setEditingTodos(prev => prev.filter(todoId => todoId !== id));
      });
  };

  const toggleAll = () => {
    const completedAll = !todos.every(todo => todo.completed);

    const todosToUpdate = todos.filter(todo => todo.completed !== completedAll);

    todosToUpdate.forEach(todo => {
      setEditingTodos(prev => [...prev, todo.id]);

      TodosService.updateTodo(todo.id, { completed: completedAll })
        .then(updated => {
          setTodos(prev =>
            prev.map(item =>
              item.id === todo.id
                ? { ...item, completed: updated.completed }
                : item,
            ),
          );
        })
        .catch(() => {
          setError('Unable to update a todo');
          setDisplayError(true);
        })
        .finally(() => {
          setEditingTodos(prev => prev.filter(id => id !== todo.id));
        });
    });
  };

  const renameTodo = (id: number, editedTitle: string) => {
    setEditingTodos(prev => [...prev, id]);

    TodosService.updateTodo(id, { title: editedTitle })
      .then(updated => {
        setTodos(prev =>
          prev.map(todo =>
            todo.id === id ? { ...todo, title: updated.title } : todo,
          ),
        );
      })
      .catch(() => {
        setError('Unable to update a todo');
        setDisplayError(true);
      })
      .finally(() => {
        setEditingTodos(prev => prev.filter(todoId => todoId !== id));
      });
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  const filteredTodos = getFilteredTodos(todos, statusFilter);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}

          {todos.length > 0 && (
            <button
              type="button"
              className={classNames('todoapp__toggle-all', {
                active: todos.length > 0 && todos.every(todo => todo.completed),
              })}
              data-cy="ToggleAllButton"
              onClick={toggleAll}
            />
          )}

          {/* Add a todo on form submit */}
          <NewTodo
            value={todoTitle}
            onChange={setTodoTitle}
            onSubmit={handleAddTodo}
            disabled={blockInput}
          />
        </header>

        {(todos.length > 0 || tempTodo) && (
          <>
            <TodoList
              todos={filteredTodos}
              onDelete={deleteTodo}
              editingTodos={editingTodos}
              onToggle={toggleTodo}
              onRename={renameTodo}
              hasError={displayError}
            />
            {tempTodo && (
              <TodoItem
                todo={tempTodo}
                onDelete={() => {}}
                isLoading={true}
                onToggle={() => {}}
                onToggleRename={() => {}}
                hasError={displayError}
              />
            )}

            {/* Hide the footer if there are no todos */}
            <footer className="todoapp__footer" data-cy="Footer">
              <span className="todo-count" data-cy="TodosCounter">
                {`${activeTodosCount} `}
                {activeTodosCount === 1 ? 'item' : 'items'} left
              </span>

              {/* Active link should have the 'selected' class */}
              <Filter statusFilter={statusFilter} onChange={setStatusFilter} />

              {/* this button should be disabled if there are no completed todos */}
              <button
                type="button"
                className="todoapp__clear-completed"
                data-cy="ClearCompletedButton"
                onClick={clearCompleted}
                disabled={!hasCompletedTodos}
              >
                Clear completed
              </button>
            </footer>
          </>
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: !displayError },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setDisplayError(false)}
        />
        {/* show only one message at a time */}
        {error}
        {/* Unable to load todos
        <br />
        Title should not be empty
        <br />
        Unable to add a todo
        <br />
        Unable to delete a todo
        <br />
        Unable to update a todo */}
      </div>
    </div>
  );
};
