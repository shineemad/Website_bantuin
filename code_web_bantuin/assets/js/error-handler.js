// Global error handler for localStorage and general errors
(function () {
  "use strict";

  // Error logger
  function logError(context, error) {
    try {
      var errorLog = JSON.parse(
        localStorage.getItem("bantuin_error_log") || "[]"
      );
      errorLog.push({
        context: context,
        error: error.message || String(error),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
      // Keep only last 50 errors
      if (errorLog.length > 50) errorLog = errorLog.slice(-50);
      localStorage.setItem("bantuin_error_log", JSON.stringify(errorLog));
    } catch (e) {
      console.error("Failed to log error:", e);
    }
  }

  // Safe localStorage operations
  window.SafeStorage = {
    getItem: function (key, defaultValue) {
      try {
        var value = localStorage.getItem(key);
        return value !== null ? value : defaultValue;
      } catch (e) {
        logError("SafeStorage.getItem(" + key + ")", e);
        console.warn("localStorage.getItem failed:", e);
        return defaultValue;
      }
    },

    setItem: function (key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (e) {
        logError("SafeStorage.setItem(" + key + ")", e);
        // localStorage full or disabled
        if (e.name === "QuotaExceededError") {
          alert(
            "Penyimpanan penuh! Mohon hapus data lama atau gunakan mode private browsing."
          );
          // Try to clear old data
          try {
            var errorLog = localStorage.getItem("bantuin_error_log");
            if (errorLog) localStorage.removeItem("bantuin_error_log");
            localStorage.setItem(key, value);
            return true;
          } catch (e2) {
            console.error("Failed to recover from QuotaExceededError:", e2);
          }
        } else {
          alert(
            "Gagal menyimpan data. Pastikan browser tidak dalam mode private atau localStorage tidak diblokir."
          );
        }
        return false;
      }
    },

    removeItem: function (key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        logError("SafeStorage.removeItem(" + key + ")", e);
        console.warn("localStorage.removeItem failed:", e);
        return false;
      }
    },

    getJSON: function (key, defaultValue) {
      try {
        var value = this.getItem(key);
        return value ? JSON.parse(value) : defaultValue || null;
      } catch (e) {
        logError("SafeStorage.getJSON(" + key + ")", e);
        console.warn("JSON parse failed for key:", key, e);
        return defaultValue || null;
      }
    },

    setJSON: function (key, obj) {
      try {
        var json = JSON.stringify(obj);
        return this.setItem(key, json);
      } catch (e) {
        logError("SafeStorage.setJSON(" + key + ")", e);
        console.warn("JSON stringify or setItem failed:", e);
        return false;
      }
    },
  };

  // Global error handler
  window.addEventListener("error", function (event) {
    logError("Global error", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Unhandled promise rejection
  window.addEventListener("unhandledrejection", function (event) {
    logError("Unhandled promise rejection", event.reason);
  });

  // Network status monitoring
  window.addEventListener("online", function () {
    console.log("Network: Online");
  });

  window.addEventListener("offline", function () {
    console.warn("Network: Offline - Some features may not work");
    alert("Koneksi internet terputus. Beberapa fitur mungkin tidak berfungsi.");
  });

  // Expose error log viewer
  window.viewErrorLog = function () {
    try {
      var log = SafeStorage.getJSON("bantuin_error_log", []);
      console.table(log);
      return log;
    } catch (e) {
      console.error("Failed to view error log:", e);
      return [];
    }
  };

  console.log(
    "Error handler initialized. Use viewErrorLog() to see error history."
  );
})();
