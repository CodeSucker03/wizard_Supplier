import ValidateException from "sap/ui/model/ValidateException";
import isEmail from "validator/es/lib/isEmail";
import { isFloat, isInt, isMobilePhone, isUUID } from "validator";
import { isCurrency } from "validator";
import isTaxID from "validator/lib/isTaxID";
import String from "sap/ui/model/type/String";

export class FieldEmail extends String {
  public constructor(...args: ConstructorParameters<typeof String>) {
    super(...args);
  }

  public override validateValue(value: string): void | Promise<void> {
    void super.validateValue(value);

    if (value !== "") {
      if (
        !isEmail(value, {
          // eslint-disable-next-line camelcase
          allow_utf8_local_part: false,
        })
      ) {
        throw new ValidateException("Invalid email address");
      }
    }
  }
}

export class FieldNationalID extends String {
  public constructor(...args: ConstructorParameters<typeof String>) {
    super(...args);
  }

  public override validateValue(value: string): void | Promise<void> {
    void super.validateValue(value);

    if (value !== "") {
      // Remove spaces and dashes
      const cleanValue = value.replace(/[\s-]/g, "");

      // - New format (CCCD): 12 digits
      const isNewFormat = /^\d{12}$/.test(cleanValue);

      if (!isNewFormat) {
        throw new ValidateException("Invalid Vietnam National ID. Must be 9 or 12 digits");
      }

      // For new format (12 digits), validate structure:
      // - First 3 digits: location code (001-096)
      // - Next 1 digit: gender and century (0-3 for male, 4-7 for female)
      // - Next 2 digits: year of birth (00-99)
      // - Last 6 digits: sequential number
      if (isNewFormat) {
        const locationCode = parseInt(cleanValue.substring(0, 3), 10);
        if (locationCode < 1 || locationCode > 96) {
          throw new ValidateException("Invalid location code in National ID");
        }
      }
    }
  }
}

export class FieldVNTaxID extends String {
  public constructor(...args: ConstructorParameters<typeof String>) {
    super(...args);
  }

  public override validateValue(value: string): void | Promise<void> {
    void super.validateValue(value);

    if (value !== "") {
      // Remove spaces and dashes
      const cleanValue = value.replace(/[\s-]/g, "");

      // Vietnam Tax ID (MST - Mã số thuế) formats:
      // - Personal: 10 digits
      // - Business: 10 digits or 13 digits (10 + 3 for branches)
      const isPersonalOrBusinessFormat = /^\d{10}$/.test(cleanValue);
      const isBranchFormat = /^\d{13}$/.test(cleanValue);

      if (!isPersonalOrBusinessFormat && !isBranchFormat) {
        throw new ValidateException("Invalid Vietnam Tax ID. Must be 10 or 13 digits");
      }
    }
  }
}

export class FieldPhone extends String {
  public constructor(...args: ConstructorParameters<typeof String>) {
    super(...args);
  }

  public override validateValue(value: string): void | Promise<void> {
    if (value !== "") {
      if (!isMobilePhone(value, ["vi-VN", "en-US"], { strictMode: false })) {
        throw new ValidateException("Invalid phone number");
      }
    }
  }
}

export class FieldCurrency extends String {
  public constructor(...args: ConstructorParameters<typeof String>) {
    super(...args);
  }

  public override validateValue(value: string): void | Promise<void> {
    if (value !== "") {
      if (
        !isCurrency(value, {
          // eslint-disable-next-line camelcase
          allow_negative_sign_placeholder: true,
        })
      ) {
        throw new ValidateException("Invalid Currency");
      }
    }
  }
}

export class FieldId extends String {
  public constructor(...args: ConstructorParameters<typeof String>) {
    super(...args);
  }

  public override validateValue(value: string): void | Promise<void> {
    if (value !== "") {
      if (!isUUID(value)) {
        throw new ValidateException("Invalid Id");
      }
    }
  }
}

export class FieldQuantity extends String {
  public constructor(...args: ConstructorParameters<typeof String>) {
    super(...args);
  }

  public override validateValue(value: string): void | Promise<void> {
    if (value !== "") {
      if (!isInt(value, { min: 0 })) {
        throw new ValidateException("Allowed only interger greater/equal 0  ");
      }
    }
  }
}
