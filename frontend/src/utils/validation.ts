export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * 验证邮箱格式
 * 只允许 0-9, A-Z, a-z, . 在用户名部分
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[A-Za-z0-9.]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { 
      isValid: false, 
      error: 'Email can only contain letters (A-Z, a-z), numbers (0-9), and dots (.)' 
    };
  }
  
  return { isValid: true, error: null };
}

/**
 * 验证手机号格式
 * 只允许数字，必须是10位
 */
export function validatePhoneNumber(phoneNumber: string): ValidationResult {
  if (!phoneNumber) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return { 
      isValid: false, 
      error: 'Phone number must be exactly 10 digits (numbers only, no letters or symbols)' 
    };
  }
  
  return { isValid: true, error: null };
}

/**
 * 验证密码格式
 * 至少8位，包含大写、小写、数字，不能有空格
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.includes(' ')) {
    return { isValid: false, error: 'Password cannot contain spaces' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  return { isValid: true, error: null };
}

/**
 * 验证用户名格式
 * 不能包含空格
 */
export function validateUsername(username: string): ValidationResult {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }
  
  if (username.includes(' ')) {
    return { isValid: false, error: 'Username cannot contain spaces' };
  }
  
  return { isValid: true, error: null };
}