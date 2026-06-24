/**
 * Generic validation middleware.
 * Takes a Zod schema, validates req.body against it before the controller runs.
 * Usage: router.post('/signup', validate(signupSchema), signup)
 */
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Flatten Zod's error format into something simple and readable
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return res.status(400).json({ message: 'Validation failed', errors });
    }

    // Replace req.body with the parsed (and potentially transformed/trimmed) data
    req.body = result.data;
    next();
  };
};

module.exports = validate;