import Base from "./Base.controller";

/**
 * @namespace fioricert.controller
 */
export default class NotFound extends Base {
  public override onInit(): void {}

  public onPressed() {
    this.getRouter().navTo("RouteMain");
  }
}
