(function () {
  "use strict";

  function getProfile() {
    // prefer RPLAuth (primary auth system)
    try {
      if (window.RPLAuth && typeof window.RPLAuth.getProfile === "function") {
        var p = window.RPLAuth.getProfile();
        if (p) return p;
      }
    } catch (e) {}

    // fallback to bantuin_session with email lookup
    try {
      var s = JSON.parse(localStorage.getItem("bantuin_session") || "null");
      if (s && s.email) {
        // Get full profile from rpl_users
        var users = JSON.parse(localStorage.getItem("rpl_users") || "{}");
        if (users[s.email]) {
          return users[s.email];
        }
      }
      // Legacy fallback
      if (s) {
        return {
          name: s.user || s.fullname || "guest",
          email: s.email || "",
          role: s.role || localStorage.getItem("rpl_currentRole") || "client",
          jobs: [],
          talents: [],
        };
      }
    } catch (e) {}
    return null;
  }

  function initials(name) {
    if (!name) return "";
    var parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  function createProfileButton(profile) {
    var a = document.createElement("a");
    a.href = "profile.html";
    a.className = "profile-btn";
    a.title = profile.name || profile.email || "Profil";
    // avatar element
    var span = document.createElement("span");
    span.className = "profile-avatar";
    span.textContent = initials(profile.name || profile.email || "U");
    // inline styles to avoid depending on page CSS
    a.style.display = "inline-flex";
    a.style.alignItems = "center";
    a.style.justifyContent = "center";
    a.style.width = "40px";
    a.style.height = "40px";
    a.style.borderRadius = "999px";
    a.style.background = "#111";
    a.style.color = "#fff";
    a.style.fontWeight = "700";
    a.style.textDecoration = "none";
    a.style.fontSize = "0.95rem";
    a.style.boxShadow = "0 4px 8px rgba(0,0,0,0.08)";
    a.appendChild(span);
    return a;
  }

  function replaceLoginButtons(profile) {
    if (!profile) return;
    // find login anchors
    var nodes = Array.prototype.slice.call(
      document.querySelectorAll('a[href$="login.html"]')
    );
    nodes.forEach(function (node) {
      // ensure visible and likely a 'Masuk' button
      var txt = (node.textContent || "").trim().toLowerCase();
      if (txt.indexOf("masuk") === -1) return;
      var btn = createProfileButton(profile);
      node.parentNode.replaceChild(btn, node);
    });

    // hide daftar (sign up) buttons if present
    var daftar = Array.prototype.slice.call(
      document.querySelectorAll('a[href$="select.html"]')
    );
    daftar.forEach(function (d) {
      var txt = (d.textContent || "").trim().toLowerCase();
      if (txt.indexOf("daftar") !== -1 || txt.indexOf("register") !== -1) {
        d.style.display = "none";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    try {
      var p = getProfile();
      if (p) replaceLoginButtons(p);
    } catch (e) {
      // noop
    }
  });
})();
