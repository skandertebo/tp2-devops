import { describe, it, expect, beforeEach, vi } from 'vitest';
import Logger from './logger';

describe('Logger', () => {
  let logger;
  let consoleSpies;

  beforeEach(() => {
    logger = new Logger('TestContext');
    consoleSpies = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {})
    };
  });

  afterEach(() => {
    Object.values(consoleSpies).forEach(spy => spy.mockRestore());
  });

  it('should create a logger with correct context', () => {
    expect(logger.context).toBe('TestContext');
  });

  it('should log debug messages', () => {
    logger.debug('Debug message', { extra: 'data' });
    expect(consoleSpies.debug).toHaveBeenCalled();
    
    const loggedMessage = JSON.parse(consoleSpies.debug.mock.calls[0][0]);
    expect(loggedMessage.level).toBe('DEBUG');
    expect(loggedMessage.message).toBe('Debug message');
    expect(loggedMessage.context).toBe('TestContext');
    expect(loggedMessage.extra).toBe('data');
  });

  it('should log info messages', () => {
    logger.info('Info message');
    expect(consoleSpies.info).toHaveBeenCalled();
    
    const loggedMessage = JSON.parse(consoleSpies.info.mock.calls[0][0]);
    expect(loggedMessage.level).toBe('INFO');
    expect(loggedMessage.message).toBe('Info message');
  });

  it('should log warn messages', () => {
    logger.warn('Warning message');
    expect(consoleSpies.warn).toHaveBeenCalled();
    
    const loggedMessage = JSON.parse(consoleSpies.warn.mock.calls[0][0]);
    expect(loggedMessage.level).toBe('WARN');
    expect(loggedMessage.message).toBe('Warning message');
  });

  it('should log error messages', () => {
    logger.error('Error message', { errorCode: 500 });
    expect(consoleSpies.error).toHaveBeenCalled();
    
    const loggedMessage = JSON.parse(consoleSpies.error.mock.calls[0][0]);
    expect(loggedMessage.level).toBe('ERROR');
    expect(loggedMessage.message).toBe('Error message');
    expect(loggedMessage.errorCode).toBe(500);
  });

  it('should include timestamp in logs', () => {
    logger.info('Test message');
    const loggedMessage = JSON.parse(consoleSpies.info.mock.calls[0][0]);
    expect(loggedMessage.timestamp).toBeDefined();
    expect(new Date(loggedMessage.timestamp)).toBeInstanceOf(Date);
  });
});

