export const validators = {
  required: (message = 'This is required.') => ({
    required: message
  }),
  minLength: (
    value: number,
    message = `This should be at least ${value} length.`
  ) => ({
    minLength: { value, message }
  }),
  maxLength: (
    value: number,
    message = `This should be at most ${value} length.`
  ) => ({
    maxLength: { value, message }
  }),
  email: (message = 'Not a valid email.') => ({
    pattern: { value: /^\S+@\S+$/i, message }
  }),
  fiscalCode: (message = 'Not a valid fiscal code.') => ({
    pattern: {
      value:
        /^([A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST]{1}[0-9LMNPQRSTUV]{2}[A-Z]{1}[0-9LMNPQRSTUV]{3}[A-Z]{1})$|([0-9]{11})$/i,
      message
    }
  }),
  CAP: (message = 'Not a valid CAP code.') => ({
    pattern: { value: /^(V-|I-)?[0-9]{5}$/i, message }
  })
}
