// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password) => {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
};

// Full name validation
export const validateFullName = (fullName) => {
  if (fullName.length < 2) {
    return { valid: false, message: 'Full name must be at least 2 characters' };
  }
  if (fullName.length > 50) {
    return { valid: false, message: 'Full name too long' };
  }
  if (!/^[a-zA-Z\s]+$/.test(fullName)) {
    return { valid: false, message: 'Full name can only contain letters and spaces' };
  }
  return { valid: true };
};

// Phone validation
export const validatePhone = (phone) => {
  if (phone.length < 10) {
    return { valid: false, message: 'Phone number must be at least 10 digits' };
  }
  if (phone.length > 15) {
    return { valid: false, message: 'Phone number too long' };
  }
  if (!/^\+?[\d\s\-\(\)]+$/.test(phone)) {
    return { valid: false, message: 'Invalid phone number format' };
  }
  return { valid: true };
};

// Sign up validation
export const validateSignUp = (email, password, fullName, phone) => {
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format';
  } else if (email.length > 100) {
    errors.email = 'Email too long';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.message;
    }
  }

  if (!fullName) {
    errors.fullName = 'Full name is required';
  } else {
    const nameValidation = validateFullName(fullName);
    if (!nameValidation.valid) {
      errors.fullName = nameValidation.message;
    }
  }

  if (!phone) {
    errors.phone = 'Phone number is required';
  } else {
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.message;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Sign in validation
export const validateSignIn = (email, password) => {
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Guest info validation
export const validateGuestInfo = (fullName, phone, email) => {
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format';
  }

  if (!fullName) {
    errors.fullName = 'Full name is required';
  } else {
    const nameValidation = validateFullName(fullName);
    if (!nameValidation.valid) {
      errors.fullName = nameValidation.message;
    }
  }

  if (!phone) {
    errors.phone = 'Phone number is required';
  } else {
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.message;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Password reset validation
export const validatePasswordReset = (email) => {
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
