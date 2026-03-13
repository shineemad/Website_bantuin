# 📝 DOKUMENTASI FITUR POSTING PEKERJAAN

## Overview

Fitur ini memungkinkan **Client** untuk membuat dan posting pekerjaan/tugas yang akan otomatis tampil di halaman **Cari Pekerjaan** untuk dilihat oleh talent.

---

## 🎯 Alur Kerja Sistem

### 1. Client Membuat Tugas di Profile

```
Client Login → Profile Page → Section "Posting Pekerjaan" →
Klik "Tambah Tugas Baru" → Fill Form → Submit →
Task tersimpan di localStorage
```

### 2. Task Tampil di Cari Pekerjaan

```
Any User → Buka cari-pekerjaan.html →
Page otomatis load tasks dari localStorage →
Render tasks sebagai job cards →
Task dari client tampil paling atas (newest first)
```

---

## 📊 Struktur Data Task

### Task Object Schema

```javascript
{
  id: 1733123456789,                    // Timestamp unique ID
  title: "Desain Landing Page E-commerce",
  description: "Butuh desain landing page modern...",
  desc: "Butuh desain landing page modern...",  // Alias untuk compatibility

  // Job Details
  budget: "Rp 500.000",
  type: "Fixed-price",                   // Fixed-price | Hourly | Monthly
  level: "Intermediate",                 // Entry | Intermediate | Expert
  category: "kreatif",                   // tekno | kreatif | writing | admin | fisik
  location: "Jakarta, ID",

  // Metadata
  tags: ["kreatif", "Intermediate", "Fixed-price"],
  deadline: "2025-12-31",
  fileName: "requirements.pdf",          // Optional attachment
  fileSize: 102400,                      // File size in bytes

  // Timestamps
  uploadDate: "2025-12-01T10:30:00.000Z",
  createdAt: "2025-12-01T10:30:00.000Z",

  // Status
  status: "open",                        // open | in-progress | completed | closed

  // Client Info
  owner: "John Doe",
  ownerEmail: "john@example.com",
  clientVerified: false,
  clientRating: 0,
  clientSpent: "Rp 0"
}
```

---

## 💾 Storage Strategy

### 1. Global Storage (Semua Tasks)

**Key:** `bantuin_tasks`

```javascript
// Format: Array of task objects
localStorage.setItem('bantuin_tasks', JSON.stringify([
  { id: 1, title: "Task 1", ... },
  { id: 2, title: "Task 2", ... }
]));
```

### 2. User-Specific Storage (Per Client)

**Key:** `bantuin_user_tasks_{email}`

```javascript
// Format: Array of tasks created by specific user
localStorage.setItem('bantuin_user_tasks_john@example.com', JSON.stringify([
  { id: 1, title: "My Task 1", ... }
]));
```

### Benefits Multi-Storage:

✅ **Global Storage:** Untuk display di halaman Cari Pekerjaan (semua tasks)
✅ **User Storage:** Untuk tracking tasks per user di profile page
✅ **Data Redundancy:** Backup jika global storage terhapus
✅ **Easy Filtering:** Filter tasks by user email

---

## 🔧 Implementasi Kode

### A. Form Input di profile.html

#### HTML Structure

```html
<form id="taskForm" class="hidden">
  <!-- Title -->
  <input id="taskTitle" type="text" placeholder="Judul Tugas" required />

  <!-- Description -->
  <textarea
    id="taskDescription"
    rows="3"
    placeholder="Deskripsi"
    required
  ></textarea>

  <!-- Budget -->
  <input id="taskBudget" type="text" placeholder="Rp 500.000" />

  <!-- Type -->
  <select id="taskType">
    <option value="Fixed-price">Fixed-price (Harga tetap)</option>
    <option value="Hourly">Hourly (Per jam)</option>
    <option value="Monthly">Monthly (Bulanan)</option>
  </select>

  <!-- Level -->
  <select id="taskLevel">
    <option value="Entry">Entry (Pemula)</option>
    <option value="Intermediate">Intermediate (Menengah)</option>
    <option value="Expert">Expert (Ahli)</option>
  </select>

  <!-- Category -->
  <select id="taskCategory">
    <option value="tekno">Teknologi & IT</option>
    <option value="kreatif">Kreatif & Desain</option>
    <option value="writing">Writing & Translation</option>
    <option value="admin">Admin & Support</option>
    <option value="fisik">Pekerjaan Fisik</option>
  </select>

  <!-- Location -->
  <input id="taskLocation" type="text" placeholder="Jakarta, ID" />

  <!-- Deadline -->
  <input id="taskDeadline" type="date" />

  <!-- File Upload (Optional) -->
  <input id="taskFile" type="file" accept=".pdf,.doc,.docx,.zip" />

  <button type="submit">Posting Tugas</button>
</form>
```

