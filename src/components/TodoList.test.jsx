import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoList from './TodoList';

// Mock the observability modules
vi.mock('../observability/logger', () => ({
  default: class Logger {
    info() {}
    warn() {}
    error() {}
    debug() {}
  }
}));

vi.mock('../observability/metrics', () => ({
  metrics: {
    incrementCounter: vi.fn(),
    setGauge: vi.fn(),
    recordHistogram: vi.fn()
  }
}));

vi.mock('../observability/tracing', () => ({
  createSpan: vi.fn((name, attrs, fn) => fn()),
  createAsyncSpan: vi.fn(async (name, attrs, fn) => await fn()),
  getTracer: vi.fn()
}));

describe('TodoList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the todo list component', () => {
    render(<TodoList />);
    expect(screen.getByText('📝 Liste de Tâches')).toBeInTheDocument();
    expect(screen.getByTestId('todo-input')).toBeInTheDocument();
    expect(screen.getByTestId('add-button')).toBeInTheDocument();
  });

  it('should display empty state when no todos exist', () => {
    render(<TodoList />);
    expect(screen.getByText('Aucune tâche. Ajoutez-en une pour commencer!')).toBeInTheDocument();
  });

  it('should add a new todo when clicking add button', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    
    const input = screen.getByTestId('todo-input');
    const addButton = screen.getByTestId('add-button');

    await user.type(input, 'Test Todo');
    await user.click(addButton);

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(input.value).toBe('');
  });

  it('should add a new todo when pressing Enter key', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    
    const input = screen.getByTestId('todo-input');

    await user.type(input, 'Test Todo{Enter}');

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(input.value).toBe('');
  });

  it('should not add empty todos', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    
    const addButton = screen.getByTestId('add-button');
    await user.click(addButton);

    expect(screen.getByText('Aucune tâche. Ajoutez-en une pour commencer!')).toBeInTheDocument();
  });

  it('should toggle todo completion status', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    
    const input = screen.getByTestId('todo-input');
    await user.type(input, 'Test Todo{Enter}');

    const todoItem = screen.getByTestId('todo-item');
    expect(todoItem).not.toHaveClass('completed');

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(todoItem).toHaveClass('completed');
  });

  it('should delete a todo', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    
    const input = screen.getByTestId('todo-input');
    await user.type(input, 'Test Todo{Enter}');

    expect(screen.getByText('Test Todo')).toBeInTheDocument();

    const todoItems = screen.getAllByTestId('todo-item');
    const firstTodoId = todoItems[0].querySelector('input[type="checkbox"]').dataset.testid.split('-')[2];
    const deleteButton = screen.getByTestId(`delete-button-${firstTodoId}`);
    
    await user.click(deleteButton);

    expect(screen.queryByText('Test Todo')).not.toBeInTheDocument();
  });

  it('should display correct statistics', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    
    const input = screen.getByTestId('todo-input');
    
    await user.type(input, 'Todo 1{Enter}');
    await user.type(input, 'Todo 2{Enter}');
    await user.type(input, 'Todo 3{Enter}');

    expect(screen.getByText('Total: 3')).toBeInTheDocument();
    expect(screen.getByText('Complétées: 0')).toBeInTheDocument();
    expect(screen.getByText('En cours: 3')).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    expect(screen.getByText('Complétées: 1')).toBeInTheDocument();
    expect(screen.getByText('En cours: 2')).toBeInTheDocument();
  });

  it('should handle multiple todos correctly', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    
    const input = screen.getByTestId('todo-input');
    
    const todos = ['Buy groceries', 'Walk the dog', 'Read a book'];
    
    for (const todo of todos) {
      await user.type(input, `${todo}{Enter}`);
    }

    todos.forEach(todo => {
      expect(screen.getByText(todo)).toBeInTheDocument();
    });

    const todoItems = screen.getAllByTestId('todo-item');
    expect(todoItems).toHaveLength(3);
  });
});

