import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import type ComboBox from "sap/m/ComboBox";
import type Input from "sap/m/Input";
import type InputBase from "sap/m/InputBase";
import { URLHelper } from "sap/m/library";
import type MultiComboBox from "sap/m/MultiComboBox";
import type MultiInput from "sap/m/MultiInput";
import BusyIndicator from "sap/ui/core/BusyIndicator";
import type Control from "sap/ui/core/Control";
import UI5Element from "sap/ui/core/Element";
import Message from "sap/ui/core/message/Message";
import Controller from "sap/ui/core/mvc/Controller";
import type View from "sap/ui/core/mvc/View";
import syncStyleClass from "sap/ui/core/syncStyleClass";
import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";
import Model from "sap/ui/model/Model";
import type ODataModel from "sap/ui/model/odata/v2/ODataModel";
import type PropertyBinding from "sap/ui/model/PropertyBinding";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import type SimpleType from "sap/ui/model/SimpleType";
import type Component from "../Component";
import type { BindingTarget } from "../types/control";
import type { Dict } from "../types/utils";
import { Salary } from "../utils/dataTypes/Number";
import { FieldId, Phone } from "../utils/dataTypes/String";
import Formatter from "../utils/Formatter";

/**
 * @namespace fioricert.controller
 */
export default class Base extends Controller {
  public formatter = Formatter;
  public dataType = {
    Salary,
    FieldId,
    Phone,
  };
  public controlTypes: string[] = [
    "sap.m.Input",
    "sap.m.ComboBox",
    "sap.m.Select",
    "sap.m.MultiComboBox",
    "sap.m.MultiInput",
    "sap.m.DatePicker",
  ];

  protected getRouter() {
    return UIComponent.getRouterFor(this);
  }

  public getModel<T = JSONModel>(name?: string) {
    return this.getView()?.getModel(name) as T;
  }

  public setModel(model: Model, name?: string) {
    this.getView()?.setModel(model, name);
  }

  public getControlById<T = UI5Element>(id: string) {
    return this.getView()?.byId(id) as T;
  }

  public getControlId<T = string>(control: UI5Element): T;
  // eslint-disable-next-line no-dupe-class-members
  public getControlId<T = string | null>(control?: UI5Element): T;
  // eslint-disable-next-line no-dupe-class-members
  public getControlId<T = string | null>(control?: UI5Element) {
    if (!control) return null;
    return this.getView()?.getLocalId(control.getId()) as T;
  }

  protected reload() {
    // eslint-disable-next-line fiori-custom/sap-no-location-reload
    window.location.reload();
  }

  protected navigate(url: string, newWindow?: boolean) {
    URLHelper.redirect(url, newWindow);
  }

  protected navigateTo(route: string) {
    void this.getRouter().getTargets()?.display(route);
  }

  public attachControl(control: Control) {
    const view = <View>this.getView();

    const styleClass = this.getComponent().getContentDensityClass();

    syncStyleClass(styleClass, view, control);

    view.addDependent(control);
  }

  protected getBindingTarget<T extends Dict>(source: Control) {
    let binding: PropertyBinding | null = null;

    if (source.isA<Input | MultiInput>("sap.m.Input")) {
      if (source.isA<MultiInput>("sap.m.MultiInput")) {
        binding = <PropertyBinding>source.getBinding("tokens");
      } else {
        binding = <PropertyBinding>source.getBinding("value");
      }
    } else if (source.isA<ComboBox>(["sap.m.ComboBox", "sap.m.Select"])) {
      binding = <PropertyBinding>source.getBinding("selectedKey");
    } else if (source.isA<MultiComboBox>("sap.m.MultiComboBox")) {
      binding = <PropertyBinding>source.getBinding("selectedKeys");
    } else if (source.isA("sap.m.DatePicker")) {
      binding = <PropertyBinding>source.getBinding("value");
    }

    const context = binding?.getContext();

    const value: BindingTarget<T> = {
      name: binding?.getPath() ?? "", // Property name
      path: context?.getPath() ?? "", // Value binding path
      processor: context?.getModel(), // Binding model
      bindingType: <SimpleType>binding?.getType?.(), // Input data type
      data: context?.getObject() as T, // Binding object value
      binding,
      get target() {
        const path = this.path;
        const name = this.name;
        return `${path}${path === "/" ? "" : "/"}${name}`;
      },
    };

    return value;
  }

  protected getControlsByFieldGroup<T extends Control>(props: {
    container?: Control;
    groupId: string | string[];
    visibility?: "all" | "visible";
    types?: string[];
  }) {
    const { container, groupId, visibility = "visible", types } = props;

    return container?.getControlsByFieldGroupId(groupId).filter((control) => {
      const hasGroup = control.checkFieldGroupIds(groupId);

      const isInput = control.isA<InputBase>(types || this.controlTypes);

      const isVisible = visibility === "visible" ? control.getVisible() : true;

      return hasGroup && isInput && isVisible;
    }) as T[];
  }

  public getResourceBundle() {
    const model = <ResourceModel>this.getOwnerComponent()?.getModel("i18n");
    return <ResourceBundle>model.getResourceBundle();
  }

  protected getBundleText(i18nKey: string, placeholders?: string[]) {
    return this.getResourceBundle().getText(i18nKey, placeholders);
  }

  protected getComponent() {
    return this.getOwnerComponent() as Component;
  }

  protected getComponentModel<T = ODataModel>(name?: string) {
    return this.getOwnerComponent()?.getModel(name) as T;
  }

  protected setComponentModel(model: Model, name?: string) {
    this.getOwnerComponent()?.setModel(model, name);
  }

  protected getErrorHandler() {
    return this.getComponent().getErrorHandler();
  }

  protected getMessageManager() {
    return this.getComponent().getMessageManager();
  }

  protected addMessages(message: ConstructorParameters<typeof Message>[0]) {
    this.getMessageManager().addMessages(new Message(message));
  }

  protected getMetadataLoaded() {
    return this.getComponentModel().metadataLoaded();
  }

  protected showBusyIndicator() {
    BusyIndicator.show();
  }

  protected hideBusyIndicator() {
    BusyIndicator.hide();
  }

  protected async loadView<T extends Control>(viewName: string) {
    const fragment = <Promise<T>>this.loadFragment({
      name: `sphinxjsc.com.ems.view.fragments.${viewName}`,
    });

    fragment
      .then((control) => {
        this.attachControl(control);
      })
      .catch((error) => {
        console.log(error);
      });

    return fragment;
  }

  protected getServiceUrl(dataSource?: string) {
    const entry = `/sap.app/dataSources/${dataSource || "mainService"}/uri`;
    const serviceUrl = <string>(<Component>this.getOwnerComponent()).getManifestEntry(entry);

    return serviceUrl;
  }
}
