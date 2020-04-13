const Joi = require('@hapi/joi');

module.exports.userValidation = data => {
    const schema = Joi.object({
        email: Joi.string()
            .min(5)
            .max(1024)
            .required()
            .email()
    });

    return schema.validate(data);
}