import AppError from '../utils/appError.js';

const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateErrorDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\ ?. ) *? \1/)[0];
  const message = `duplicate field value: ${value}.Please use another value`;
  return new AppError(message, 400);
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
  if (!process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === 'development') {
    let errorCopy = { ...error };

    if (errorCopy.name === 'CastError')
      errorCopy = handleCastErrorDB(errorCopy);
    if (errorCopy.code === 11000) errorCopy = handleDuplicateErrorDB(errorCopy);
    if (errorCopy.name === 'ValidationError')
      errorCopy = handleValidationErrorDB(errorCopy);
    sendErrorProd(errorCopy, res);
  }
};
