import { ZodError } from 'zod';

export const formatZodErrors = (error: ZodError) => {
  const formattedErrors: Record<string, string[]> = {};

  error.issues.forEach((issue) => {
    const fieldName = issue.path[issue.path.length - 1] as string;

    if (!formattedErrors[fieldName]) {
      formattedErrors[fieldName] = [];
    }

    formattedErrors[fieldName].push(issue.message);
  });

  return formattedErrors;
};
