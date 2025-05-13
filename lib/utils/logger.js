/**
 * Logger utility for debugging application flows
 * Enable with LOG_LEVEL environment variable:
 * - 'debug': All logs (debug, info, warn, error)
 * - 'info': Info, warn, error logs only
 * - 'warn': Warn and error logs only
 * - 'error': Error logs only
 * - 'none': No logs
 */

// Define log levels with numeric priority
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
}

// Get current log level from environment or default to 'none' in production, 'debug' in development
const getLogLevel = () => {
  // Default to environment-specific log levels
  const defaultLevel = process.env.NODE_ENV === 'production' ? 'none' : 'debug'

  // Read from environment variable if set
  const configuredLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || defaultLevel

  return configuredLevel.toLowerCase()
}

// Check if a given log level should be displayed based on current configuration
const shouldLog = (level) => {
  const currentLevel = getLogLevel()

  // Get numeric priorities
  const currentLevelPriority = LOG_LEVELS[currentLevel] || LOG_LEVELS.none
  const logLevelPriority = LOG_LEVELS[level] || LOG_LEVELS.debug

  // Only log if the message priority is >= current level priority
  return logLevelPriority >= currentLevelPriority
}

// Main logger object with methods for each log level
const logger = {
  debug: (...args) => {
    if (shouldLog('debug')) {
      console.debug('[DEBUG]', ...args)
    }
  },

  info: (...args) => {
    if (shouldLog('info')) {
      console.info('[INFO]', ...args)
    }
  },

  warn: (...args) => {
    if (shouldLog('warn')) {
      console.warn('[WARN]', ...args)
    }
  },

  error: (...args) => {
    if (shouldLog('error')) {
      console.error('[ERROR]', ...args)
    }
  },

  // Special method to log objects with better formatting
  object: (label, obj, level = 'debug') => {
    if (shouldLog(level)) {
      console.group(`[${level.toUpperCase()}] ${label}`)
      console.dir(obj, { depth: null, colors: true })
      console.groupEnd()
    }
  },

  // Track time for performance logging
  time: (label, level = 'debug') => {
    if (shouldLog(level)) {
      console.time(`[${level.toUpperCase()}] ${label}`)
      return () => console.timeEnd(`[${level.toUpperCase()}] ${label}`)
    }
    return () => {} // No-op if not logging
  },
}

export default logger
