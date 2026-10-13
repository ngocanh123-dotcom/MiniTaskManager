
"use strict";

// =====================================
// 1. KHOI TAO CAC PHAN TU HTML
// =====================================

const taskList = document.getElementById("task-list");
const taskForm = document.getElementById("task-form");
const taskNameInput = document.getElementById("task-name");
const taskDateInput = document.getElementById("task-date");
const taskPriorityInput = document.getElementById("task-priority");
const errorMsg = document.getElementById("error-msg");

const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const sortFilter = document.getElementById("sort-filter");

const taskCount = document.getElementById("task-count");
const totalCount = document.getElementById("total-count");
const pendingCount = document.getElementById("pending-count");
const completedCount = document.getElementById("completed-count");
const emptyMsg = document.getElementById("empty-msg");

const STORAGE_KEY = "miniTaskManagerTasks";

// =====================================
// 2. TAO 5 CONG VIEC MAU
// =====================================

function taoNgay(offset) {
    const date = new Date();
    date.setDate(date.getDate() + offset);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function taoDuLieuMau() {
    return [
        {
            id: 1,
            name: "Hoàn thiện bài tập Web",
            date: taoNgay(2),
            priority: "Cao",
            completed: false
        },
        {
            id: 2,
            name: "Ôn tập Toán Ứng Dụng",
            date: taoNgay(3),
            priority: "Cao",
            completed: false
        },
        {
            id: 3,
            name: "Mua tài liệu học",
            date: taoNgay(1),
            priority: "Trung bình",
            completed: true
        },
        {
            id: 4,
            name: "Dọn dẹp phòng",
            date: taoNgay(0),
            priority: "Thấp",
            completed: false
        },
        {
            id: 5,
            name: "Dạy kèm học sinh",
            date: taoNgay(4),
            priority: "Cao",
            completed: false
        }
    ];
}

// =====================================
// 3. DOC DU LIEU DA LUU
// =====================================

function taiDuLieu() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        // Chi tao 5 cong viec mau trong lan mo dau tien.
        if (savedData === null) {
            const sampleTasks = taoDuLieuMau();
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(sampleTasks)
            );
            return sampleTasks;
        }

        const parsedData = JSON.parse(savedData);

        if (!Array.isArray(parsedData)) {
            throw new Error("Dữ liệu công việc không hợp lệ.");
        }

        return parsedData.filter(task =>
            task &&
            (typeof task.id === "number" ||
                typeof task.id === "string") &&
            typeof task.name === "string" &&
            typeof task.date === "string" &&
            ["Cao", "Trung bình", "Thấp"].includes(task.priority) &&
            typeof task.completed === "boolean"
        );
    } catch (error) {
        console.error("Lỗi đọc dữ liệu:", error);
        alert("Không thể đọc dữ liệu đã lưu. Vui lòng kiểm tra trình duyệt.");
        return [];
    }
}

let tasks = taiDuLieu();

// =====================================
// 4. LUU DU LIEU VAO LOCALSTORAGE
// =====================================

function luuDuLieu() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        return true;
    } catch (error) {
        console.error("Lỗi lưu dữ liệu:", error);
        alert(
            "Không thể lưu dữ liệu. Vui lòng kiểm tra bộ nhớ trình duyệt."
        );
        return false;
    }
}

// =====================================
// 5. DINH DANG NGAY
// =====================================

