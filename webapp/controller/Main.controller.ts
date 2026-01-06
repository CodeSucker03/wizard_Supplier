import DatePicker from "sap/m/DatePicker";
import Base, { formControlTypes, type FormControlType } from "./Base.controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import type Wizard from "sap/m/Wizard";
import WizardStep from "sap/m/WizardStep";
import type Dialog from "sap/m/Dialog";
import Input, { type Input$LiveChangeEvent } from "sap/m/Input";
import TextArea from "sap/m/TextArea";
import ComboBox from "sap/m/ComboBox";
import MessageBox from "sap/m/MessageBox";
import type { Select$ChangeEvent } from "sap/m/Select";
import type { Button$PressEvent } from "sap/m/Button";
import type Button from "sap/m/Button";
import type MultiComboBox from "sap/m/MultiComboBox";
import InputBase, { type InputBase$ChangeEvent } from "sap/m/InputBase";
import type Router from "sap/ui/core/routing/Router";
import type { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import type Control from "sap/ui/core/Control";

import type TimePicker from "sap/m/TimePicker";
import type { CheckBox$SelectEvent } from "sap/m/CheckBox";
import type { ODataError, ODataErrorResponse, ODataResponses } from "fioricert/types/odata";
import type { AccModelData, MaterialUnit, MatklLv1, MatklLv2 } from "fioricert/types/pages/main";

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
  private steps: WizardStep[];
  private StepValidates: boolean[] = [];
  private firstStep: WizardStep;
  private lastStep: WizardStep;
  private dialog: Dialog;
  private FieldValidates: { [key: string]: ValidateResult } = {}; // inputid is key

  // Messages
  private MessageButton?: Button;
  // private MessageManager: Messaging;
  // private MessagePopover: MessagePopover;
  // private toolbarSpacer?: ToolbarSpacer;
  // private footerToolbar: OverflowToolbar;

  public override onInit() {
    let datePicker = this.getControlById<DatePicker>("ngayThanhLap");
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    datePicker.setMaxDate(today);
    datePicker.attachChange(this.onDateChange.bind(this));

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
    // this.MessageManager = this.getMessageManager();

    // Router
    this.router.getRoute("RouteMain")?.attachMatched(this.onObjectMatched);
  }


  
  private onObjectMatched = (event: Route$MatchedEvent) => {
    this.getHH();

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
        allControls.forEach((oInput) => {
          if (oInput instanceof InputBase) {
            const fieldId = oInput.getId();

            const initValidated = !this.validateInput(oInput, false);

            this.FieldValidates[fieldId] = {
              isValid: initValidated,
              wizardStep: index,
              input: oInput,
            };

            console.log("field", this.FieldValidates[fieldId]);

            // For specific cases attach change / live change
            switch (true) {
              case this.isControl<Input>(oInput, "sap.m.Input"): {
                oInput.attachLiveChange(this.onInputChange.bind(this));
                break;
              }

              case this.isControl<TextArea>(oInput, "sap.m.TextArea"): {
                oInput.attachLiveChange(this.onInputChange.bind(this));

                break;
              }

              case this.isControl<DatePicker>(oInput, "sap.m.DatePicker"):
              case this.isControl<TimePicker>(oInput, "sap.m.TimePicker"): {
                oInput.attachChange(this.onInputChange.bind(this));
                break;
              }

              case this.isControl<ComboBox>(oInput, "sap.m.ComboBox"): {
                oInput.attachChange(this.onInputChange.bind(this));
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
    const oInput = oEvent.getSource();
    const sInputId = oInput.getId();

    let bTotal = true;

    if (sInputId in this.FieldValidates) {
      const currentStep = this.FieldValidates[sInputId].wizardStep;

      const bError = this.validateInput(oInput as Input, true); // redo this part
      this.FieldValidates[sInputId].isValid = !bError;

      // Decide whether the current step is validated by checking whether all input valid
      Object.keys(this.FieldValidates).forEach((key) => {
        const fieldValidate = this.FieldValidates[key];

        if (fieldValidate.wizardStep === currentStep) {
          console.log("fieldValidate", fieldValidate);

          bTotal = bTotal && fieldValidate.isValid;
        }
      });
      // if (currentStep === 2) {
      //   if (arrHH.length <= 0) {
      //     bTotal = false
      //   } else {
      //     bTotal = true;
      //   }
      // }
      console.log(bTotal);
      this.steps[currentStep].setValidated(bTotal);
      this.StepValidates[currentStep] = bTotal;
    }
    bTotal = true;

    this.StepValidates.forEach((bValid) => {
      bTotal = bTotal && bValid;
    });

    this.lastStep.setValidated(bTotal);
    console.log(this.StepValidates);
  }
 
  public getOtp() {
    const modelMetadata = this.getComponentModel("DKNCC");
    const Username = this.getControlById<Input>("tenTaiKhoan").getValue();
    const Email = this.getControlById<Input>("email").getValue();
    const CompanyName = this.getControlById<Input>("tenCongty")
      .getValue()
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .trim();
    modelMetadata.setUseBatch(false);
    const path = "/EmailOTPSet";
    modelMetadata.create(
      path,
      {
        Username: Username,
        Email: Email,
        CompanyName: CompanyName,
      },
      {
        success: (odata: any) => {
          MessageBox.success("Gửi OTP thành công");
        },
        error: (error: Error) => {
          console.log(error);
        },
      }
    );
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

    console.log(row);

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
    console.log("test");
    try {
      const model = this.getModel("accModel");
      const model1 = this.getModel("hanghoa");
      const newAcc = <AccModelData>model.getData();

      // newAcc.Agree = newAcc.Agree ? "Y" : "N";

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

      const ToNCCMaterial = model1.getProperty("/rows");
      newAcc.ToNCCMaterial = ToNCCMaterial;

      model.setProperty("", newAcc);
      model.getProperty("/rows");

      const modelMetadata = this.getComponentModel("DKNCC");
      modelMetadata.setUseBatch(false);

      modelMetadata.create("/NewNCCSet", newAcc, {
        success: (odata: any) => {
          model.setProperty("/Agree", false);
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

  // #region Valiate

  public validateTenTk() {
    const input = this.getControlById<Input>("tenTaiKhoan");
    let value = input.getValue().trim();
    const regex = /^[a-zA-Z0-9]{3,12}$/;
    if (!regex.test(value)) {
      value = value.replace(/[^a-zA-Z0-9]/g, "");
      input.setValue(value);
      this.getControlById<Input>("tenTaiKhoan").setValueState("Error");
      this.getControlById<Input>("tenTaiKhoan").setValueStateText(
        "Tên tài khoản có độ dài từ 3 đến 12 ký tự viết liền không dấu,không chưa khoảng trắng"
      );
    } else {
      this.getControlById<Input>("tenTaiKhoan").setValueState("None");
    }
  }

  public validateTenCty() {
    this.validateRequiredInput("tenCongty");
  }

  // Given MST is string
  public validateMst() {
    const input = this.getControlById<Input>("masothue");
    let value = input.getValue();

    if (value.startsWith("-")) {
      value = value.slice(1);
    }

    // (10–15 characters)
    const isValidLength = value.length >= 10 && value.length <= 15;

    if (!value || !isValidLength) {
      // Invalid MST
      input.setValueState("Error");
      input.setValueStateText("Mã số thuế phải có từ 10 đến 15 ký tự");
    } else {
      // Valid MST
      input.setValueState("None");
      input.setValueStateText("");
    }
  }

  public validateSdd() {
    const input = this.getControlById<Input>("sodinhdanh");
    let value = input.getValue();
    if (value.startsWith("-")) {
      value = value.slice(1);
      input.setValue(value);
    }

    if (value.length !== 12) {
      this.getControlById<Input>("sodinhdanh").setValueState("Error");
      this.getControlById<Input>("sodinhdanh").setValueStateText("Phải nhập đúng 12 số");
    } else {
      this.getControlById<Input>("sodinhdanh").setValueState("None");
    }
  }

  public validateDiachi() {
    this.validateRequiredInput("diachi");
  }

  public validateHoTen() {
    this.validateRequiredInput("hoten");
  }

  public validateFullname() {
    this.validateRequiredInput("fullName");
  }

  public validateChucVu() {
    this.validateRequiredInput("chucvu");
  }

  // For simple validation required/non-empty input
  private validateRequiredInput(id: string) {
    const input = this.getControlById<Input>(id);
    const value = input.getValue().trim();

    if (value.length < 1) {
      input.setValueState("Error");
      input.setValueStateText("Không được để trống hoặc chỉ nhập 1 ký tự");
    } else {
      input.setValueState("None");
      input.setValueStateText("");
    }
  }

  public validateSdt() {
    const input = this.getControlById<Input>("sdt");
    let value = input.getValue();
    if (value.startsWith("-")) {
      value = value.slice(1);
      input.setValue(value);
    }

    // Keep digits only
    value = value.replace(/\D/g, "");

    // Write cleaned value back
    input.setValue(value);

    // Validate exactly 10 digits
    if (value.length !== 10) {
      input.setValueState("Error");
      input.setValueStateText("Phải nhập đúng 10 số");
    } else {
      input.setValueState("None");
      input.setValueStateText("");
    }
  }

  public validateEmail() {
    // const input = this.getControlById<Input>("email");
    // // Simple but acceptable email pattern
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // input.setValue(value);
    // if (!emailRegex.test(value)) {
    //   input.setValueState("Error");
    //   input.setValueStateText("Nhập đúng định dạng email");
    // } else {
    //   input.setValueState("None");
    //   input.setValueStateText("");
    // }
  }

  public validateNguoiGt() {
    this.validateRequiredInput("nguoiGioithieu");
  }

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

  public validateQmns() {
    this.validateNumericInput("quyMonhansu");
  }

  public validateVdl() {
    this.validateNumericInput("validateVdl");
  }

  private validateYear(id: string) {
    const input = this.getControlById<Input>(id);
    let value = input.getValue();

    // Keep digits only
    value = value.replace(/\D/g, "");

    // Limit to 4 digits
    if (value.length > 4) {
      value = value.slice(0, 4);
    }

    // Update cleaned value back to input
    input.setValue(value);

    // Empty check
    if (!value) {
      input.setValueState("Error");
      input.setValueStateText("Năm không được để trống và phải nhập đúng định dạng");
      return;
    }

    // Must be exactly 4 digits
    if (value.length !== 4) {
      input.setValueState("Error");
      input.setValueStateText("Năm phải gồm 4 chữ số");
      return;
    }

    // Must start with 1 or 2
    if (!/^[12]\d{3}$/.test(value)) {
      input.setValueState("Error");
      input.setValueStateText("Năm phải nằm trong khoảng 1000–2999");
      return;
    }

    // Valid
    input.setValueState("None");
    input.setValueStateText("");
  }

  public validateNam1() {
    this.validateYear("nam1");
  }
  public validateNam2() {
    this.validateYear("nam2");
  }

  public validateNam3() {
    this.validateYear("nam3");
  }

  public validateNam4() {
    this.validateYear("nam4");
  }

  public validateNam5() {
    this.validateYear("nam5");
  }
  public validateNam6() {
    this.validateYear("nam6");
  }

  public validateGiatri1() {
    this.validateSignedInteger("gt1");
  }

  public validateGiatri2() {
    this.validateSignedInteger("gt2");
  }

  public validateGiatri3() {
    this.validateSignedInteger("gt3");
  }

  public validateGiatri4() {
    this.validateSignedInteger("gt4");
  }

  public validateGiatri5() {
    this.validateSignedInteger("gt5");
  }

  public validateGiatri6() {
    this.validateSignedInteger("gt6");
  }

  private validateSignedInteger(id: string) {
    const input = this.getControlById<Input>(id);
    let value = input.getValue();

    // Keep optional leading minus, digits only
    value = value.replace(/[^\d-]/g, "");

    // Ensure minus is only at the start
    if (value.includes("-")) {
      value = (value.startsWith("-") ? "-" : "") + value.replace(/-/g, "");
    }

    // Limit total length to 15 characters
    if (value.length > 15) {
      value = value.slice(0, 15);
    }

    // Write cleaned value back
    input.setValue(value);

    // Validation
    if (!value || value === "-") {
      input.setValueState("Error");
      input.setValueStateText("Phải nhập đúng định dạng");
    } else {
      input.setValueState("None");
      input.setValueStateText("");
    }
  }

  private validateControl(control: InputBase): boolean {
    let isError = false;

    const { target, label, processor, bindingType, model } = this.getBindingContextInfo(control);

    if (!target || !model) {
      return isError;
    }

    // this.removeMessageFromTarget(target);

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
          console.log("");
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
      }
    }

    return isError;
  }

  public wizardCompeleteHandler() {
    const ngayT1 = this.getControlById<DatePicker>("ngayThanhLap").getValue();
    this.getModel("accModel").setProperty("/Thanhlap", this.getSAPDateValue("ngayThanhLap"));
    this.onSumbit();
  }

  // #region Message Pop

  // private addMessageButton() {
  //   const toolbar = this.footerToolbar;

  //   if (!this.MessageButton) {
  //     this.MessageButton = new Button({
  //       id: "messageButton",
  //       visible: "{= ${message>/}.length > 0 }",
  //       icon: { path: "/", formatter: this.buttonIconFormatter },
  //       type: { path: "/", formatter: this.buttonTypeFormatter },
  //       text: { path: "/", formatter: this.highestSeverityMessages },
  //       press: this.handleMessagePopoverPress,
  //     });
  //   }

  //   console.log("Adding message button:", this.MessageButton);

  //   toolbar.insertAggregation("content", this.MessageButton, 0);

  //   this.createMessagePopover();
  //   this.attachMessageChange();

  //   if (!this.toolbarSpacer) {
  //     this.toolbarSpacer = new ToolbarSpacer();
  //     toolbar.insertAggregation("content", this.toolbarSpacer, 1);
  //   }
  // }

  // // Toggle Button Message Popover
  // public handleMessagePopoverPress = (event: Button$PressEvent) => {
  //   if (!this.MessagePopover) {
  //     this.createMessagePopover();
  //   }

  //   this.MessagePopover.toggle(event.getSource());
  // };

  // private createMessagePopover(): void {
  //   this.MessagePopover = new MessagePopover({
  //     activeTitlePress: (Event) => {
  //       const item = Event.getParameter("item");
  //       if (!item) return;

  //       const msg = <Message>item.getBindingContext("message")?.getObject();
  //       console.log(msg);
  //       if (!msg) return;

  //       const controlId = msg.getControlId();
  //       const control = ElementRegistry.get(controlId);

  //       if (control && control.isFocusable?.()) {
  //         control.focus();
  //       }
  //     },
  //     items: {
  //       path: "message>/",
  //       template: new MessageItem({
  //         title: "{message>message}",
  //         subtitle: "{message>additionalText}",
  //         groupName: {
  //           parts: [{ path: "message>controlIds" }],
  //           formatter: this.getGroupName,
  //         },
  //         activeTitle: {
  //           parts: [{ path: "message>controlIds" }],
  //           formatter: this.isPositionable,
  //         },
  //         type: "{message>type}",
  //         description: "{message>message}",
  //       }),
  //     },

  //     groupItems: true,
  //   });

  //   this.MessageButton?.addDependent(this.MessagePopover);
  // }

  // private isPositionable = (ControlId: string) => {
  //   // Such a hook can be used by the application to determine if a control can be found/reached on the page and navigated to.
  //   return ControlId ? true : true;
  // };

  // private getGroupName = () => {
  //   return "Create Leave Request";
  // };

  // private getMessages() {
  //   return <Message[]>this.MessageManager.getMessageModel().getData();
  // }

  // // Remove message from a control target path
  // private removeMessageFromTarget(target: string): void {
  //   const messages = this.getMessages();

  //   messages.forEach((message) => {
  //     if (message.getTargets().includes(target)) {
  //       this.MessageManager.removeMessages(message);
  //     }
  //   });
  // }

  // // // Display the button type according to the message with the highest severity | Error > Warning > Success > Info
  // private buttonTypeFormatter = () => {
  //   let HighestSeverity: ButtonType | undefined;

  //   // Retrieve All Current Message
  //   let Messages = <Message[]>this.MessageManager.getMessageModel().getData();

  //   Messages.forEach((Message: Message) => {
  //     switch (Message.getType()) {
  //       case "Error":
  //         HighestSeverity = ButtonType.Negative;
  //         break;
  //       case "Warning":
  //         HighestSeverity = HighestSeverity !== ButtonType.Negative ? ButtonType.Critical : HighestSeverity;
  //         break;
  //       case "Success":
  //         HighestSeverity =
  //           HighestSeverity !== ButtonType.Negative && HighestSeverity !== ButtonType.Critical
  //             ? ButtonType.Success
  //             : HighestSeverity;
  //         break;
  //       default:
  //         HighestSeverity = !HighestSeverity ? ButtonType.Neutral : HighestSeverity;
  //         break;
  //     }
  //   });

  //   return HighestSeverity;
  // };

  // // Display the number of messages with the highest severity
  // private highestSeverityMessages = () => {
  //   let HighestSeverityIconType = this.buttonTypeFormatter();

  //   let HighestSeverityMessageType: MessageType | undefined;

  //   switch (HighestSeverityIconType) {
  //     case ButtonType.Negative:
  //       HighestSeverityMessageType = MessageType.Error;
  //       break;

  //     case ButtonType.Critical:
  //       HighestSeverityMessageType = MessageType.Warning;
  //       break;

  //     case ButtonType.Success:
  //       HighestSeverityMessageType = MessageType.Success;
  //       break;

  //     default:
  //       HighestSeverityMessageType = HighestSeverityMessageType ?? MessageType.None;
  //       break;
  //   }

  //   // Retrieve All Current Message
  //   const messages = this.getMessages();

  //   // Get the Highest number of Error in an Error Type
  //   const count = messages.reduce((total: number, msg: Message) => {
  //     return msg.getType() === HighestSeverityMessageType ? total + 1 : total;
  //   }, 0);

  //   return count.toString() || "";
  // };

  // // Set the button icon according to the message with the highest severity
  // private buttonIconFormatter = () => {
  //   let sIcon: string = "";

  //   // Retrieve All Current Message
  //   let Messages: Message[] = <Message[]>this.MessageManager.getMessageModel().getData() || [];

  //   Messages.forEach((Message) => {
  //     switch (Message.getType()) {
  //       case "Error":
  //         sIcon = "sap-icon://error";
  //         break;
  //       case "Warning":
  //         sIcon = sIcon !== "sap-icon://error" ? "sap-icon://alert" : sIcon;
  //         break;
  //       case "Success":
  //         sIcon = sIcon !== "sap-icon://error" && sIcon !== "sap-icon://alert" ? "sap-icon://sys-enter-2" : sIcon;
  //         break;
  //       default:
  //         sIcon = !sIcon ? "sap-icon://sys-enter-2" : sIcon;
  //         break;
  //     }
  //   });

  //   return sIcon;
  // };

  // private displayErrorMessage() {
  //   if (this.MessageButton) {
  //     if (this.MessageButton.getDomRef()) {
  //       this.MessageButton.firePress();
  //     } else {
  //       this.MessageButton.addEventDelegate(this.onAfterRenderingMessageButton);
  //     }
  //   }
  // }

  // private onAfterRenderingMessageButton = {
  //   onAfterRendering: () => {
  //     if (this.MessageButton) {
  //       this.MessageButton.firePress();
  //       this.MessageButton.removeEventDelegate(this.onAfterRenderingMessageButton);
  //     }
  //   },
  // };

  // private attachMessageChange() {
  //   this.MessagePopover.getBinding("items")?.attachChange(() => {
  //     this.MessagePopover.navigateBack();

  //     if (this.MessageButton) {
  //       this.MessageButton.setType(this.buttonTypeFormatter());
  //       this.MessageButton.setIcon(this.buttonIconFormatter());
  //       this.MessageButton.setText(this.highestSeverityMessages());
  //     }
  //   });
  // }
}
