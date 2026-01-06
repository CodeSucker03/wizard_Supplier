export const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));

export const noop = () => {};

export const formatSAPDate = (date:Date) : string =>{
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2,"0");
    const day = date.getDate().toString().padStart(2,"0");
    return `${year}-${month}-${day}`;
};