#### Validation Rules

1. **Title** - Required, min 5 characters
2. **Description** - Required, min 20 characters
3. **Budget** - Optional, format: "Rp X" atau "Rp X/jam"
4. **Type** - Default: "Fixed-price"
5. **Level** - Default: "Intermediate"
6. **Category** - Default: "tekno"
7. **Location** - Default: "Indonesia"
8. **Deadline** - Optional
9. **File** - Optional, max 10MB

---

### B. Submit Handler di profile.js

```javascript
taskForm.addEventListener("submit", function (e) {
  e.preventDefault();
  console.log("Task form submitted!");

  // 1. Get form values
  var title = get("taskTitle").value.trim();
  var desc = get("taskDescription").value.trim();
  var budget = get("taskBudget").value.trim();
  var type = get("taskType").value;
  var level = get("taskLevel").value;
  var category = get("taskCategory").value;
  var location = get("taskLocation").value.trim();
  var deadline = get("taskDeadline").value;
  var file = taskFileInput.files[0];

  // 2. Validation
  if (!title) {
    showToast("Judul tugas wajib diisi", "error");
    return;
  }

  if (!desc) {
    showToast("Deskripsi tugas wajib diisi", "error");
    return;
  }

  // 3. Get client info from profile
  var currentProfile = loadProfile();
  var clientName = currentProfile.name || "Anonymous Client";
  var clientEmail = currentProfile.email || "client@example.com";

  // 4. Generate tags
  var tags = [category, level, type];
  if (budget) tags.push(budget);

  // 5. Create task object
  var taskObj = {
    id: Date.now(),
    title: title,
    description: desc,
    desc: desc,
    deadline: deadline,
    budget: budget || "Negosiasi",
    type: type,
    level: level,
    category: category,
    location: location || "Indonesia",
    tags: tags,
    fileName: file ? file.name : null,
    fileSize: file ? file.size : null,
    uploadDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    status: "open",
    owner: clientName,
    ownerEmail: clientEmail,
    clientVerified: false,
    clientRating: 0,
    clientSpent: "Rp 0",
  };

  console.log("Task object created:", taskObj);

  // 6. Save to localStorage
  try {
    // Global storage
    var tasks = JSON.parse(localStorage.getItem("bantuin_tasks") || "[]");
    tasks.unshift(taskObj); // Add to beginning (newest first)
    localStorage.setItem("bantuin_tasks", JSON.stringify(tasks));

    // User-specific storage
    var userKey = "bantuin_user_tasks_" + clientEmail;
    var userTasks = JSON.parse(localStorage.getItem(userKey) || "[]");
    userTasks.unshift(taskObj);
    localStorage.setItem(userKey, JSON.stringify(userTasks));

    console.log("Task saved! Total tasks:", tasks.length);

    // 7. Success feedback
    showToast(
      "Tugas berhasil diposting dan akan tampil di halaman Cari Pekerjaan!"
    );

    // 8. Reset form
    renderTasks();
    taskForm.reset();
    taskForm.classList.add("hidden");
  } catch (err) {
    showToast("Gagal menyimpan tugas", "error");
    console.error("Save task error:", err);
  }
});
```

---

### C. Load Tasks di cari-pekerjaan.html

