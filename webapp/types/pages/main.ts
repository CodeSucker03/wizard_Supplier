export interface EmployeeItem {
  Employeeid: string;
  File: string;
  Fullname: string;
  Gender: string;
  StartDate: string;
  Contracttype: string;
  Birthdate: string;
  Address: string;
  Phone: string;
  Plans: string;
  Salary: number;
}

export type MessageBoxType = "confirm" | "alert" | "error" | "information" | "success" | "warning";

export interface ToNCCMaterial {
  Username: string;
  MatklLv1: string;
  MatklLv2: string;
  Matkl: string;
  MatklLv1Txt: string;
  MatklLv2Txt: string;
  MatklTxt: string;
}

export interface AccModelData {
  Username: string;
  Otp: string;
  Website: string;
  Agree: boolean;
  CompanyName: string;
  Status: string;
  Taxnumber: string;
  CompanyAddress: string;
  NddNationality: string;

  NddTitle: string;
  NddHoten: string;
  NddChucvu: string;
  NddIdnumber: string;

  DmTitle: string;
  DmHoten: string;
  DmChucvu: string;
  DmSdt: string;
  DmEmail: string;

  Gioithieu: string;
  Quymo: string;

  ToNCCMaterial: ToNCCMaterial[];

  Phamvi1: string;
  Phamvi2: string;
  Phamvi3: string;
  Phamvi4: string;

  DtYear1: string;
  DtYear2: string;
  DtYear3: string;

  DtAmount1: string;
  DtAmount2: string;
  DtAmount3: string;

  LnYear1: string;
  LnYear2: string;
  LnYear3: string;

  LnAmount1: string;
  LnAmount2: string;
  LnAmount3: string;

  CharterCapital: string;
  Waers: string;
}

export interface MatklGroup {
  Matkl: string;
  MatklLv1: string;
  MatklLv2: string;
  MatklTxt: string;
}

export interface MatklLv2 {
  MatklLv1: string;
  MatklLv2: string;
  MatklLv2Txt: string;
  ToMaterialGroup: {
    results: MatklGroup[];
  };
}

export interface MatklLv1 {
  MatklLv1: string;
  MatklLv1Txt: string;
  ToMaterialLv2: {
    results: MatklLv2[];
  };
}

export interface MaterialUnit {
  MatklLv1: string;
  MatklLv2: string;
  Matkl: string;
  MatklTxt: string;
  MatklLv1Txt: string;
  MatklLv2Txt: string;
}
