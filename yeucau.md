# Tài liệu dự án: Website tra cứu thông tin Hương Linh

## 1. Mục tiêu
Xây dựng website cho phép Phật tử và thân nhân **tra cứu thông tin hương linh** được lưu trữ trong PocketBase.  
Yêu cầu:
- Tìm kiếm nhanh (theo số điện thoại, tên người gửi, tên hương linh).
- Hiển thị thông tin đầy đủ và rõ ràng.
- Thân thiện với thiết bị di động.
- Phong cách nhẹ nhàng, trang nghiêm, hướng chùa.
- Có phần liên hệ để người dùng biết cách kết nối với Ban Hộ Tự/Chùa.

---

## 2. Cấu trúc dữ liệu (PocketBase Collection: `huonglinh`)
| Trường        | Kiểu dữ liệu | Ghi chú                              |
|---------------|-------------|--------------------------------------|
| `id`          | text        | ID tự sinh                           |
| `hoten_die`   | text        | Họ tên hương linh                    |
| `hoten_owner` | text        | Họ tên người gửi                     |
| `sdt`         | text        | Số điện thoại người gửi              |
| `note`        | text        | Ghi chú (pháp danh, năm giỗ...)      |
| `ngay_nhap_linh` | date     | Ngày nhập linh (dương lịch)          |
| `ngay_mat`    | text        | Ngày mất                             |
| `bang`        | text        | Vị trí bảng                          |
| `hang`        | text        | Vị trí hàng                          |
| `cot`         | text        | Vị trí cột                           |
| `created`     | date        | Tự động tạo                          |
| `updated`     | date        | Tự động cập nhật                     |

**Lưu ý**:  
- Vị trí bài vị hiển thị dạng: `Bảng {bang}, Hàng {hang}, Cột {cot}`.  
- Tìm kiếm dùng các field: `sdt`, `hoten_owner`, `hoten_die`.

---

## 3. Chức năng chính
### 3.1 Tra cứu
- Ô tìm kiếm (search box).  
- Dùng **Fuse.js** để tìm theo:
  - Số điện thoại (`sdt`).
  - Tên người gửi (`hoten_owner`).
  - Tên hương linh (`hoten_die`).  
- Tìm kiếm gần đúng, không cần chính xác tuyệt đối (fuzzy search).

### 3.2 Hiển thị kết quả
- Thông tin hương linh gồm:
  - Họ tên hương linh.
  - Họ tên người gửi + số điện thoại.
  - Ngày mất, ngày nhập linh.
  - Vị trí bài vị: *Bảng A, Hàng B, Cột C*.
  - Ghi chú thêm.  
- Hiển thị theo dạng card/list, dễ đọc trên mobile.

### 3.3 Thông tin liên hệ
- Một trang hoặc phần footer hiển thị:
  - Địa chỉ chùa.
  - Số điện thoại liên hệ.
  - Email (nếu có).
  - Thời gian tiếp nhận.

---

## 4. Công nghệ sử dụng
- **Frontend**: VUEJS 3 CDN  (ưu tiên mobile first).  
- **Thư viện tìm kiếm**: .  
- **Backend**: PocketBase (SQLite).  
- **Triển khai**: có thể chạy trên hosting hoặc server nội bộ của chùa.

---

## 5. Giao diện
- **Mobile first**: thiết kế ưu tiên màn hình nhỏ.  
- **Phong cách**: nhẹ nhàng, tông màu chùa (nâu, vàng nhạt, trắng).  
- **Thanh điều hướng**: 
  - Trang chủ / Tra cứu.
  - Liên hệ.  
- **Kết quả tìm kiếm**: card đơn giản, bo góc, nền sáng.  
- **Footer**: thông tin liên hệ + copyright.

---

## 6. Quy trình hoạt động
1. Người dùng truy cập website trên điện thoại.  
2. Nhập từ khóa vào ô tìm kiếm (họ tên, số điện thoại, tên người gửi).  
3. Fuse.js thực hiện tìm kiếm gần đúng từ dữ liệu lấy qua API của PocketBase.  
4. Hiển thị danh sách kết quả.  
5. Người dùng bấm vào từng mục để xem chi tiết.  
6. Nếu cần liên hệ → vào trang Liên hệ.