```javascript
// Function to load tasks from localStorage
function loadTasksFromStorage() {
  try {
    const storedTasks = localStorage.getItem("bantuin_tasks");
    console.log("Raw localStorage data:", storedTasks);

    if (!storedTasks) {
      console.log("No tasks found in localStorage");
      return [];
    }

    const tasks = JSON.parse(storedTasks);
    console.log("Parsed tasks:", tasks);

    // Convert tasks to job format
    return tasks.map((task) => {
      // Calculate time difference
      const now = new Date();
      const uploadDate = new Date(task.uploadDate || task.createdAt);
      const diffMs = now - uploadDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      let timeText = "Baru saja";
      if (diffMins < 60) {
        timeText = diffMins <= 1 ? "Baru saja" : diffMins + " menit yang lalu";
      } else if (diffHours < 24) {
        timeText = diffHours + " jam yang lalu";
      } else {
        timeText = diffDays + " hari yang lalu";
      }

      // Get client info
      let clientName = task.owner || "Anonymous Client";
      let clientEmail = task.ownerEmail || "client@example.com";
      let clientLocation = task.location || "Indonesia";

      return {
        id: task.id,
        title: task.title,
        type: task.type || "Fixed-price",
        level: task.level || "Intermediate",
        budget: task.budget || "Negosiasi",
        time: timeText,
        isNew: diffHours < 24,
        desc: task.description || task.desc || "Deskripsi tidak tersedia",
        tags: task.tags || [task.category, task.level, task.type],
        client: {
          name: clientName,
          email: clientEmail,
          verified: task.clientVerified || false,
          stars: task.clientRating || 0,
          spent: task.clientSpent || "Rp 0",
          location: clientLocation,
        },
        category: task.category || "tekno",
        deadline: task.deadline,
        fileName: task.fileName,
        status: task.status || "open",
      };
    });
  } catch (err) {
    console.error("Error loading tasks from localStorage:", err);
    return [];
  }
}

// Load tasks on page load
const localTasks = loadTasksFromStorage();
console.log("Loaded tasks from localStorage:", localTasks.length);

// Combine with dummy data (localStorage tasks first)
const jobsData = [...localTasks, ...dummyJobsData];
console.log("Total jobs to display:", jobsData.length);

// Render jobs
document.addEventListener("DOMContentLoaded", () => {
  renderJobs(jobsData);

  // Listen for storage changes
  window.addEventListener("storage", (e) => {
    if (e.key === "bantuin_tasks") {
      console.log("Tasks updated in localStorage, reloading...");
      const updatedTasks = loadTasksFromStorage();
      const updatedJobsData = [...updatedTasks, ...dummyJobsData];
      renderJobs(updatedJobsData);
    }
  });
});
```

---

## 🎨 Rendering di Cari Pekerjaan

### Job Card Structure

```html
<div class="job-card reveal" data-category="tekno">
  <!-- Header -->
  <div class="job-header">
    <h3 class="job-title">Desain Landing Page E-commerce</h3>
    <div class="job-meta">
      <span class="badge badge-primary">Fixed-price</span>
      <span class="badge badge-level">Intermediate</span>
    </div>
  </div>

  <!-- Budget & Time -->
  <div class="job-info">
    <div class="job-budget"><i class="fas fa-wallet"></i> Rp 500.000</div>
    <div class="job-time">
      <i class="fas fa-clock"></i> 5 menit yang lalu
      <span class="new-badge">BARU</span>
    </div>
  </div>

  <!-- Description -->
  <div class="job-desc">
    Butuh desain landing page modern untuk toko online fashion...
  </div>

  <!-- Tags -->
  <div class="tag-container">
    <span class="tag-pill">kreatif</span>
    <span class="tag-pill">Intermediate</span>
    <span class="tag-pill">Fixed-price</span>
  </div>

  <!-- Footer (Client Info) -->
  <div class="card-footer">
    <span><i class="fas fa-user"></i> John Doe</span>
    <span><i class="fas fa-star"></i> 0</span>
    <span><strong>Rp 0 spent</strong></span>
    <span><i class="fas fa-map-marker-alt"></i> Jakarta, ID</span>
  </div>
</div>
```

---

## 🔍 Filter & Search Logic

