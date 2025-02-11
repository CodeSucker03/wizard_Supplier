import String from "sap/ui/model/type/String";
import ValidateException from "sap/ui/model/ValidateException";
import Regexps from "../RegExps";
import Numeric from "../Numeric";

export class FieldId extends String {
  public constructor(...args: ConstructorParameters<typeof String>) {
    super(...args);
  }

  public override validateValue(value: string): void | Promise<undefined> {
    void super.validateValue(value);

    if (value !== "") {
      if (!Regexps.isFieldId(value)) {
        throw new ValidateException(
          "Value must contain only letters, numbers, hyphens, and underscores"
        );
      }
    }
  }
}

export class Phone extends String {
  public constructor(...args: ConstructorParameters<typeof String>) {
    super(...args);
  }

  public override validateValue(value: string): void | Promise<undefined> {
    void super.validateValue(value);

    if (value !== "") {
      if (!Numeric.isInteger(value)) {
        throw new ValidateException("Invalid value");
      }

      if (value.length !== 10) {
        throw new ValidateException("Invalid value");
      }
    }
  }
}
