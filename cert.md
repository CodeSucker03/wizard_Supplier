# Cert

- 1️ Nhận file đầu vào:

Người dùng chọn hoặc tải lên một file (hình ảnh, chứng chỉ, tài liệu,...).

- 2️ Chuyển file sang Base64:

Sử dụng FileReader.readAsDataURL() để mã hóa file thành chuỗi Base64.

- 3️ Tạo nội dung HTML từ Base64:

Chèn chuỗi Base64 vào một template HTML để hiển thị nội dung file.

- 4️ Chuyển HTML thành SVG:

Dùng thư viện hoặc công cụ thích hợp để render HTML thành định dạng SVG.

- 5️ Render SVG thành PDF:

Lấy svgString, chuyển thành PDF bằng thư viện