### Filter by Category

```javascript
const checkedCategories = Array.from(
  document.querySelectorAll(
    'input[value="tekno"]:checked, ' +
      'input[value="kreatif"]:checked, ' +
      'input[value="writing"]:checked, ' +
      'input[value="admin"]:checked, ' +
      'input[value="fisik"]:checked'
  )
).map((cb) => cb.value);

const filtered = jobsData.filter((job) => {
  const matchCategory =
    checkedCategories.length === 0 || checkedCategories.includes(job.category);
  return matchCategory;
});
```

### Search by Text

```javascript
const searchTerm = document.getElementById("searchInput").value.toLowerCase();

const filtered = jobsData.filter((job) => {
  const matchSearch =
    job.title.toLowerCase().includes(searchTerm) ||
    job.desc.toLowerCase().includes(searchTerm);
  return matchSearch;
});
```

### Combined Filter

```javascript
function filterJobs() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const checkedCategories = Array.from(
    document.querySelectorAll('input[type="checkbox"]:checked')
  ).map((cb) => cb.value);

  const filtered = jobsData.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(searchTerm) ||
      job.desc.toLowerCase().includes(searchTerm);
    const matchCategory =
      checkedCategories.length === 0 ||
      checkedCategories.includes(job.category);
    return matchSearch && matchCategory;
  });

  renderJobs(filtered);
}
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────┐
│  Client Login   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Profile Page   │
│  (profile.html) │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Fill Task Form          │
│ - Title                 │
│ - Description           │
│ - Budget                │
│ - Type, Level, Category │
│ - Location, Deadline    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Submit Form             │
│ (profile.js handler)    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Create Task Object      │
│ {id, title, desc, ...}  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Save to localStorage            │
│ - bantuin_tasks (global)        │
│ - bantuin_user_tasks_{email}    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Success Toast           │
│ "Tugas berhasil..."     │
└─────────────────────────┘

         │
         ▼
┌─────────────────────────┐
│ User opens              │
│ cari-pekerjaan.html     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ loadTasksFromStorage()      │
│ Read: bantuin_tasks         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Convert to Job Format       │
│ - Calculate time ago        │
│ - Format client info        │
│ - Generate tags             │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Merge with Dummy Data       │
│ jobsData = [                │
│   ...localTasks,            │
│   ...dummyJobsData          │
│ ]                           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ renderJobs(jobsData)        │
│ Display all job cards       │
└─────────────────────────────┘
```

---

## 🧪 Testing Guide

### Test Scenario 1: Create Task

1. Login sebagai Client
2. Buka profile.html
3. Scroll ke "Posting Pekerjaan"
4. Klik "Tambah Tugas Baru"
5. Fill form:
   - Title: "Desain Logo Perusahaan"
   - Desc: "Butuh desain logo modern untuk startup teknologi"
   - Budget: "Rp 1.000.000"
   - Type: "Fixed-price"
   - Level: "Expert"
   - Category: "kreatif"
   - Location: "Jakarta, ID"
6. Submit
7. **Expected:** Toast "Tugas berhasil diposting..."

### Test Scenario 2: Verify Storage

1. Setelah create task
2. Buka Console (F12)
3. Check localStorage:

```javascript
console.log(localStorage.getItem("bantuin_tasks"));
// Should show array with task object
```

### Test Scenario 3: View in Cari Pekerjaan

1. Buka cari-pekerjaan.html
2. Buka Console
3. Should see logs:
   - "Loading tasks from localStorage..."
   - "Parsed tasks: [...]"
   - "Total jobs to display: X"
4. **Expected:** Task card tampil paling atas dengan badge "BARU"

### Test Scenario 4: Filter by Category

1. Di cari-pekerjaan.html
2. Check checkbox "Kreatif & Desain"
3. **Expected:** Only tasks dengan category "kreatif" tampil

### Test Scenario 5: Search

1. Di search box, ketik "logo"
2. **Expected:** Only tasks dengan title/desc containing "logo" tampil

### Test Scenario 6: Delete Task

