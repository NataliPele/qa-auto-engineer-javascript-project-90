export function generateRandomString(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () =>
      chars[Math.floor(Math.random() * chars.length)] // NOSONAR
    ).join('');
  }
  
  export function generateCredentials() {
    return {
      username: generateRandomString(5),
      password: generateRandomString(5),
    };
  }
  