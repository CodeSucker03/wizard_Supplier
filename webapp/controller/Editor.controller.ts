import blobStream from "blob-stream";
import parse from "html-react-parser";
import PDFDocument from "pdfkit/js/pdfkit.standalone";
import URLListValidator from "sap/base/security/URLListValidator";
import type { Button$PressEvent } from "sap/m/Button";
import ComboBox from "sap/m/ComboBox";
import type DatePicker from "sap/m/DatePicker";
import HBox from "sap/m/HBox";
import Input from "sap/m/Input";
import type InputBase from "sap/m/InputBase";
import Label from "sap/m/Label";
import PDFViewer from "sap/m/PDFViewer";
import type Page from "sap/m/Page";
import type Event from "sap/ui/base/Event";
import type Control from "sap/ui/core/Control";
import Item from "sap/ui/core/Item";
import type Messaging from "sap/ui/core/Messaging";
import type Message from "sap/ui/core/message/Message";
import type Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import type { FileUploader$ChangeEvent } from "sap/ui/unified/FileUploader";
import satori, { type Font } from "satori";
import SVGtoPDF from "svg-to-pdfkit";
import { noop } from "../utils/shared";
import BaseController from "./Base.controller";
import type { Dict } from "fioricert/types/utils";
import Files from "fioricert/utils/Files";

export default class Editor extends BaseController {
  private pdfViewer: PDFViewer;
  private MessageManager: Messaging;
  private page: Page;
  private currentPdfUrl: string | null = null;

  public override onInit() {
    this.MessageManager = this.getMessageManager();
    this.page = this.getControlById<Page>("pageId");

    this.setModel(
      new JSONModel({
        fonts: [],
      }),
      "sections"
    );

    this.setModel(
      new JSONModel({
        recipientName: "",
        courseName: "",
        issueDate: "",
        issuerName: "",
        issuerTitle: "",
        htmlString: "",
        contentString: "",
        imageString: "",
        content: [
          {
            title: "Crelicate",
            X: "200",
            Y: "200",
            font: "Roboto",
            size: "30",
            color: "#ce3175",
          },
          {
            title: "abc",
            X: "200",
            Y: "200",
            font: "Roboto",
            size: "30",
            color: "#ce3175",
          },
          {
            title: "abca",
            X: "200",
            Y: "200",
            font: "Roboto",
            size: "30",
            color: "#ce3175",
          },
          {
            title: "abcs",
            X: "200",
            Y: "200",
            font: "Roboto",
            size: "30",
            color: "#ce3175",
          },
        ],
      }),
      "certificateModel"
    );

    this.setModel(
      new JSONModel({
        colors: [
          { key: "tomato", text: "Tomato" },
          { key: "blue", text: "Blue" },
          { key: "red", text: "Red" },
          { key: "gold", text: "Gold" },
        ],
        fonts: [],
      }),
      "masterData"
    );

    this.pdfViewer = new PDFViewer({
      isTrustedSource: true,
    });

    this.initFonts().catch(noop);
  }

  public handleInterpolate() {
    const model = this.getModel("certificateModel");

    const contentString = `<div style="width:600px;height:400px;background-image:url(data:image/png;base64,{{IMAGE_STRING}});background-size:600px 400px;background-repeat:no-repeat;position:relative;display:flex;">
    <div style="position:absolute;font-size:{{MCC_FONT_SIZE}};transform:translate({{MCC_X}}px,{{MCC_Y}}px );color:{{
      MCC_COLOR
    };text-transform:uppercase;">{{MCC_TITLE}}</div>
    <div style="position:absolute;font-size:{{NAME_SIZE}};transform:translate({{NAME_X}}px,{{NAME_Y}}px );color:{{
      NAME_COLOR
    };text-transform:uppercase;">{{NAME_TITLE}}</div>
    <div style="position:absolute;font-size:{{COURSE_SIZE}};transform:translate({{COURSE_X}}px,{{COURSE_Y}}px );color:{{
      COURSE_COLOR
    };text-transform:uppercase;">{{COURSE_TITLE}}</div>
    <div style="position:absolute;font-size:{{DATE_SIZE}};transform:translate({{DATE_X}}px,{{DATE_Y}}px );color:{{
      DATE_COLOR
  }};text-transform:uppercase;">{{DATE_TITLE}}</div>
  </div>`;

    model.setProperty("/contentString", contentString);
  }

