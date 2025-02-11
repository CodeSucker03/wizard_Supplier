import type Token from "sap/m/Token";
import type MessageProcessor from "sap/ui/core/message/MessageProcessor";
import type PropertyBinding from "sap/ui/model/PropertyBinding";
import type SimpleType from "sap/ui/model/SimpleType";

export interface BindingTarget<T> {
  name: string;
  path: string;
  target: string;
  processor?: MessageProcessor;
  bindingType?: SimpleType;
  binding: Nullable<PropertyBinding>;
  data: T;
}

export interface TokenValidatorPayload {
  text: string;
  suggestedToken?: Token;
  suggestedObject: object;
  asyncCallback?: (token: Token | null) => Promise<void>;
}
