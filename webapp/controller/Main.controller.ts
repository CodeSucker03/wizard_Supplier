import DatePicker from "sap/m/DatePicker";
import Base from "./Base.controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import type Wizard from "sap/m/Wizard";
import WizardStep from "sap/m/WizardStep";
import type Dialog from "sap/m/Dialog";
import Input from "sap/m/Input";
import TextArea from "sap/m/TextArea";
import ComboBox from "sap/m/ComboBox";
import MessageBox from "sap/m/MessageBox";
import type { Select$ChangeEvent } from "sap/m/Select";
import type { Button$PressEvent } from "sap/m/Button";
import type MultiComboBox from "sap/m/MultiComboBox";
import InputBase, { type InputBase$ChangeEvent } from "sap/m/InputBase";
import type Router from "sap/ui/core/routing/Router";
import type { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import type Control from "sap/ui/core/Control";

import type TimePicker from "sap/m/TimePicker";
import type { CheckBox$SelectEvent } from "sap/m/CheckBox";
import type { ODataError, ODataErrorResponse, ODataResponses } from "fioricert/types/odata";
import type { AccModelData, MaterialUnit, MatklLv1, MatklLv2, MessageBoxType } from "fioricert/types/pages/main";
import type Page from "sap/m/Page";
import type Message from "sap/ui/core/message/Message";
import type Messaging from "sap/ui/core/Messaging";

/**
 * @namespace fioricert.controller
 */

interface ValidateResult {
  isValid: boolean;
  wizardStep: number;
  input: InputBase;
}
export default class Main extends Base {
  private router: Router;

  private wizard: Wizard;
  private WizardContentPage: Page;
  private steps: WizardStep[];
  private firstStep: WizardStep;
  private lastStep: WizardStep;

  private StepValidates: boolean[] = [];
  private dialog: Dialog;
  private FieldValidates: { [key: string]: ValidateResult } = {}; // inputid is key

  // Messages
  private MessageManager: Messaging;

  public override onInit() {
    // let datePicker = this.getControlById<DatePicker>("ngayThanhLap");
    // let today = new Date();
    // today.setHours(0, 0, 0, 0);
    // datePicker.setMaxDate(today);
    // datePicker.attachChange(this.onDateChange.bind(this));

    // #region Model
    const accModelData: AccModelData = {
      Username: "",
      Otp: "",
      Website: "",
      Agree: false,
      CompanyName: "",
      Status: "",
      Taxnumber: "",
      CompanyAddress: "",
      NddNationality: "Việt Nam",

      NddTitle: "1",
      NddHoten: "",
      NddChucvu: "",
      NddIdnumber: "",

      DmTitle: "1",
      DmHoten: "",
      DmChucvu: "",
      DmSdt: "",
      DmEmail: "",

      Gioithieu: "",
      Quymo: "",

      ToNCCMaterial: [
        {
          Username: "",
          MatklLv1: "",
          MatklLv2: "",
          Matkl: "",
          MatklLv1Txt: "",
          MatklLv2Txt: "",
          MatklTxt: "",
        },
      ],

      Phamvi1: "",
      Phamvi2: "",
      Phamvi3: "",
      Phamvi4: "",

      DtYear1: "",
      DtYear2: "",
      DtYear3: "",

      DtAmount1: "",
      DtAmount2: "",
      DtAmount3: "",

      LnYear1: "",
      LnYear2: "",
      LnYear3: "",

      LnAmount1: "",
      LnAmount2: "",
      LnAmount3: "",

      CharterCapital: "",
      Waers: "VND",
    };
    const accModel = new JSONModel(accModelData);
    this.getView()?.setModel(accModel, "accModel");

    this.setModel(
      new JSONModel({
        rows: [],
        LV1: [],
        LV2: [],
        LV3: [],
      }),
      "hanghoa"
    );

    this.setModel(
      new JSONModel({
        check: false,
      }),
      "checkDangky"
    );

    this.router = this.getRouter();

    // Messages
    this.MessageManager = this.getMessageManager();

    // Wizard
    this.WizardContentPage = this.getControlById("wizardContentPage");

    // Router
    this.router.getRoute("RouteMain")?.attachMatched(this.onObjectMatched);
  }

  private onObjectMatched = (event: Route$MatchedEvent) => {
    this.getHH();

    this.wizard = this.byId("registerWizard") as Wizard;
    this.steps = this.wizard.getSteps();

    // Find all datepicker controls in step 2
    const allControls = <Control[]>this.steps[3].findAggregatedObjects(true);
    allControls.forEach((control) => {
      if(this.isControl(control, "sap.m.DatePicker")){
        const today = new Date();
        (<DatePicker>control).setMaxDate(today);

      }
    });

    let datePicker = this.getControlById<DatePicker>("");
    

    this.attachInputBaseChange();
  };

  public onAcceptTerms(oEvent: CheckBox$SelectEvent) {
    const Selected = oEvent.getSource().getSelected();
    let Total = true;
    if (this.firstStep) {
      this.StepValidates[0] = Selected;
      this.firstStep.setValidated(Selected);
      console.log(this.StepValidates);
    }

    // bToTal true when every step is validated
    this.StepValidates.forEach((bValid) => {
      Total = Total && bValid;
    });

    // this.lastStep.setValidated(false); undefined
  }

  public onDateChange() {
    const datePicker = this.getControlById<DatePicker>("ngayThanhLap");
    const value = datePicker.getDateValue();
    const today = new Date();
    if (value && value > today) {
      datePicker.setProperty("/ThanhLap", value);
      datePicker.setValueState("Error");
      datePicker.setValueStateText("Chọn ngày quá khứ hoặc hiện tại");
    } else {
      datePicker.setValueState("None");
    }
  }

  // #region Listener

  private attachInputBaseChange() {
    this.wizard = this.byId("registerWizard") as Wizard;
    this.steps = this.wizard.getSteps();

    if (this.steps.length === 0) {
      console.warn("⚠️ Wizard chưa có steps!");
      return;
    }

    this.firstStep = this.steps[0];
    this.StepValidates = Array<boolean>(this.steps.length).fill(false);

    this.steps.forEach((step, index) => {
      if (index === this.steps.length - 1) {
        this.lastStep = step;
      }

      // Find all controls in steps
      const allControls = <Control[]>step.findAggregatedObjects(true);

      if (allControls.length > 0) {
        allControls.forEach((Input) => {
          if (Input instanceof InputBase) {
            const fieldId = Input.getId();

            const initValidated = !this.validateControl(Input);

            this.FieldValidates[fieldId] = {
              isValid: initValidated,
              wizardStep: index,
              input: Input,
            };

            console.log("field", this.FieldValidates[fieldId]);

            // For specific cases attach change / live change
            switch (true) {
              case this.isControl<Input>(Input, "sap.m.Input"): {
                Input.attachLiveChange(this.onInputChange.bind(this));
                break;
              }

              case this.isControl<TextArea>(Input, "sap.m.TextArea"): {
                Input.attachLiveChange(this.onInputChange.bind(this));

                break;
              }

              case this.isControl<DatePicker>(Input, "sap.m.DatePicker"):
              case this.isControl<TimePicker>(Input, "sap.m.TimePicker"): {
                Input.attachChange(this.onInputChange.bind(this));
                break;
              }

              case this.isControl<ComboBox>(Input, "sap.m.ComboBox"): {
                Input.attachChange(this.onInputChange.bind(this));
                break;
              }
              default:
                break;
            }
          }
        });
      }
    });
  }

  public onInputChange(oEvent: InputBase$ChangeEvent) {
    const Input = oEvent.getSource();
    const InputId = Input.getId();

    let Total = true;

    if (InputId in this.FieldValidates) {
      const currentStep = this.FieldValidates[InputId].wizardStep;

      const Error = this.validateControl(Input); // redo this part
      this.FieldValidates[InputId].isValid = !Error;

      // Decide whether the current step is validated by checking whether all input valid
      Object.keys(this.FieldValidates).forEach((key) => {
        const fieldValidate = this.FieldValidates[key];

        if (fieldValidate.wizardStep === currentStep) {
          if (fieldValidate.isValid === false) {
            console.log("fieldValidate", fieldValidate);
          }

          Total = Total && fieldValidate.isValid;
        }
      });
      // check to validate the step 2 to included at least a row
      // if (currentStep === 2) {
      //   if (arrHH.length <= 0) {
      //     bTotal = false
      //   } else {
      //     bTotal = true;
      //   }
      // }
      this.steps[currentStep].setValidated(Total);
      this.StepValidates[currentStep] = Total;
    }
    Total = true;

    this.StepValidates.forEach((valid) => {
      Total = Total && valid;
    });

    this.lastStep.setValidated(Total);
    console.log(this.StepValidates);
  }

  public getOtp() {
    try {
      // Get form values
      const username = this.getControlById<Input>("tenTaiKhoan").getValue()?.trim();
      const email = this.getControlById<Input>("email").getValue()?.trim();
      const companyName = this.getControlById<Input>("tenCongty")
        .getValue()
        ?.replace(/[^\p{L}\p{N}\s]/gu, "")
        .trim();

      // Validate required fields
      if (!username) {
        MessageBox.error("Vui lòng nhập tên tài khoản");
        return;
      }

      if (!email) {
        MessageBox.error("Vui lòng nhập email");
        return;
      }

      if (!companyName) {
        MessageBox.error("Vui lòng nhập tên công ty");
        return;
      }

      // Get model and configure
      const modelMetadata = this.getComponentModel("DKNCC");
      modelMetadata.setUseBatch(false);

      // Create OTP request
      const path = "/EmailOTPSet";
      modelMetadata.create(
        path,
        {
          Username: username,
          Email: email,
          CompanyName: companyName,
        },
        {
          success: (odata: ODataResponses) => {
            MessageBox.success("Gửi OTP thành công");
          },
          error: (error: Error) => {
            console.log(error);
          },
        }
      );
    } catch (error) {
      console.error("Unexpected error in getOtp:", error);
      MessageBox.error("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.");
    }
  }

  public checkCombobox(): void {
    const combobox1 = this.getControlById<ComboBox>("select1").getSelectedKey();
    const combobox2 = this.getControlById<ComboBox>("select2").getSelectedKey();
    const combobox3 = this.getControlById<ComboBox>("select3").getSelectedKey();
    const allSelect = Boolean(combobox1 && combobox2 && combobox3);
    this.getControlById<ComboBox>("buttonCombobox").setEnabled(allSelect);
  }

  public async onDialog() {
    if (!this.dialog) {
      this.dialog = await (<Promise<Dialog>>this.loadFragment({
        name: "fioricert.view.fragments.DialogTH",
      }));
    }
    this.dialog.open();
  }

  public closeDialog() {
    this.dialog.close();
  }

  public getHH() {
    const table = this.getModel("hanghoa");
    const modelMetadata = this.getComponentModel("DKNCC");
    modelMetadata.setUseBatch(false);
    const path = "/MaterialLv1Set";
    modelMetadata.read(path, {
      urlParameters: {
        $expand: "ToMaterialLv2/ToMaterialGroup",
        $format: "json",
      },
      success: (res: ODataResponses) => {
        console.log("HH odata", res.results);
        table.getProperty("/rows");
        table.setProperty("/LV1", res.results);
      },
      error: (error: ODataErrorResponse) => {
        console.log(error);
      },
    });
  }

  public onSelectLV1(event: Select$ChangeEvent) {
    const select = event.getSource().getSelectedItem();

    const model = this.getModel("hanghoa");

    const rows = <MatklLv1[]>model.getProperty("/LV1");

    const data = rows.filter((item) => {
      return select?.getKey() === item.MatklLv1;
    });

    model.setProperty("/LV2", data[0].ToMaterialLv2.results);
  }

  public onSelectLV2(event: Select$ChangeEvent) {
    const select = event.getSource().getSelectedItem();

    const model = this.getModel("hanghoa");

    const rows = <MatklLv2[]>model.getProperty("/LV2");

    const data = rows.filter((item) => {
      return select?.getKey() === item.MatklLv2;
    });

    model.setProperty("/LV3", data[0].ToMaterialGroup.results);
  }

  // On Save add Material (Step 3)
  public onSaveNTC(event: Button$PressEvent) {
    const model = this.getModel("hanghoa");
    const select1 = this.getControlById<ComboBox>("select1");
    const select2 = this.getControlById<ComboBox>("select2");
    const select3 = this.getControlById<ComboBox>("select3");

    const rows = <MaterialUnit[]>model.getProperty("/rows");

    const value2 = <string>select1.getSelectedItem()?.getBindingContext("hanghoa")?.getProperty("MatklLv1Txt");
    const value3 = <string>select2.getSelectedItem()?.getBindingContext("hanghoa")?.getProperty("MatklLv2Txt");
    const value1 = <string>select3.getSelectedItem()?.getBindingContext("hanghoa")?.getProperty("MatklTxt");
    const MatklLv1 = <string>select1.getSelectedItem()?.getBindingContext("hanghoa")?.getProperty("MatklLv1");
    const MatklLv2 = <string>select2.getSelectedItem()?.getBindingContext("hanghoa")?.getProperty("MatklLv2");
    const Matkl = <string>select3.getSelectedItem()?.getBindingContext("hanghoa")?.getProperty("Matkl");

    const row: MaterialUnit = {
      MatklLv1: Matkl,
      MatklLv2: MatklLv1,
      Matkl: MatklLv2,
      MatklTxt: value1,
      MatklLv1Txt: value2,
      MatklLv2Txt: value3,
    };

    select1.setSelectedKey("");
    select2.setSelectedKey("");
    select3.setSelectedKey("");

    rows.push(row);
    console.log(rows);

    this.steps[2].setValidated(true);
    this.StepValidates[2] = true;

    model.setProperty("/rows", rows);

    const sumbitButton = event.getSource();
    sumbitButton.setEnabled(false);

    // this.checkCombobox();
    this.closeDialog();
  }

  public onSumbit() {
    console.log("test submit");
    try {
      const accModel = this.getModel("accModel");
      const newAcc = <AccModelData>accModel.getData();

      newAcc.Username = newAcc.Username.replace(/[^a-zA-Z0-9]/g, "").trim();
      newAcc.Website = newAcc.Website.replace(/[^a-zA-Z0-9]/g, "").trim();
      newAcc.CompanyName = newAcc.CompanyName.replace(/[^\p{L}\p{N}\s]/gu, "");
      newAcc.CompanyAddress = newAcc.CompanyAddress.replace(/[^\p{L}\p{N}\s]/gu, "");
      newAcc.DmHoten = newAcc.DmHoten.replace(/[^\p{L}\p{N}\s]/gu, "");
      newAcc.DmChucvu = newAcc.DmChucvu.replace(/[^\p{L}\p{N}\s]/gu, "");
      newAcc.NddChucvu = newAcc.NddChucvu.replace(/[^\p{L}\p{N}\s]/gu, "");

      const control = this.getControlById<MultiComboBox>("test1");
      const value = control.getSelectedKeys();

      value.forEach((item) => {
        if (item === "1") {
          newAcc.Phamvi1 = "X";
        }
        if (item === "2") {
          newAcc.Phamvi1 = "X";
        }
        if (item === "3") {
          newAcc.Phamvi1 = "X";
        }
        if (item === "4") {
          newAcc.Phamvi1 = "X";
        }
      });

      const cargoModel = this.getModel("hanghoa");
      const ToNCCMaterial = <MaterialUnit>cargoModel.getProperty("/rows");

      // Lack of username ?
      // newAcc.ToNCCMaterial = ToNCCMaterial;

      cargoModel.setProperty("", newAcc);

      const modelMetadata = this.getComponentModel("DKNCC");
      modelMetadata.setUseBatch(false);

      modelMetadata.create("/NewNCCSet", newAcc, {
        success: (odata: any) => {
          cargoModel.setProperty("/Agree", false);
          this.toggleButton("chkAgree", false);
          MessageBox.success("Tạo tài khoản nhà cung cấp thành công");
        },
        error: (error: ODataError) => {
          // MessageBox.error(error.responseText.match(/"value":"(.*?)"/)[1]);
        },
      });
    } catch {
      MessageBox.error("Lỗi");
    }
  }

  public handleWizardCancel() {
    this.handleMessageBoxOpen("Are you sure you want to cancel your report?", "warning");
  }

  private handleNavigationToStep(iStepNumber: number) {
    this.wizard.goToStep(this.wizard.getSteps()[iStepNumber], false);
  }

  // #region Valiate


  private validateNumericInput(id: string) {
    // validate numeric input less than 15 digits

    const input = this.getControlById<Input>(id);
    let value = input.getValue();

    // Remove sign
    if (value.startsWith("-")) {
      value = value.slice(1);
    }

    // Keep digits only
    value = value.replace(/\D/g, "");

    // Limit to max 15 digits
    if (value.length > 15) {
      value = value.slice(0, 15);
    }

    // Update cleaned value back to input
    input.setValue(value);

    // Validation
    if (!value) {
      input.setValueState("Error");
      input.setValueStateText("Phải nhập đúng định dạng");
    } else {
      input.setValueState("None");
      input.setValueStateText("");
    }
  }

  // #region message

  private handleMessageBoxOpen(Message: string, MessageBoxType: MessageBoxType) {
    MessageBox[MessageBoxType](Message, {
      actions: [MessageBox.Action.YES, MessageBox.Action.NO],
      onClose: (oAction: unknown) => {
        if (oAction === MessageBox.Action.YES) {
          this.handleNavigationToStep(0);
          this.wizard.discardProgress(this.wizard.getSteps()[0], true);
        }
      },
    });
  }

  // Remove message from a control target path
  private removeMessageFromTarget(target: string): void {
    const messages = this.getMessages();

    messages.forEach((message) => {
      if (message.getTargets().includes(target)) {
        this.MessageManager.removeMessages(message);
      }
    });
  }

  private getMessages() {
    return <Message[]>this.MessageManager.getMessageModel().getData();
  }

  private validateControl(control: InputBase): boolean {
    let isError = false;

    const { target, label, processor, bindingType, model } = this.getBindingContextInfo(control);

    if (!target || !model) {
      return isError;
    }

    this.removeMessageFromTarget(target);

    let requiredError = false;

    let outOfRangeError = false;
    let dateRangeError = false;
    let pastDateError = false;

    let value: string = "";

    switch (true) {
      case this.isControl<Input>(control, "sap.m.Input"): {
        value = control.getValue().trim();

        if (!value && control.getRequired()) {
          requiredError = true;
        }

        break;
      }

      case this.isControl<TextArea>(control, "sap.m.TextArea"): {
        value = control.getValue().trim();

        if (!value && control.getRequired()) {
          requiredError = true;
        }

        break;
      }

      case this.isControl<DatePicker>(control, "sap.m.DatePicker"): {
        value = control.getValue();

        if (!value && control.getRequired()) {
          requiredError = true;
        } else if (value && !control.isValidValue()) {
          outOfRangeError = true;
        } else {
          console.log("Date Eror");
        }

        break;
      }

      case this.isControl<ComboBox>(control, "sap.m.ComboBox"): {
        value = control.getSelectedKey();

        const input = control.getValue().trim();

        if (!value && input) {
          outOfRangeError = true;
        } else if (!value && control.getRequired()) {
          requiredError = true;
        }

        break;
      }
      default:
        break;
    }

    // Set Error and Message
    if (requiredError) {
      this.addMessages({
        message: "Required",
        type: "Error",
        additionalText: label,
        target,
        processor,
      });

      isError = true;
    } else if (outOfRangeError) {
      this.addMessages({
        message: "Invalid value",
        type: "Error",
        additionalText: label,
        target,
        processor,
      });

      isError = true;
    } else if (pastDateError) {
      this.addMessages({
        message: "Date cannot be in the past",
        type: "Error",
        additionalText: label,
        target,
        processor,
      });

      isError = true;
    } else if (dateRangeError) {
      this.addMessages({
        message: "Start date must be before end date",
        type: "Error",
        additionalText: label,
        target,
        processor,
      });

      isError = true;
    } else if (bindingType) {
      try {
        void bindingType.validateValue(value);
      } catch (error) {
        const { message } = <Error>error;

        this.addMessages({
          message,
          type: "Error",
          additionalText: label,
          target,
          processor,
        });

        isError = true;
      }
    }

    return isError;
  }

  public wizardCompeleteHandler() {
    const ngayT1 = this.getControlById<DatePicker>("ngayThanhLap").getValue();
    this.getModel("accModel").setProperty("/Thanhlap", this.getSAPDateValue("ngayThanhLap"));
    this.onSumbit();
  }

  public onNavigate() {
    this.getRouter().navTo("editor");
  }
}