1. Di profile.html
2. Di list tasks, klik icon trash
3. Confirm delete
4. **Expected:**
   - Toast "Tugas berhasil dihapus"
   - Task hilang dari list
   - Task juga hilang dari cari-pekerjaan.html setelah refresh

---

## 📈 Optimizations & Features

### Array Methods Used

#### 1. **Array.unshift()** - Add to Beginning

```javascript
tasks.unshift(taskObj); // Add newest task to beginning
localStorage.setItem("bantuin_tasks", JSON.stringify(tasks));
```

**Why:** Newest tasks should appear first

#### 2. **Array.map()** - Transform Data

```javascript
return tasks.map(task => {
  // Transform task object to job format
  return {
    id: task.id,
    title: task.title,
    ...
  };
});
```

**Why:** Convert storage format to display format

#### 3. **Array.filter()** - Search & Filter

```javascript
const filtered = jobsData.filter((job) => {
  const matchSearch = job.title.toLowerCase().includes(searchTerm);
  const matchCategory = checkedCategories.includes(job.category);
  return matchSearch && matchCategory;
});
```

**Why:** Filter jobs based on user criteria

#### 4. **Spread Operator (...)** - Merge Arrays

```javascript
const jobsData = [...localTasks, ...dummyJobsData];
```

**Why:** Combine localStorage tasks with dummy data

---

### Loop Implementation

#### 1. **forEach Loop** - Rendering

```javascript
jobsData.forEach((job) => {
  const card = document.createElement("div");
  card.className = "job-card reveal";
  card.innerHTML = `<h3>${job.title}</h3>...`;
  jobListContainer.appendChild(card);
});
```

#### 2. **for...of Loop** - Iteration

```javascript
for (const task of tasks) {
  console.log("Processing task:", task.title);
  renderTaskCard(task);
}
```

#### 3. **Nested Loops** - Tags Rendering

```javascript
tasks.forEach((task) => {
  task.tags.forEach((tag) => {
    console.log(`Task: ${task.title}, Tag: ${tag}`);
  });
});
```

---

### Object-Oriented Programming (OOP) Concepts

#### 1. **Object Creation**

```javascript
// Object literal
const taskObj = {
  id: Date.now(),
  title: title,
  description: desc,
  // ... properties
};

// Constructor function (alternative)
function Task(title, desc, budget) {
  this.id = Date.now();
  this.title = title;
  this.description = desc;
  this.budget = budget;
  this.createdAt = new Date().toISOString();
  this.status = "open";
}

const newTask = new Task("Logo Design", "Modern logo", "Rp 1jt");
```

#### 2. **Encapsulation**

```javascript
// Private data using closures
const TaskManager = (function () {
  let tasks = []; // Private variable

  return {
    // Public methods
    addTask: function (taskObj) {
      tasks.unshift(taskObj);
      this.saveToStorage();
    },

    getTasks: function () {
      return [...tasks]; // Return copy
    },

    saveToStorage: function () {
      localStorage.setItem("bantuin_tasks", JSON.stringify(tasks));
    },

    loadFromStorage: function () {
      tasks = JSON.parse(localStorage.getItem("bantuin_tasks") || "[]");
    },
  };
})();

// Usage
TaskManager.addTask(taskObj);
const allTasks = TaskManager.getTasks();
```

#### 3. **Inheritance (ES6 Classes)**

```javascript
// Base class
class Job {
  constructor(title, description) {
    this.id = Date.now();
    this.title = title;
    this.description = description;
    this.createdAt = new Date().toISOString();
  }

  getAge() {
    const now = new Date();
    const created = new Date(this.createdAt);
    return Math.floor((now - created) / 3600000); // hours
  }
}

// Derived class
class Task extends Job {
  constructor(title, description, budget, type) {
    super(title, description); // Call parent constructor
    this.budget = budget;
    this.type = type;
    this.status = "open";
  }

  markComplete() {
    this.status = "completed";
  }

  // Override parent method
  getAge() {
    const hours = super.getAge();
    return hours < 24
      ? `${hours} jam yang lalu`
      : `${Math.floor(hours / 24)} hari yang lalu`;
  }
}

// Usage
const task = new Task("Logo Design", "Modern logo", "Rp 1jt", "Fixed-price");
console.log(task.getAge()); // "5 jam yang lalu"
task.markComplete();
```

