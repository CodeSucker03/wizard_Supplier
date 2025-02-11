import isFinite from "lodash.isfinite";
import isInteger from "lodash.isinteger";
import toNumber from "lodash.tonumber";

class Numeric {
  public toNumber(value: unknown) {
    const valueAsNumber = toNumber(value);
    return isFinite(valueAsNumber) ? valueAsNumber : 0;
  }

  public isNumber(value: unknown): value is number {
    const valueAsNumber = toNumber(value);
    return isFinite(valueAsNumber);
  }

  public isInteger(value: unknown) {
    const valueAsNumber = toNumber(value);
    return isInteger(valueAsNumber) && valueAsNumber !== 0;
  }

  public isPositiveInteger(value: unknown) {
    const valueAsNumber = toNumber(value);
    return isInteger(valueAsNumber) && valueAsNumber > 0;
  }

  public isNegativeInteger(value: unknown) {
    const valueAsNumber = toNumber(value);
    return isInteger(valueAsNumber) && valueAsNumber < 0;
  }
}

export default new Numeric();