## 7. Mở rộng (tùy chọn)
- Bộ lọc theo năm nhập linh / tháng-năm nhập linh.  


##8. tài liệu kết nối:
Browser (manually via script tag)
<script src="/path/to/dist/pocketbase.umd.js"></script>
<script type="text/javascript">
    const pb = new PocketBase("https://example.com")
    ...
</script>


List/Search (ghostmg)
Fetch a paginated ghostmg records list, supporting sorting and filtering.

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://103.163.118.103:401');

...

// fetch a paginated records list
const resultList = await pb.collection('ghostmg').getList(1, 50, {
    filter: 'someField1 != someField2',
});

// you can also fetch all records at once via getFullList
const records = await pb.collection('ghostmg').getFullList({
    sort: '-someField',
});

// or fetch only the first record that matches the specified filter
const record = await pb.collection('ghostmg').getFirstListItem('someField="test"', {
    expand: 'relField1,relField2.subRelField',
});
JavaScript SDK
API details
GET
/api/collections/ghostmg/records

Query parameters
page	Number	The page (aka. offset) of the paginated list (default to 1).
perPage	Number	Specify the max returned records per page (default to 30).
sort	String	Specify the records order attribute(s).
Add - / + (default) in front of the attribute for DESC / ASC order. Ex.:
// DESC by created and ASC by id
?sort=-created,id
Supported record sort fields:
@random, @rowid, id, hoten_die, hoten_owner, note, ngay_nhap_linh, ngay_mat, bang, hang, cot, created, updated

filter	String	Filter the returned records. Ex.:
?filter=(id='abc' && created>'2022-01-01')
expand	String	Auto expand record relations. Ex.:
?expand=relField1,relField2.subRelField
Supports up to 6-levels depth nested relations expansion.
The expanded relations will be appended to each individual record under the expand property (eg. "expand": {"relField1": {...}, ...}).
Only the relations to which the request user has permissions to view will be expanded.
fields	String	
Comma separated string of the fields to return in the JSON response (by default returns all fields). Ex.:
?fields=*,expand.relField.name

* targets all keys from the specific depth level.

In addition, the following field modifiers are also supported:

:excerpt(maxLength, withEllipsis?)
Returns a short plain text version of the field string value.
Ex.: ?fields=*,description:excerpt(200,true)
skipTotal	Boolean	If it is set the total counts query will be skipped and the response fields totalItems and totalPages will have -1 value.
This could drastically speed up the search queries when the total counters are not needed or cursor based pagination is used.
For optimization purposes, it is set by default for the getFirstListItem() and getFullList() SDKs methods.
Responses
{
  "page": 1,
  "perPage": 30,
  "totalPages": 1,
  "totalItems": 2,
  "items": [
    {
      "collectionId": "pbc_2484900283",
      "collectionName": "ghostmg",
      "id": "test",
      "hoten_die": "test",
      "hoten_owner": "test",
      "note": "test",
      "ngay_nhap_linh": "2022-01-01 10:00:00.123Z",
      "ngay_mat": "test",
      "bang": "test",
      "hang": "test",
      "cot": "test",
      "created": "2022-01-01 10:00:00.123Z",
      "updated": "2022-01-01 10:00:00.123Z"
    },
    {
      "collectionId": "pbc_2484900283",
      "collectionName": "ghostmg",
      "id": "test2",
      "hoten_die": "test",
      "hoten_owner": "test",
      "note": "test",
      "ngay_nhap_linh": "2022-01-01 10:00:00.123Z",
      "ngay_mat": "test",
      "bang": "test",
      "hang": "test",
      "cot": "test",
      "created": "2022-01-01 10:00:00.123Z",
      "updated": "2022-01-01 10:00:00.123Z"
    }
  ]
}