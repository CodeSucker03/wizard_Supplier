import NumberFormat from "sap/ui/core/format/NumberFormat";
import ValidateException from "sap/ui/model/ValidateException";
import Float from "sap/ui/model/type/Float";
import Numeric from "../Numeric";

export class Salary extends Float {
  public constructor(...args: ConstructorParameters<typeof Float>) {
    super(...args);
  }

  public override validateValue(value: string): void | Promise<undefined> {
    void super.validateValue(value);

    const parsed = NumberFormat.getFloatInstance({
      decimalSeparator: ",",
      groupingSeparator: ".",
      parseAsString: true,
      emptyString: "",
      pattern: "#,###.##", // Vietnamedong
    }).parse(value);

    // Validate only when input data is not empty, otherwise it will be handled by required validation
    if (parsed !== "") {
      if (!Numeric.isNumber(parsed) || !Numeric.isInteger(parsed)) {
        throw new ValidateException("Invalid value");
      }

      // In case of using advanced validation with constraints
      if (parsed <= 0) {
        throw new ValidateException("Enter a number greater than 0");
      }
    }
  }
}
