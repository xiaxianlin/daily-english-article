import { BadRequestException } from '@nestjs/common';

/**
 * Security utility functions for input sanitization and validation
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim();
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';

  const sanitized = email.toLowerCase().trim();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new BadRequestException('Invalid email format');
  }

  return sanitized;
}

/**
 * Validate password strength
 * Requires: min 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
export function validatePasswordStrength(password: string): boolean {
  if (!password || password.length < 8) {
    throw new BadRequestException('Password must be at least 8 characters long');
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    throw new BadRequestException(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    );
  }

  return true;
}

/**
 * Sanitize MongoDB ObjectID to prevent NoSQL injection
 */
export function sanitizeObjectId(id: string): string {
  if (!id) return '';

  // Remove any characters that aren't valid hex
  const sanitized = id.replace(/[^a-fA-F0-9]/g, '');

  if (sanitized.length !== 24) {
    throw new BadRequestException('Invalid ID format');
  }

  return sanitized;
}

/**
 * Validate and limit string length
 */
export function validateStringLength(
  value: string,
  fieldName: string,
  minLength: number,
  maxLength: number,
): void {
  if (!value) {
    throw new BadRequestException(`${fieldName} is required`);
  }

  if (value.length < minLength) {
    throw new BadRequestException(`${fieldName} must be at least ${minLength} characters`);
  }

  if (value.length > maxLength) {
    throw new BadRequestException(`${fieldName} must not exceed ${maxLength} characters`);
  }
}

/**
 * Check for SQL injection patterns (basic check)
 */
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(ALTER|CREATE|DELETE|DROP|EXEC|EXECUTE|INSERT|SELECT|UNION|UPDATE)\b)/gi,
    /(--|\#|\/\*|\*\/)/g,
    /(\bOR\b|\bAND\b).*=.*=/gi,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Check for NoSQL injection patterns
 */
export function containsNoSqlInjection(input: string): boolean {
  const noSqlPatterns = [
    /\$where/i,
    /\$ne/i,
    /\$in/i,
    /\$gt/i,
    /\$lt/i,
    /\{.*\$/,
    /\\".*\\".*\$/,
  ];

  return noSqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Generic input sanitization for user-generated content
 */
export function sanitizeUserContent(content: string): string {
  if (!content) return '';

  // Check for injection attacks
  if (containsSqlInjection(content) || containsNoSqlInjection(content)) {
    throw new BadRequestException('Invalid content detected');
  }

  // Basic sanitization
  return sanitizeInput(content);
}

/**
 * Validate English level enum
 */
export function validateEnglishLevel(level: string): boolean {
  const validLevels = ['A2', 'B1', 'B2'];

  if (!validLevels.includes(level)) {
    throw new BadRequestException(
      `Invalid English level. Must be one of: ${validLevels.join(', ')}`,
    );
  }

  return true;
}

/**
 * Validate domain enum
 */
export function validateDomain(domain: string): boolean {
  const validDomains = ['AI', 'finance', 'economics', 'technology', 'sociology'];

  if (!validDomains.includes(domain)) {
    throw new BadRequestException(
      `Invalid domain. Must be one of: ${validDomains.join(', ')}`,
    );
  }

  return true;
}

/**
 * Validate difficulty enum
 */
export function validateDifficulty(difficulty: string): boolean {
  const validDifficulties = ['beginner', 'intermediate', 'advanced'];

  if (!validDifficulties.includes(difficulty)) {
    throw new BadRequestException(
      `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`,
    );
  }

  return true;
}
