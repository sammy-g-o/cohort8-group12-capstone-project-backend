import AppError from '../utils/appError.js';

const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateErrorDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0];
  const message = `duplicate value for ${field}: ${err.keyValue?.[field]}. Please use another value`;
  return new AppError(message, 409);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (error, res) => {
  return res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    error,
    stack: error.stack,
  });
};
const sendErrorProd = (error, res) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
};

export const globalErrorHandler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(error, res);
  }

  // production, or NODE_ENV not set
  let err = error;
  if (error.name === 'CastError') err = handleCastErrorDB(error);
  else if (error.code === 11000) err = handleDuplicateErrorDB(error);
  else if (error.name === 'ValidationError') err = handleValidationErrorDB(error);

  sendErrorProd(err, res);
};
