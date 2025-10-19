import { useState, useEffect } from 'react';
import Logger from '../observability/logger';
import { metrics } from '../observability/metrics';
import { createSpan } from '../observability/tracing';
import './TodoList.css';

const logger = new Logger('TodoList');

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    logger.info('TodoList component mounted');
    metrics.setGauge('todos_total', todos.length);
  }, []);

  useEffect(() => {
    metrics.setGauge('todos_total', todos.length);
    metrics.setGauge('todos_completed', todos.filter(t => t.completed).length);
    metrics.setGauge('todos_pending', todos.filter(t => !t.completed).length);
  }, [todos]);

  const addTodo = () => {
    createSpan('add_todo', { todoText: inputValue }, () => {
      if (inputValue.trim() === '') {
        logger.warn('Attempted to add empty todo');
        return;
      }

      const newTodo = {
        id: Date.now(),
        text: inputValue,
        completed: false,
        createdAt: new Date().toISOString()
      };

      setTodos([...todos, newTodo]);
      setInputValue('');
      
      logger.info('Todo added', { todoId: newTodo.id, todoText: newTodo.text });
      metrics.incrementCounter('todos_added');
    });
  };

  const toggleTodo = (id) => {
    createSpan('toggle_todo', { todoId: id }, () => {
      const todo = todos.find(t => t.id === id);
      const newCompletedState = !todo.completed;

      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));

      logger.info('Todo toggled', { todoId: id, completed: newCompletedState });
      metrics.incrementCounter(newCompletedState ? 'todos_completed_action' : 'todos_uncompleted_action');
    });
  };

  const deleteTodo = (id) => {
    createSpan('delete_todo', { todoId: id }, () => {
      setTodos(todos.filter(todo => todo.id !== id));
      logger.info('Todo deleted', { todoId: id });
      metrics.incrementCounter('todos_deleted');
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
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
        <span>Complétées: {todos.filter(t => t.completed).length}</span>
        <span>En cours: {todos.filter(t => !t.completed).length}</span>
      </div>

      <ul className="todo-list" data-testid="todo-list">
        {todos.length === 0 ? (
          <li className="empty-state">Aucune tâche. Ajoutez-en une pour commencer!</li>
        ) : (
          todos.map(todo => (
            <li 
              key={todo.id} 
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
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

