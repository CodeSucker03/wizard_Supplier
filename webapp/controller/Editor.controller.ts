import blobStream from "blob-stream";
import Files from "fioricert/utils/Files";
import { noop } from "fioricert/utils/shared";
import parse from "html-react-parser";
import PDFDocument from "pdfkit/js/pdfkit.standalone";
import URLListValidator from "sap/base/security/URLListValidator";
import PDFViewer from "sap/m/PDFViewer";
import JSONModel from "sap/ui/model/json/JSONModel";
import type { FileUploader$ChangeEvent } from "sap/ui/unified/FileUploader";
import satori, { type Font } from "satori";
import SVGtoPDF from "svg-to-pdfkit";
import Base from "./Base.controller";

/**
 * @namespace fioricert.controller
 */
export default class Editor extends Base {
  private pdfViewer: PDFViewer;

  public override onInit(): void {
    this.setModel(
      new JSONModel({
        fonts: [],
      }),
      "sections"
    );

    this.pdfViewer = new PDFViewer({
      isTrustedSource: true,
    });

    this.initFonts().catch(noop);
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

      const element = <object>parse(htmlString);

      const content = await satori(element, {
        width: 600,
        height: 400,
        fonts,
      });

      return content;
    } catch (error) {
      console.log(error);
      return "";
    }
  }

  private renderPDF(svgString: string) {
    try {
      const doc = new PDFDocument({
        compress: false,
        size: [600, 400],
      });

      SVGtoPDF(doc, svgString, 0, 0, {
        width: 600,
        height: 400,
        preserveAspectRatio: "xMidYMid meet",
      });

      const stream = doc.pipe(blobStream());

      doc.end();

      stream.on("finish", () => {
        const url = stream.toBlobURL("application/pdf");

        URLListValidator.add(void 0, url);

        this.pdfViewer.setSource(url);
        this.pdfViewer.setTitle("Certificate");
        this.pdfViewer.open();
      });
    } catch (error) {
      console.log(error);
    }
  }

  public handleUploadChange(event: FileUploader$ChangeEvent) {
    const [file] = <File[]>event.getParameter("files");

    Files.convertFileToBase64(file)
      .then((content) => {
        // Store this string into SAP.
        const htmlString = `<div style="width:600px;height:400px;background-image:url(data:image/png;base64,${content});background-size:600px 400px;background-repeat:no-repeat;position:relative;display:flex;"><div style="position:absolute;top:100px;left:80%;color:#000">Hello World</div></div>`;

        return this.htmlToSVG(htmlString);
      })
      .then((svgString) => {
        this.renderPDF(svgString);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
