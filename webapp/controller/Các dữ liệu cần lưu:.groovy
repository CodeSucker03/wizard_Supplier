Các dữ liệu cần lưu:

Các trường input trong 
content:{title: string,
  X: string,
  Y: string,
  font: string,
  size: string,
  color: string,
},

htmlString: string,
imageString:string,
templateString:string

// Đã hiện ảnh nhưng chạy ẩn, lý do vì sao 
// Khi reload lại thì imageString đó lại lại rỗng

// API cần lưu những thông tin sau
// content: lưu các giá trị của các ô input
// imageString: chuỗi base64 của ảnh khi người dùng upload lên
// htmlString: chuỗi nội suy trong đó các giá trị được giữ chỗ bằng nội suy có dạng ,
// {{IMAGE_STRING}}, chuỗi này được lưu dưới backend để xuất ra nhiều chứng chỉ khác nhau

// Tạo nút Save, bấm vào 