#### 4. **Polymorphism**

```javascript
class JobRenderer {
  render(job) {
    console.log("Rendering job:", job.title);
  }
}

class CardRenderer extends JobRenderer {
  render(job) {
    return `<div class="job-card">${job.title}</div>`;
  }
}

class ListRenderer extends JobRenderer {
  render(job) {
    return `<li>${job.title} - ${job.budget}</li>`;
  }
}

// Usage
const jobs = [task1, task2, task3];
const cardRenderer = new CardRenderer();
const listRenderer = new ListRenderer();

jobs.forEach((job) => {
  // Same method call, different output
  const cardHtml = cardRenderer.render(job);
  const listHtml = listRenderer.render(job);
});
```

---

## 🚀 Future Enhancements

### 1. Advanced Filtering

- Filter by budget range
- Filter by deadline
- Filter by client rating
- Sort by: Newest, Budget (high/low), Deadline

### 2. Task Status Management

```javascript
const TaskStatus = {
  OPEN: "open",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

function updateTaskStatus(taskId, newStatus) {
  const tasks = JSON.parse(localStorage.getItem("bantuin_tasks") || "[]");
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.status = newStatus;
    task.updatedAt = new Date().toISOString();
    localStorage.setItem("bantuin_tasks", JSON.stringify(tasks));
  }
}
```

### 3. Application System

```javascript
// Talent apply for job
function applyForJob(taskId, talentEmail) {
  const applications = JSON.parse(
    localStorage.getItem("bantuin_applications") || "[]"
  );

  const application = {
    id: Date.now(),
    taskId: taskId,
    talentEmail: talentEmail,
    appliedAt: new Date().toISOString(),
    status: "pending",
    proposal: "I would like to work on this project...",
  };

  applications.push(application);
  localStorage.setItem("bantuin_applications", JSON.stringify(applications));
}
```

### 4. Real-time Updates

```javascript
// Listen for localStorage changes across tabs
window.addEventListener("storage", (e) => {
  if (e.key === "bantuin_tasks") {
    console.log("Tasks updated in another tab!");
    reloadTasks();
  }
});
```

### 5. Data Validation with Classes

```javascript
class TaskValidator {
  static validate(taskData) {
    const errors = [];

    if (!taskData.title || taskData.title.length < 5) {
      errors.push("Title must be at least 5 characters");
    }

    if (!taskData.description || taskData.description.length < 20) {
      errors.push("Description must be at least 20 characters");
    }

    if (taskData.budget && !this.isValidBudget(taskData.budget)) {
      errors.push("Invalid budget format");
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  static isValidBudget(budget) {
    return /^Rp\s*\d+/.test(budget);
  }
}

// Usage
const validation = TaskValidator.validate(taskObj);
if (!validation.isValid) {
  console.error("Validation errors:", validation.errors);
}
```

---

## 📚 Summary

### Key Features Implemented:

✅ Client dapat membuat tugas di profile page
✅ Form lengkap dengan validasi
✅ Multi-storage strategy (global + user-specific)
✅ Tasks otomatis tampil di cari-pekerjaan.html
✅ Real-time time calculation (X menit/jam/hari yang lalu)
✅ Filter by category
✅ Search by text
✅ Delete task functionality
✅ Responsive design

### Technologies & Concepts Used:

- **Storage:** localStorage API
- **Arrays:** map(), filter(), unshift(), spread operator
- **Loops:** forEach, for...of
- **OOP:** Objects, classes, encapsulation, inheritance
- **DOM:** querySelector, createElement, event listeners
- **Date:** Date object, timestamp calculations
- **JSON:** parse(), stringify()

### Files Modified:

1. `profile.html` - Added task form fields
2. `profile.js` - Enhanced task submission handler
3. `cari-pekerjaan.html` - Dynamic task loading & rendering

---

**Version:** 1.0
**Last Updated:** December 1, 2025
