import XLSX from "xlsx";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

async function main() {
  console.log("📖 Reading Excel: ./hl3.xlsx");

  // đọc file Excel
  const workbook = XLSX.readFile("./hl4.xlsx");
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // convert sheet -> JSON
   const rows = XLSX.utils.sheet_to_json(sheet, {
      raw: false,  // giữ nguyên text
      defval: ""   // nếu ô rỗng thì gán chuỗi rỗng
    });

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const record = await pb.collection("ghostmg").create({
        hoten_die: row.hoten_die,
        ngay_mat: row.ngay_mat,             // giữ nguyên text
        ngay_nhap_linh: row.ngay_nhap_linh, // giữ nguyên text
        hoten_owner: row.hoten_owner,
        phone: row.phone,
        bang: row.bang,
        hang: row.hang,
        cot: row.cot,
        diachi: row.diachi,
      });
      console.log(`✅ Imported row ${i + 1}`, record);
    } catch (err) {
      console.error(`❌ Error row ${i + 1}`, err.data || err.message);
    }
  }
}

main();
