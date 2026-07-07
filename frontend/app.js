const API_URL = '/api/compuroom'; // ใช้ Relative Path เพื่อให้ทำงานร่วมกับ Nginx Reverse Proxy ได้ง่าย

document.addEventListener('DOMContentLoaded', () => {
  fetchData();
  document.getElementById('compu-form').addEventListener('submit', saveCompu);
  document.getElementById('cancel-btn').addEventListener('click', clearForm);
});

// 1. ดึงข้อมูลทั้งหมดมาโชว์ในตาราง
async function fetchData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const tbody = document.getElementById('data-table');
    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-400">ไม่มีข้อมูลคอมพิวเตอร์ในระบบ</td></tr>`;
      return;
    }

    data.forEach(item => {
      tbody.innerHTML += `
        <tr class="hover:bg-gray-50">
          <td class="p-3 font-semibold text-gray-700">${item.asset_code}</td>
          <td class="p-3">${item.brand_model}</td>
          <td class="p-3 text-xs text-gray-600">${item.cpu} / ${item.ram_gb} GB</td>
          <td class="p-3">${item.room}</td>
          <td class="p-3">
            <span class="px-2 py-0.5 rounded-full text-xs font-bold ${
              item.status === 'ใช้งาน' ? 'bg-green-100 text-green-700' : 
              item.status === 'ส่งซ่อม' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }">${item.status}</span>
          </td>
          <td class="p-3 text-center flex justify-center gap-2">
            <button onclick="editItem(${item.id})" class="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">แก้ไข</button>
            <button onclick="deleteItem(${item.id})" class="text-red-600 hover:text-red-800 font-medium cursor-pointer">ลบ</button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

// 2. บันทึกข้อมูล (ทั้งเพิ่มใหม่ และแก้ไขตัวเก่า)
async function saveCompu(e) {
  e.preventDefault();
  const id = document.getElementById('item-id').value;
  const payload = {
    asset_code: document.getElementById('asset_code').value,
    brand_model: document.getElementById('brand_model').value,
    cpu: document.getElementById('cpu').value,
    ram_gb: parseInt(document.getElementById('ram_gb').value),
    room: document.getElementById('room').value,
    status: document.getElementById('status').value
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/${id}` : API_URL;

  try {
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      clearForm();
      fetchData();
    }
  } catch (err) {
    console.error('Error saving data:', err);
  }
}

// 3. กดแก้ไข แล้วดึงข้อมูลเก่ามาใส่ฟอร์ม
async function editItem(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const item = await res.json();
    
    document.getElementById('item-id').value = item.id;
    document.getElementById('asset_code').value = item.asset_code;
    document.getElementById('brand_model').value = item.brand_model;
    document.getElementById('cpu').value = item.cpu;
    document.getElementById('ram_gb').value = item.ram_gb;
    document.getElementById('room').value = item.room;
    document.getElementById('status').value = item.status;

    document.getElementById('form-title').innerText = 'แก้ไขข้อมูลคอมพิวเตอร์';
    document.getElementById('cancel-btn').classList.remove('hidden');
  } catch (err) {
    console.error('Error getting item:', err);
  }
}

// 4. ลบข้อมูล
async function deleteItem(id) {
  if (confirm('คุณแน่ใจหรือไม่ที่จะลบเครื่องคอมพิวเตอร์นี้?')) {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  }
}

// 5. ล้างฟอร์มกลับเป็นปกติ
function clearForm() {
  document.getElementById('compu-form').reset();
  document.getElementById('item-id').value = '';
  document.getElementById('form-title').innerText = 'เพิ่มข้อมูลคอมพิวเตอร์';
  document.getElementById('cancel-btn').classList.add('hidden');
}