  public handlePDFPreview() {
    const model = this.getModel("certificateModel");
    const htmlString = <string>model.getProperty("/htmlString");

    this.htmlToSVG(htmlString)
      .then((svgString) => {
        this.renderPDF(svgString);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  private handleLiveChangeInput = (event?: Event) => {
    // do something

    const model = this.getModel("certificateModel");

    const [first, two, three, four] = <Dict[]>model.getProperty("/content");

    const htmlString = `<div style="width:600px;height:400px;background-image:url(data:image/png;base64,${model.getProperty(
      "/imageString"
    )});background-size:600px 400px;background-repeat:no-repeat;position:relative;display:flex;">
    <div style="position:absolute;font-size:${first.size};transform:translate(${first.X}px,${first.Y}px );color:${
      first.color
    };text-transform:uppercase;">${first.title}</div>
    <div style="position:absolute;font-size:${two.size};transform:translate(${two.X}px,${two.Y}px );color:${
      two.color
    };text-transform:uppercase;">${two.title}</div>
    <div style="position:absolute;font-size:${three.size};transform:translate(${three.X}px,${three.Y}px );color:${
      three.color
    };text-transform:uppercase;">${three.title}</div>
    <div style="position:absolute;font-size:${four.size};transform:translate(${four.X}px,${four.Y}px );color:${
      four.color
    };text-transform:uppercase;">${four.title}</div>
  </div>`;

    model.setProperty("/htmlString", htmlString);
  };

  public inputFactory(id: string, context: Context) {
    console.log(Object.keys(context.getObject()));

    const items = Object.keys(context.getObject()).reduce<Control[]>((acc, fieldId) => {
      acc.push(
        new Label({
          text: fieldId,
        })
      );

      switch (fieldId) {
        case "title":
          acc.push(
            new Input({
              value: "{certificateModel>title}",
              change: this.handleLiveChangeInput,
            })
          );
          break;
        case "X":
          acc.push(
            new Input({
              value: "{certificateModel>X}",
              change: this.handleLiveChangeInput,
            })
          );
          break;
        case "Y":
          acc.push(
            new Input({
              value: "{certificateModel>Y}",
              change: this.handleLiveChangeInput,
            })
          );
          break;
        case "font":
          acc.push(
            new ComboBox({
              selectedKey: "{certificateModel>font}",
              selectionChange: this.handleLiveChangeInput,
              items: [],
            })
          );
          break;
        case "size":
          acc.push(
            new Input({
              value: "{certificateModel>size}",
              change: this.handleLiveChangeInput,
            })
          );
          break;
        case "color":
          acc.push(
            new ComboBox({
              selectedKey: "{certificateModel>color}",
              selectionChange: this.handleLiveChangeInput,
              items: {
                path: "masterData>/colors",
                templateShareable: false,
                template: new Item({
                  key: "{masterData>key}",
                  text: "{masterData>text}",
                }),
              },
            })
          );
          break;
        default:
      }
      return acc;
    }, []);

    return new HBox({
      items,
    });
  }

  private async initFonts() {
    try {
      const sectionsModel = this.getModel("sections");

      const [font, fontBold] = await Promise.all([
        fetch("/public/inter-latin-ext-400-normal.woff").then((response) => response.arrayBuffer()),
        fetch("/public/inter-latin-ext-700-normal.woff").then((response) => response.arrayBuffer()),
      ]);

      const fonts: Font[] = [
        {
          name: "Inter",
          data: font,
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: fontBold,
          weight: 700,
          style: "normal",
        },
      ];

      sectionsModel.setProperty("/fonts", fonts);
    } catch (error) {
      console.log(error);
    }
  }

  private async htmlToSVG(htmlString: string) {
    try {
      const sectionsModel = this.getModel("sections");
      const fonts = <Font[]>sectionsModel.getProperty("/fonts");

      const element = <object>parse(htmlString); //Chuyển đổi string => Element

      const svg = await satori(element, { width: 600, height: 400, fonts });

      return svg;
    } catch (error) {
      console.log(error);
      return "";
    }
  }

  private renderPDF(svgString: string) {
    const doc = new PDFDocument();
    const stream = doc.pipe(blobStream());

    SVGtoPDF(doc, svgString, 0, 0, { width: 600, height: 400, preserveAspectRatio: "xMidYMid meet" });

    doc.end();

    stream.on("finish", () => {
      // or get a blob URL for display in the browser
      const url = stream.toBlobURL("application/pdf");

      this.currentPdfUrl = url;

      URLListValidator.add(void 0, url); //Thêm đường dẫn hợp lệ vào danh sách hợp lệ

      Files.convertFileToBase64(stream.toBlob())
        .then((base64String) => {
          console.log(base64String);
        })
        .catch((error) => {
          console.log(error);
        });
      this.pdfViewer.setSource(url);
      this.pdfViewer.setTitle("My Custom Title");
      this.pdfViewer.open();
    });
  }

  private validateControls(controls: InputBase[]) {
    let isValid = false;
    let isError = false;

    controls.forEach((control) => {
      isError = this.validateControl(control);
      isValid = isValid || isError;
    });

    return !isValid;
  }

  private validateControl(source: InputBase): boolean {
    if (!source.getVisible()) {
      return false;
    }

    let isError = false;

    const { target, bindingType, processor } = this.getBindingTarget(source);

    if (!target) {
      return false;
    }

    const isRequired = source.getRequired();
    const label = source.getTooltip_Text() || "";

    // Tạo 1 đối tượng trong đó các key sẽ là các columnId và giá trị sẽ là label tương ứng của column đó

    this.removeMessage(target);
    source.setValueState("None");
    source.setValueStateText("");

    let requiredError = false;
    let outOfRangeError = false;
    let value: string = "";

    if (source.isA<Input>("sap.m.Input")) {
      value = source.getValue();
      if (!value && isRequired) {
        requiredError = true;
      }
    } else if (source.isA<ComboBox>("sap.m.ComboBox")) {
      value = source.getSelectedKey();
      const input = source.getValue();
      // In case input provided an out-of-range value
      if (!value && input) {
        outOfRangeError = true;
      } else if ((!value || !input) && isRequired) {
        requiredError = true;
      }
    } else if (source.isA<DatePicker>("sap.m.DatePicker")) {
      value = source.getValue();
      if (!value && isRequired) {
        requiredError = true;
      } else if (value && !source.isValidValue()) {
        outOfRangeError = true;
      }
    }

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
    } else if (bindingType) {
      // In case using advanced validation with constraints, custom type, etc...
      try {
        void bindingType.validateValue(value);
      } catch (error) {
        const { message } = <Error>error;

        this.addMessages({
          message,
          type: "Warning",
          additionalText: label,
          target,
          processor,
        });

        isError = true;
      }
    }

    return isError;
  }

  private getMessages() {
    return <Message[]>this.MessageManager.getMessageModel().getData();
  }

  private removeMessage(target: string) {
    const messages = this.getMessages();

    messages.forEach((message) => {
      if (message.getTargets().includes(target)) {
        this.MessageManager.removeMessages(message);
      }
    });
  }

  private clearErrors() {
    this.MessageManager.removeAllMessages();
  }

  public onEditRow(event: Button$PressEvent) {
    const control = event.getSource();
    const page = <Page>control.getParent();

    const model = this.getModel("certificateModel");

    const inputs = this.getControlsByFieldGroup<InputBase>({
      container: this.page,
      groupId: "FormField",
      visibility: "visible",
    });

    const isValid = this.validateControls(inputs);

    if (!isValid) {
      return;
    }

    this.clearErrors();

    const value = this.getModel("certificateModel").getData();
    console.log(value);
  }

  public handleUploadChange(event: FileUploader$ChangeEvent) {
    const [file] = <File[]>event.getParameter("files");

    // Lấy dữ liệu từ mô hình
    const certificateModel = this.getModel("certificateModel");

    Files.convertFileToBase64(file)
      .then((content) => {
        certificateModel.setProperty("/imageString", content);
        this.handleLiveChangeInput();
      })
      .then((svgString) => {
        // this.renderPDF(svgString);
      })
      .catch((error: unknown) => {
        console.log(error);
      });
  }
}
