// Clean profile script: role-based posting, local fallback, and global store integration
(function () {
  "use strict";

  function qs(id) {
    return document.getElementById(id);
  }
  function get(id) {
    return document.getElementById(id) || null;
  }

  function safeAddListener(id, event, fn) {
    var el = get(id);
    if (!el || typeof fn !== "function") return;
    el.addEventListener(event, fn);
  }

  function showToast(msg, type) {
    try {
      var t = document.createElement("div");
      t.className = "pi-toast";
      t.textContent = msg;
      if (type === "error") t.style.background = "#ef4444";
      document.body.appendChild(t);
      requestAnimationFrame(function () {
        t.style.opacity = "1";
        t.style.transform = "translateY(0)";
      });
      setTimeout(function () {
        t.style.opacity = "0";
        t.style.transform = "translateY(-8px)";
        setTimeout(function () {
          t.remove();
        }, 300);
      }, 3000);
    } catch (e) {
      try {
        alert(msg);
      } catch (ee) {}
    }
  }

  function setAvatarElement(el, p) {
    if (!el) return;
    el.textContent = "";
    if (p && p.avatar) {
      var img = document.createElement("img");
      img.src = p.avatar;
      el.appendChild(img);
    } else {
      var initials =
        p && p.name
          ? p.name
              .split(/\s+/)
              .map(function (s) {
                return s[0];
              })
              .slice(0, 2)
              .join("")
          : "U";
      el.textContent = initials.toUpperCase();
    }
  }

  function renderProfile(p) {
    if (!p) {
      if (qs("profileBlock"))
        qs("profileBlock").textContent =
          "Tidak ada profil yang ditemukan. Silakan masuk.";
      if (qs("nameVal")) qs("nameVal").textContent = "-";
      if (qs("emailVal")) qs("emailVal").textContent = "-";
      if (qs("roleVal")) qs("roleVal").textContent = "-";
      if (qs("roleBadgeContainer")) qs("roleBadgeContainer").innerHTML = "";
      if (qs("jobsList")) qs("jobsList").innerHTML = "";
      if (qs("talentsList")) qs("talentsList").innerHTML = "";
      if (qs("jobsCount")) qs("jobsCount").textContent = "0";
      if (qs("talentsCount")) qs("talentsCount").textContent = "0";
      setAvatarElement(qs("avatarRoot"), null);
      return;
    }
    if (qs("profileBlock")) qs("profileBlock").textContent = "";
    if (qs("nameVal")) qs("nameVal").textContent = p.name || "(nama kosong)";
    if (qs("emailVal"))
      qs("emailVal").textContent = p.email || "(email kosong)";
    
    var currentRole = localStorage.getItem("rpl_currentRole") || p.role || "client";
    if (qs("roleVal"))
      qs("roleVal").textContent = currentRole;
    
    console.log("Profile loaded - Current role:", currentRole);
    
    // Display role badge - with retry mechanism
    function createRoleBadge() {
      var container = qs("roleBadgeContainer");
      if (!container) {
        console.warn("roleBadgeContainer not found, retrying...");
        setTimeout(createRoleBadge, 100);
        return;
      }
      
      var roleBadge = document.createElement("div");
      var roleIcon = "";
      var roleName = "";
      var badgeClass = "role-badge ";
      
      if (currentRole === "client") {
        roleIcon = '<i class="fas fa-briefcase"></i>';
        roleName = "Client";
        badgeClass += "role-badge-client";
      } else if (currentRole === "talent") {
        roleIcon = '<i class="fas fa-star"></i>';
        roleName = "Talent";
        badgeClass += "role-badge-talent";
      } else if (currentRole === "admin") {
        roleIcon = '<i class="fas fa-shield-alt"></i>';
        roleName = "Admin";
        badgeClass += "role-badge-admin";
      }
      
      roleBadge.className = badgeClass;
      roleBadge.innerHTML = roleIcon + "<span>" + roleName + "</span>";
      container.innerHTML = "";
      container.appendChild(roleBadge);
      
      console.log("✅ Role badge created:", roleName, "with class:", badgeClass);
    }
    
    createRoleBadge();
    setAvatarElement(qs("avatarRoot"), p);

    // role-based UI
    try {
      var roleStr = p && p.role ? String(p.role).toLowerCase() : "";
      var isTalent = roleStr.indexOf("talent") !== -1;
      if (get("addJobBtn"))
        get("addJobBtn").style.display = isTalent ? "none" : "inline-flex";
      if (get("toggleJobFormBtn"))
        get("toggleJobFormBtn").style.display = isTalent ? "none" : "inline-flex";
      if (get("jobForm")) get("jobForm").classList.toggle("hidden", isTalent);
      if (get("jobFormContainer"))
        get("jobFormContainer").style.display = "none"; // Always hide initially
      if (get("addTalentBtn"))
        get("addTalentBtn").style.display = isTalent ? "inline-flex" : "none";
      if (get("talentForm"))
        get("talentForm").classList.toggle("hidden", !isTalent);
      // Show upload task section for CLIENT (not talent)
      if (get("uploadTaskSection"))
        get("uploadTaskSection").style.display = isTalent ? "none" : "block";
      // Show add job talent section for TALENT (not client)
      if (get("addJobTalentSection"))
        get("addJobTalentSection").style.display = isTalent ? "block" : "none";
      if (get("jobFormContainerTalent"))
        get("jobFormContainerTalent").style.display = "none"; // Always hide initially
    } catch (e) {
      console.error("Error in role-based UI:", e);
    }
    }

    // render jobs
    var jl = qs("jobsList");
    if (jl) {
      jl.innerHTML = "";
      (p.jobs || []).forEach(function (j) {
        var div = document.createElement("div");
        div.className = "job-card fade";
        var left = document.createElement("div");
        left.innerHTML =
          "<strong>" +
          (j.title || "-") +
          '</strong><div class="job-meta">' +
          (j.company || "-") +
          "</div>";
        var right = document.createElement("div");
        var del = document.createElement("button");
        del.className = "btn btn-outline";
        del.textContent = "Hapus";
        del.addEventListener("click", function () {
          if (!confirm("Hapus pekerjaan ini?")) return;
          var idx = p.jobs.indexOf(j);
          if (idx !== -1) p.jobs.splice(idx, 1);
          if (
            window.RPLAuth &&
            typeof window.RPLAuth.saveProfile === "function"
          )
            window.RPLAuth.saveProfile(p);
          try {
            var gj = JSON.parse(localStorage.getItem("bantuin_jobs") || "[]");
            gj = gj.filter(function (x) {
              return !(
                x.title === j.title && (x.company || "") === (j.company || "")
              );
            });
            localStorage.setItem("bantuin_jobs", JSON.stringify(gj));
          } catch (err) {}
          renderProfile(p);
        });
        right.appendChild(del);
        div.appendChild(left);
        div.appendChild(right);
        jl.appendChild(div);
      });
      if ((p.jobs || []).length === 0) jl.textContent = "Belum ada pekerjaan.";
      if (qs("jobsCount")) qs("jobsCount").textContent = (p.jobs || []).length;
    }

    // render talents
    var tl = qs("talentsList");
    if (tl) {
      tl.innerHTML = "";
      (p.talents || []).forEach(function (t) {
        var div = document.createElement("div");
        div.className = "talent-card fade";
        var left = document.createElement("div");
        left.innerHTML =
          "<strong>" +
          (t.name || "-") +
          '</strong><div class="job-meta">' +
          (t.desc || "") +
          "</div>";
        var right = document.createElement("div");
        var del = document.createElement("button");
        del.className = "btn btn-outline";
        del.textContent = "Hapus";
        del.addEventListener("click", function () {
          if (!confirm("Hapus talent ini?")) return;
          var idx = p.talents.indexOf(t);
          if (idx !== -1) p.talents.splice(idx, 1);
          if (
            window.RPLAuth &&
            typeof window.RPLAuth.saveProfile === "function"
          )
            window.RPLAuth.saveProfile(p);
          try {
            var gt = JSON.parse(
              localStorage.getItem("bantuin_talents") || "[]"
            );
            gt = gt.filter(function (x) {
              return !(x.name === t.name && (x.desc || "") === (t.desc || ""));
            });
            localStorage.setItem("bantuin_talents", JSON.stringify(gt));
          } catch (err) {}
          renderProfile(p);
        });
        right.appendChild(del);
        div.appendChild(left);
        div.appendChild(right);
        tl.appendChild(div);
      });
      if ((p.talents || []).length === 0) tl.textContent = "Belum ada talent.";
      if (qs("talentsCount"))
        qs("talentsCount").textContent = (p.talents || []).length;
    }
  }

  function loadProfile() {
    var profile = null;
    if (window.RPLAuth && typeof window.RPLAuth.getProfile === "function") {
      profile = window.RPLAuth.getProfile();
    }
    
    // Fallback to bantuin_session
    if (!profile) {
      try {
        var session = JSON.parse(localStorage.getItem("bantuin_session") || "null");
        if (session && session.email) {
          var users = JSON.parse(localStorage.getItem("rpl_users") || "{}");
          if (users[session.email]) {
            profile = users[session.email];
          }
        }
      } catch (e) {}
    }
    
    // If still no profile, redirect to login
    if (!profile) {
      alert("Anda harus login terlebih dahulu.");
      location.href = "login.html";
      return null;
    }
    
    renderProfile(profile);
    return profile;
      try {
        profile = window.RPLAuth.getProfile();
      } catch (e) {
        profile = null;
      }
    }
    if (!profile) {
      try {
        var sess = JSON.parse(
          localStorage.getItem("bantuin_session") || "null"
        );
        if (sess) {
          profile = {
            name: sess.user || "guest",
            email: "",
            role:
              sess.role || localStorage.getItem("rpl_currentRole") || "client",
            jobs: sess.jobs || [],
            talents: sess.talents || [],
          };
        }
      } catch (e) {
        profile = null;
      }
    }
    return profile;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var profile = loadProfile();
    renderProfile(profile);

    // logout
    safeAddListener("logoutBtn", "click", function () {
      // Clear all session data
      localStorage.removeItem("bantuin_session");
      localStorage.removeItem("rpl_currentRole");
      localStorage.removeItem("rpl_profile");
      
      // Call RPLAuth logout if available
      if (window.RPLAuth && typeof window.RPLAuth.logout === "function") {
        window.RPLAuth.logout();
      }
      
      // Redirect to beranda
      showToast("Berhasil keluar dari akun");
      setTimeout(function() {
        window.location.href = "beranda.html";
      }, 500);
    });

    // avatar upload
    var avatarInput = get("avatarInput");
    if (avatarInput) {
      avatarInput.addEventListener("change", function (e) {
        var f = e.target.files && e.target.files[0];
        if (!f) return;
        var reader = new FileReader();
        reader.onload = function (ev) {
          var data = ev.target.result;
          if (!profile) profile = loadProfile() || { name: "", email: "" };
          profile.avatar = data;
          if (
            window.RPLAuth &&
            typeof window.RPLAuth.saveProfile === "function"
          )
            window.RPLAuth.saveProfile(profile);
          renderProfile(profile);
          showToast("Avatar tersimpan");
        };
        reader.readAsDataURL(f);
      });
    }

    // edit modal
    var editModal = get("editModal"),
      editBackdrop = get("editModalBackdrop"),
      editForm = get("editProfileForm"),
      editName = get("editName"),
      editRole = get("editRole"),
      cancelEdit = get("cancelEdit");
    function openEditModal(p) {
      var pr = p || loadProfile() || {};
      if (editName) editName.value = pr.name || "";
      if (editRole)
        editRole.value =
          pr.role || localStorage.getItem("rpl_currentRole") || "client";
      if (editModal) {
        editModal.classList.remove("hidden");
        editModal.setAttribute("aria-hidden", "false");
      }
      if (editName) editName.focus();
    }
    function closeEditModal() {
      if (editModal) {
        editModal.classList.add("hidden");
        editModal.setAttribute("aria-hidden", "true");
      }
    }
    safeAddListener("editProfileBtn", "click", function () {
      openEditModal(profile);
    });
    if (editBackdrop) editBackdrop.addEventListener("click", closeEditModal);
    if (cancelEdit)
      cancelEdit.addEventListener("click", function () {
        closeEditModal();
      });
    if (editForm) {
      editForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var nameVal = ((editName && editName.value) || "").trim();
        var roleVal = (editRole && editRole.value) || "client";
        if (!nameVal) {
          showToast("Nama tidak boleh kosong", "error");
          if (editName) editName.focus();
          return;
        }
        var p = profile || loadProfile() || {};
        p.name = nameVal;
        p.role = roleVal;
        if (window.RPLAuth && typeof window.RPLAuth.saveProfile === "function")
          window.RPLAuth.saveProfile(p);
        else {
          try {
            var sess =
              JSON.parse(localStorage.getItem("bantuin_session") || "null") ||
              {};
            sess.user = p.name;
            sess.role = p.role;
            localStorage.setItem("bantuin_session", JSON.stringify(sess));
            localStorage.setItem("rpl_currentRole", p.role);
            
            // Also update rpl_users if email exists
            if (p.email) {
              var users = JSON.parse(localStorage.getItem("rpl_users") || "{}");
              if (users[p.email]) {
                users[p.email].name = p.name;
                users[p.email].role = p.role;
                localStorage.setItem("rpl_users", JSON.stringify(users));
              }
            }
          } catch (err) {}
        }
        profile = loadProfile();
        renderProfile(profile);
        showToast("Perubahan tersimpan");
        closeEditModal();
      });
    }

    // job form
    var jobForm = get("jobForm"),
      addJobBtn = get("addJobBtn");
    if (addJobBtn && jobForm) {
      addJobBtn.addEventListener("click", function () {
        jobForm.classList.toggle("hidden");
      });
      var cancelJobEl = get("cancelJob");
      if (cancelJobEl)
        cancelJobEl.addEventListener("click", function () {
          jobForm.classList.add("hidden");
        });
      jobForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var title = ((qs("jobTitle") && qs("jobTitle").value) || "").trim();
        var company = (
          (qs("jobCompany") && qs("jobCompany").value) ||
          ""
        ).trim();
        
        // Validation
        if (!title) {
          showToast("Judul pekerjaan tidak boleh kosong", "error");
          if (qs("jobTitle")) qs("jobTitle").focus();
          return;
        }
        if (!company) {
          showToast("Nama perusahaan tidak boleh kosong", "error");
          if (qs("jobCompany")) qs("jobCompany").focus();
          return;
        }
        
        if (!profile) profile = loadProfile() || { jobs: [] };
        profile.jobs = profile.jobs || [];
        var jobObj = { title: title, company: company };
        var roleStr =
          profile && profile.role ? String(profile.role).toLowerCase() : "";
        if (roleStr.indexOf("talent") !== -1) {
          showToast(
            "Akses ditolak: akun talent tidak dapat memposting pekerjaan",
            "error"
          );
          return;
        }
        var usedRPL = false;
        try {
          if (
            window.RPLAuth &&
            typeof window.RPLAuth.addJob === "function" &&
            typeof window.RPLAuth.getProfile === "function" &&
            window.RPLAuth.getProfile()
          ) {
            var r = window.RPLAuth.addJob(jobObj);
            if (r === false) {
              console.warn("RPLAuth.addJob returned false");
            } else {
              usedRPL = true;
            }
          }
        } catch (err) {
          console.error("Error calling RPLAuth.addJob", err);
        }
        if (!usedRPL) {
          profile.jobs.unshift(jobObj);
          try {
            if (
              window.RPLAuth &&
              typeof window.RPLAuth.saveProfile === "function" &&
              profile &&
              profile.email
            )
              window.RPLAuth.saveProfile(profile);
            else {
              try {
                var sess =
                  JSON.parse(
                    localStorage.getItem("bantuin_session") || "null"
                  ) || {};
                sess.user = profile && profile.name ? profile.name : sess.user;
                sess.role = profile && profile.role ? profile.role : sess.role;
                localStorage.setItem("bantuin_session", JSON.stringify(sess));
              } catch (er) {}
            }
          } catch (err) {
            console.warn("Failed to saveProfile", err);
          }
        }
        try {
          var gj = JSON.parse(localStorage.getItem("bantuin_jobs") || "[]");
          gj.unshift(
            Object.assign(
              {
                id: Date.now(),
                poster: profile && profile.name ? profile.name : "Anon",
              },
              jobObj
            )
          );
          localStorage.setItem("bantuin_jobs", JSON.stringify(gj));
        } catch (err) {
          console.warn("persist job", err);
        }
        profile = loadProfile();
        renderProfile(profile);
        if (jobForm.reset) jobForm.reset();
        jobForm.classList.add("hidden");
      });
    }

    // talent form
    var talentForm = get("talentForm"),
      addTalentBtn = get("addTalentBtn");
    if (addTalentBtn && talentForm) {
      addTalentBtn.addEventListener("click", function () {
        talentForm.classList.toggle("hidden");
      });
      var cancelTalentEl = get("cancelTalent");
      if (cancelTalentEl)
        cancelTalentEl.addEventListener("click", function () {
          talentForm.classList.add("hidden");
        });
      talentForm.addEventListener("submit", function (e) {
        e.preventDefault();
        console.log("Talent form submitted!");
        
        var name = ((qs("talentName") && qs("talentName").value) || "").trim();
        var desc = ((qs("talentDesc") && qs("talentDesc").value) || "").trim();
        
        console.log("Form data:", { name: name, desc: desc });
        
        // Validation
        if (!name) {
          showToast("Nama talent/keahlian tidak boleh kosong", "error");
          if (qs("talentName")) qs("talentName").focus();
          return;
        }
        if (!desc) {
          showToast("Deskripsi tidak boleh kosong", "error");
          if (qs("talentDesc")) qs("talentDesc").focus();
          return;
        }
        
        if (!profile) profile = loadProfile() || { talents: [] };
        profile.talents = profile.talents || [];
        
        console.log("Current profile:", profile);
        
        // Enhanced talent object dengan data lengkap untuk cari_talent.html
        var tObj = { 
          name: name, 
          desc: desc,
          role: name, // role sebagai keahlian utama
          owner: profile.name || "Talent",
          email: profile.email || "",
          category: "it", // default category, bisa dikembangkan dengan dropdown
          level: "intermediate", // default level
          availability: "available", // default availability
          createdAt: new Date().toISOString()
        };
        
        console.log("Talent object created:", tObj);
        
        var r =
          profile && profile.role ? String(profile.role).toLowerCase() : "";
        if (r.indexOf("talent") === -1) {
          showToast(
            "Akses ditolak: hanya akun talent yang dapat menambah entry talent",
            "error"
          );
          return;
        }
        var usedRPLt = false;
        try {
          if (
            window.RPLAuth &&
            typeof window.RPLAuth.addTalent === "function" &&
            typeof window.RPLAuth.getProfile === "function" &&
            window.RPLAuth.getProfile()
          ) {
            var res = window.RPLAuth.addTalent(tObj);
            if (res === false) {
              console.warn("RPLAuth.addTalent returned false");
            } else {
              usedRPLt = true;
            }
          }
        } catch (err) {
          console.error("Error calling RPLAuth.addTalent", err);
        }
        if (!usedRPLt) {
          profile.talents.unshift(tObj);
          try {
            if (
              window.RPLAuth &&
              typeof window.RPLAuth.saveProfile === "function" &&
              profile &&
              profile.email
            )
              window.RPLAuth.saveProfile(profile);
          } catch (err) {
            console.warn("saveProfile talent", err);
          }
        }
        try {
          var gt = JSON.parse(localStorage.getItem("bantuin_talents") || "[]");
          console.log("Current bantuin_talents before add:", gt);
          
          gt.unshift(
            Object.assign(
              {
                id: Date.now(),
              },
              tObj
            )
          );
          localStorage.setItem("bantuin_talents", JSON.stringify(gt));
          console.log("Saved to bantuin_talents:", gt);
          
          // Simpan juga ke user-specific talents untuk tracking
          if (profile.email) {
            var userTalents = JSON.parse(localStorage.getItem("bantuin_user_talents_" + profile.email) || "[]");
            userTalents.unshift(tObj);
            localStorage.setItem("bantuin_user_talents_" + profile.email, JSON.stringify(userTalents));
            console.log("Saved to user-specific storage");
          }
        } catch (err) {
          console.error("persist talent error:", err);
        }
        
        showToast("Profil talent berhasil ditambahkan! Akan muncul di halaman Cari Talent.");
        console.log("Talent successfully added!");
        
        profile = loadProfile();
        renderProfile(profile);
        if (talentForm.reset) talentForm.reset();
        talentForm.classList.add("hidden");
      });
    }

    // Task form is now on separate page (tambah-pekerjaan.html)
    // No need for inline form event listeners

    function renderTasks() {
      var tasksList = get("tasksList");
      if (!tasksList) return;

      try {
        var tasks = JSON.parse(localStorage.getItem("bantuin_tasks") || "[]");
        
        // Filter tasks by current user if available
        var currentProfile = loadProfile();
        var userEmail = currentProfile && currentProfile.email ? currentProfile.email : null;
        
        // Show all tasks or filter by user
        var userTasks = userEmail 
          ? tasks.filter(function(t) { return t.ownerEmail === userEmail; })
          : tasks;
        
        if (userTasks.length === 0) {
          tasksList.innerHTML = '<div style="color: var(--text-sub); font-size: 0.95rem; text-align: center; padding: 20px;">' +
            '<i class="fas fa-briefcase" style="font-size: 2rem; opacity: 0.3; display: block; margin-bottom: 10px;"></i>' +
            'Belum ada tugas yang diposting.<br>' +
            '<small>Klik tombol "Tambah Tugas Baru" untuk memulai</small>' +
            '</div>';
          return;
        }

        tasksList.innerHTML = userTasks.map(function (task) {
          var deadlineText = task.deadline ? new Date(task.deadline).toLocaleDateString("id-ID") : "Tidak ada deadline";
          var statusColor = task.status === "open" ? "var(--accent-green)" : 
                           task.status === "in-progress" ? "#f59e0b" : 
                           task.status === "completed" ? "#3b82f6" : "var(--text-sub)";
          var statusIcon = task.status === "open" ? "fa-check-circle" :
                          task.status === "in-progress" ? "fa-spinner" :
                          task.status === "completed" ? "fa-check-double" : "fa-clock";
          
          // Calculate time ago
          var timeAgo = "Baru saja";
          if (task.createdAt) {
            var now = new Date();
            var created = new Date(task.createdAt);
            var diffMs = now - created;
            var diffMins = Math.floor(diffMs / 60000);
            var diffHours = Math.floor(diffMs / 3600000);
            var diffDays = Math.floor(diffMs / 86400000);
            
            if (diffMins < 60) {
              timeAgo = diffMins <= 1 ? "Baru saja" : diffMins + " menit yang lalu";
            } else if (diffHours < 24) {
              timeAgo = diffHours + " jam yang lalu";
            } else {
              timeAgo = diffDays + " hari yang lalu";
            }
          }
          
          return '<div class="job-card" style="margin-bottom: 12px; border-left: 4px solid ' + statusColor + ';">' +
            '<div style="flex: 1;">' +
              '<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">' +
                '<div>' +
                  '<div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 4px; color: var(--text-main);">' + task.title + '</div>' +
                  '<div style="font-size: 0.85rem; color: var(--text-sub);">' +
                    '<i class="fas fa-clock"></i> ' + timeAgo +
                    (task.budget ? ' | <i class="fas fa-wallet"></i> ' + task.budget : '') +
                  '</div>' +
                '</div>' +
                '<span style="padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; background: ' + statusColor + '; color: white; white-space: nowrap;">' +
                  '<i class="fas ' + statusIcon + '"></i> ' + (task.status || 'open') +
                '</span>' +
              '</div>' +
              '<div style="font-size: 0.95rem; color: var(--text-sub); margin-bottom: 10px; line-height: 1.5;">' + 
                (task.description || task.desc || 'Tidak ada deskripsi') + 
              '</div>' +
              '<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">' +
                (task.type ? '<span style="padding: 4px 10px; background: #e0e7ff; color: #4338ca; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">' + task.type + '</span>' : '') +
                (task.level ? '<span style="padding: 4px 10px; background: #fef3c7; color: #92400e; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">' + task.level + '</span>' : '') +
                (task.category ? '<span style="padding: 4px 10px; background: #d1fae5; color: #065f46; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">' + task.category + '</span>' : '') +
              '</div>' +
              '<div style="font-size: 0.85rem; color: var(--text-sub); display: flex; gap: 15px; flex-wrap: wrap;">' +
                '<span><i class="fas fa-calendar"></i> ' + deadlineText + '</span>' +
                (task.location ? '<span><i class="fas fa-map-marker-alt"></i> ' + task.location + '</span>' : '') +
                (task.fileName ? '<span><i class="fas fa-file"></i> ' + task.fileName + '</span>' : '') +
              '</div>' +
            '</div>' +
            '<div style="display: flex; flex-direction: column; gap: 8px; margin-left: 15px;">' +
              '<button onclick="deleteTask(' + task.id + ')" class="btn-icon" style="color: #ef4444;" title="Hapus tugas">' +
                '<i class="fas fa-trash"></i>' +
              '</button>' +
              '<button onclick="viewTaskDetail(' + task.id + ')" class="btn-icon" style="color: #3b82f6;" title="Lihat detail">' +
                '<i class="fas fa-eye"></i>' +
              '</button>' +
            '</div>' +
          '</div>';
        }).join("");
      } catch (err) {
        tasksList.innerHTML = '<div style="color: #ef4444; padding: 15px; text-align: center;">' +
          '<i class="fas fa-exclamation-triangle"></i> Error loading tasks<br>' +
          '<small style="color: var(--text-sub);">' + err.message + '</small>' +
          '</div>';
        console.error('Render tasks error:', err);
      }
    }

    window.deleteTask = function(taskId) {
      if (!confirm("Hapus tugas ini?")) return;
      try {
        var tasks = JSON.parse(localStorage.getItem("bantuin_tasks") || "[]");
        tasks = tasks.filter(function(t) { return t.id !== taskId; });
        localStorage.setItem("bantuin_tasks", JSON.stringify(tasks));
        
        // Also remove from user-specific storage
        var currentProfile = loadProfile();
        if (currentProfile && currentProfile.email) {
          var userKey = "bantuin_user_tasks_" + currentProfile.email;
          var userTasks = JSON.parse(localStorage.getItem(userKey) || "[]");
          userTasks = userTasks.filter(function(t) { return t.id !== taskId; });
          localStorage.setItem(userKey, JSON.stringify(userTasks));
        }
        
        showToast("Tugas berhasil dihapus");
        renderTasks();
      } catch (err) {
        showToast("Gagal menghapus tugas", "error");
      }
    };
    
    window.viewTaskDetail = function(taskId) {
      try {
        var tasks = JSON.parse(localStorage.getItem("bantuin_tasks") || "[]");
        var task = tasks.find(function(t) { return t.id === taskId; });
        
        if (!task) {
          alert("Task not found!");
          return;
        }
        
        var detail = "📋 DETAIL TUGAS\\n\\n" +
          "Judul: " + task.title + "\\n" +
          "Deskripsi: " + task.description + "\\n\\n" +
          "💰 Budget: " + (task.budget || "Negosiasi") + "\\n" +
          "📊 Type: " + (task.type || "-") + "\\n" +
          "⭐ Level: " + (task.level || "-") + "\\n" +
          "📁 Category: " + (task.category || "-") + "\\n" +
          "📍 Location: " + (task.location || "-") + "\\n" +
          "📅 Deadline: " + (task.deadline ? new Date(task.deadline).toLocaleDateString("id-ID") : "Tidak ada deadline") + "\\n\\n" +
          "👤 Posted by: " + (task.owner || "Anonymous") + "\\n" +
          "✉️ Email: " + (task.ownerEmail || "-") + "\\n" +
          "🕐 Created: " + (task.createdAt ? new Date(task.createdAt).toLocaleString("id-ID") : "-") + "\\n" +
          "🏷️ Status: " + (task.status || "open") + "\\n" +
          (task.fileName ? "📎 Attachment: " + task.fileName + "\\n" : "");
        
        alert(detail);
      } catch (err) {
        alert("Error loading task detail: " + err.message);
      }
    };

    // Initial render
    renderTasks();
  });
})();