function dinhDangNgay(dateString) {
    if (!dateString) {
        return "Chưa đặt hạn";
    }

    const parts = dateString.split("-");

    if (parts.length !== 3) {
        return "Chưa xác định";
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// =====================================
// 6. TAO THE CONG VIEC
// =====================================

function taoThe(tag, className, noiDung) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (noiDung !== undefined) {
        element.textContent = noiDung;
    }

    return element;
}

function taoCongViec(task) {
    const li = taoThe(
        "li",
        task.completed ? "completed" : ""
    );

    // Thong tin cong viec
    const info = taoThe("div", "task-info");
    const name = taoThe("strong", "task-name", task.name);
    const meta = taoThe("div", "task-meta");

    const deadline = taoThe(
        "span",
        "",
        "Hạn: " + dinhDangNgay(task.date)
    );

    let priorityClass = "priority-medium";

    if (task.priority === "Cao") {
        priorityClass = "priority-high";
    } else if (task.priority === "Thấp") {
        priorityClass = "priority-low";
    }

    const priority = taoThe(
        "span",
        "priority " + priorityClass,
        "Ưu tiên: " + task.priority
    );

    const status = taoThe(
        "span",
        "status-text",
        task.completed ? "Đã hoàn thành" : "Chưa hoàn thành"
    );

    meta.append(deadline, priority, status);
    info.append(name, meta);

    // Cac nut thao tac
    const actions = taoThe("div", "task-actions");

    const completeButton = taoThe(
        "button",
        "btn-complete",
        task.completed ? "Hoàn tác" : "Đánh dấu hoàn thành"
    );

    completeButton.type = "button";
    completeButton.addEventListener("click", function () {
        doiTrangThai(task.id);
    });

    const deleteButton = taoThe(
        "button",
        "btn-delete",
        "Xóa"
    );

    deleteButton.type = "button";
    deleteButton.addEventListener("click", function () {
        xoaCongViec(task.id);
    });

    actions.append(completeButton, deleteButton);
    li.append(info, actions);

    return li;
}

// =====================================
// 7. TIM KIEM VA LOC CONG VIEC
// =====================================

function layDanhSachHienThi() {
    const keyword = searchInput.value
        .trim()
        .toLocaleLowerCase("vi");

    const selectedStatus = statusFilter.value;
    const sortOrder = sortFilter.value;

    const result = tasks.filter(function (task) {
        const matchName = task.name
            .toLocaleLowerCase("vi")
            .includes(keyword);

        const matchStatus =
            selectedStatus === "all" ||
            (selectedStatus === "pending" && !task.completed) ||
            (selectedStatus === "completed" && task.completed);

        return matchName && matchStatus;
    });

    // Sap xep theo han hoan thanh
    result.sort(function (a, b) {
        // Cong viec chua co han duoc dua xuong cuoi.
        if (!a.date && b.date) return 1;
        if (a.date && !b.date) return -1;

        const comparison = a.date.localeCompare(b.date);

        if (comparison === 0) {
            return a.name.localeCompare(b.name, "vi");
        }

        return sortOrder === "desc" ? -comparison : comparison;
    });

    return result;
}

// =====================================
// 8. CAP NHAT THONG KE
// =====================================

function capNhatThongKe() {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    totalCount.textContent = total;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
}

// =====================================
// 9. HIEN THI DANH SACH
// =====================================

function renderTasks() {
    const visibleTasks = layDanhSachHienThi();

    // Xoa danh sach cu va tao lai danh sach moi.
    taskList.replaceChildren();

    visibleTasks.forEach(function (task) {
        taskList.appendChild(taoCongViec(task));
    });

    // Cap nhat so cong viec dang hien thi.
    taskCount.textContent =
        visibleTasks.length + " công việc";

    // Cap nhat tong so va trang thai.
    capNhatThongKe();

    // Hien thong bao neu khong co ket qua.
    emptyMsg.hidden = visibleTasks.length !== 0;
}

// =====================================
// 10. KIEM TRA DU LIEU NGAY
// =====================================

function ngayHopLe(dateString) {
    if (!dateString) {
        return true;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return false;
    }

    const parts = dateString.split("-").map(Number);

    const date = new Date(
        parts[0],
        parts[1] - 1,
        parts[2]
    );

    return date.getFullYear() === parts[0] &&
        date.getMonth() === parts[1] - 1 &&
        date.getDate() === parts[2];
}

// =====================================
// 11. THEM CONG VIEC
// =====================================

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = taskNameInput.value.trim();
    const date = taskDateInput.value;
    const priority = taskPriorityInput.value;

    errorMsg.textContent = "";

    // Kiem tra ten cong viec.
    if (name === "") {
        errorMsg.textContent = "Vui lòng nhập tên công việc!";
        taskNameInput.focus();
        return;
    }

    if (name.length > 150) {
        errorMsg.textContent =
            "Tên công việc không được vượt quá 150 ký tự.";
        taskNameInput.focus();
        return;
    }

    // Kiem tra ngay neu nguoi dung co nhap.
    if (!ngayHopLe(date)) {
        errorMsg.textContent = "Ngày hoàn thành không hợp lệ.";
        taskDateInput.focus();
        return;
    }

    if (!["Cao", "Trung bình", "Thấp"].includes(priority)) {
        errorMsg.textContent = "Mức độ ưu tiên không hợp lệ.";
        return;
    }

    const newTask = {
        id: Date.now(),
        name: name,
        date: date,
        priority: priority,
        completed: false
    };

    tasks.push(newTask);

    if (!luuDuLieu()) {
        tasks.pop();
        return;
    }

    // Xoa form sau khi them thanh cong.
    taskForm.reset();
    errorMsg.textContent = "";

    // Dua bo loc ve mac dinh de thay cong viec moi.
    searchInput.value = "";
    statusFilter.value = "all";
    sortFilter.value = "asc";

    renderTasks();
    taskNameInput.focus();
});

// =====================================
// 12. DANH DAU HOAN THANH / HOAN TAC
// =====================================

function doiTrangThai(id) {
    const task = tasks.find(
        item => String(item.id) === String(id)
    );

    if (!task) {
        return;
    }

    const oldValue = task.completed;
    task.completed = !task.completed;

    if (!luuDuLieu()) {
        task.completed = oldValue;
        return;
    }

    renderTasks();
}

// =====================================
// 13. XOA CONG VIEC
// =====================================

function xoaCongViec(id) {
    const index = tasks.findIndex(
        item => String(item.id) === String(id)
    );

    if (index === -1) {
        return;
    }

    const task = tasks[index];

    const confirmed = confirm(
        'Bạn có chắc chắn muốn xóa công việc "' +
        task.name + '" không?'
    );

    if (!confirmed) {
        return;
    }

    tasks.splice(index, 1);

    if (!luuDuLieu()) {
        tasks.splice(index, 0, task);
        return;
    }

    renderTasks();
}

// =====================================
// 14. SU KIEN TIM KIEM, LOC, SAP XEP
// =====================================

searchInput.addEventListener("input", renderTasks);

statusFilter.addEventListener("change", renderTasks);

sortFilter.addEventListener("change", renderTasks);

// =====================================
// 15. KHOI DONG UNG DUNG
// =====================================

renderTasks();
