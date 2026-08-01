const AppError = require('../utils/AppError');

const options = { abortEarly: false, allowUnknown: false, stripUnknown: false, convert: true };

module.exports = (schema, source = 'body') => (req, _res, next) => {
  const { error, value } = schema.validate(req[source], options);
  if (error) {
    const details = error.details.map((item) => ({
      field: item.path.join('.') || source,
      message: item.message.replaceAll('"', ''),
    }));
    return next(new AppError(400, 'Please correct the invalid request data', details));
  }

  if (source === 'query') Object.assign(req.query, value);
  else req[source] = value;
  next();
};
