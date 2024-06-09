import Joi from 'joi';
import { cryptoUtils } from '@coti-io/crypto';

const config_schema = Joi.object({
  FULL_NODE: Joi.string().uri().required(),
  TRUST_SCORE_NODE: Joi.string().uri().required(),
  CURRENCY_SYMBOL: Joi.string().required(),
  MNEMONIC: Joi.string()
    .custom((value, helpers) => {
      const mnemonic_array = value.split(' ');
      if (![12, 24].includes(mnemonic_array.length)) {
        return helpers.message({ custom: '"MNEMONIC" length must be 12 or 24' });
      }
      return value;
    })
    .required(),
  AMOUNT: Joi.number().required(),
  DESTINATION_ADDRESS: Joi.string()
    .custom((value, helpers) => {
      if (!cryptoUtils.verifyAddressStructure(value)) {
        return helpers.message({ custom: '"DESTINATION_ADDRESS" is not a valid address' });
      }
      return value;
    })
    .required(),
}).unknown();

export { config_schema };
