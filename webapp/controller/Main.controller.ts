import Base from "./Base.controller";

/**
 * @namespace fioricert.controller
 */
export default class Main extends Base {
  public override onInit(): void {}

  public onNavigate() {
    this.getRouter().navTo("editor");
  }
}
