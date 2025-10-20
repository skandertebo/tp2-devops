import { useEffect, useState } from "react";
import { createTodo, deleteTodoApi, getTodos, updateTodo } from "../lib/api";
import Logger from "../observability/logger";
import { metrics } from "../observability/metrics";
import { createSpan } from "../observability/tracing";
import "./TodoList.css";

const logger = new Logger("TodoList");

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    logger.info("TodoList component mounted");
    createSpan("fetch_todos", {}, async () => {
      try {
        const serverTodos = await getTodos();
        setTodos(serverTodos || []);
        metrics.setGauge("todos_total", serverTodos?.length || 0);
      } catch (e) {
        logger.error("Failed to fetch todos", { error: e.message });
      }
    });
  }, []);

  useEffect(() => {
    metrics.setGauge("todos_total", todos.length);
    metrics.setGauge(
      "todos_completed",
      todos.filter((t) => t.completed).length
    );
    metrics.setGauge("todos_pending", todos.filter((t) => !t.completed).length);
  }, [todos]);

  const addTodo = async () => {
    await createSpan("add_todo", { todoText: inputValue }, async () => {
      if (inputValue.trim() === "") {
        logger.warn("Attempted to add empty todo");
        return;
      }
      try {
        const created = await createTodo(inputValue.trim());
        setTodos([...todos, created]);
        setInputValue("");
        logger.info("Todo added", {
          todoId: created.id,
          todoText: created.text,
        });
        metrics.incrementCounter("todos_added");
      } catch (e) {
        logger.error("Failed to create todo", { error: e.message });
      }
    });
  };

  const toggleTodo = async (id) => {
    await createSpan("toggle_todo", { todoId: id }, async () => {
      const current = todos.find((t) => t.id === id);
      if (!current) return;
      const newCompletedState = !current.completed;
      try {
        const updated = await updateTodo(id, { completed: newCompletedState });
        setTodos(todos.map((t) => (t.id === id ? updated : t)));
        logger.info("Todo toggled", {
          todoId: id,
          completed: newCompletedState,
        });
        metrics.incrementCounter(
          newCompletedState
            ? "todos_completed_action"
            : "todos_uncompleted_action"
        );
      } catch (e) {
        logger.error("Failed to toggle todo", { error: e.message, todoId: id });
      }
    });
  };

  const deleteTodo = async (id) => {
    await createSpan("delete_todo", { todoId: id }, async () => {
      try {
        await deleteTodoApi(id);
        setTodos(todos.filter((todo) => todo.id !== id));
        logger.info("Todo deleted", { todoId: id });
        metrics.incrementCounter("todos_deleted");
      } catch (e) {
        logger.error("Failed to delete todo", { error: e.message, todoId: id });
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  return (
    <div className="todo-container">
      <h1>📝 Liste de Tâches</h1>

      <div className="input-group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ajouter une nouvelle tâche..."
          className="todo-input"
          data-testid="todo-input"
        />
        <button
          onClick={addTodo}
          className="add-button"
          data-testid="add-button"
        >
          Ajouter
        </button>
      </div>

      <div className="stats">
        <span>Total: {todos.length}</span>
        <span>Complétées: {todos.filter((t) => t.completed).length}</span>
        <span>En cours: {todos.filter((t) => !t.completed).length}</span>
      </div>

      <ul className="todo-list" data-testid="todo-list">
        {todos.length === 0 ? (
          <li className="empty-state">
            Aucune tâche. Ajoutez-en une pour commencer!
          </li>
        ) : (
          todos.map((todo) => (
            <li
              key={todo.id}
              className={`todo-item ${todo.completed ? "completed" : ""}`}
              data-testid="todo-item"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="todo-checkbox"
                data-testid={`todo-checkbox-${todo.id}`}
              />
              <span className="todo-text">{todo.text}</span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="delete-button"
                data-testid={`delete-button-${todo.id}`}
              >
                🗑️
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default TodoList;
