// Auth system connected to backend API
// API Base URL
(function () {
  var API_BASE = "http://localhost:3000/api";

  // Helper function for API calls
  function apiCall(endpoint, options) {
    var token = getToken();
    var headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }

    var config = {
      method: options.method || "GET",
      headers: headers,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    return fetch(API_BASE + endpoint, config)
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) {
            throw new Error(data.message || "API Error");
          }
          return data;
        });
      })
      .catch(function (error) {
        // Handle network errors
        if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")
        ) {
          throw new Error(
            "Backend server tidak terhubung. Pastikan server running di http://localhost:3000"
          );
        }
        throw error;
      });
  }

  // Token management
  function setToken(token) {
    localStorage.setItem("bantuin_token", token);
  }
  function getToken() {
    return localStorage.getItem("bantuin_token");
  }
  function removeToken() {
    localStorage.removeItem("bantuin_token");
  }

  // User session management
  function setCurrentUser(email) {
    localStorage.setItem("rpl_currentUser", email);
  }
  function getCurrentUser() {
    return localStorage.getItem("rpl_currentUser");
  }
  function setCurrentRole(role) {
    if (role) localStorage.setItem("rpl_currentRole", role);
  }
  function getCurrentRole() {
    return localStorage.getItem("rpl_currentRole");
  }

  // Register user via API
  function registerUser(email, password, options) {
    if (!email || !password) {
      return Promise.reject({
        success: false,
        message: "Email dan password diperlukan.",
      });
    }

    var opts = options || {};
    var body = {
      name: opts.name || "",
      email: email,
      password: password,
      role: opts.role || "client",
      company: opts.company || "",
      phone: opts.phone || "",
    };

    return apiCall("/auth/register", { method: "POST", body: body })
      .then(function (response) {
        if (response.success && response.data) {
          setToken(response.data.token);
          setCurrentUser(email);
          setCurrentRole(response.data.user.role);

          // Create session object
          var session = {
            user: response.data.user.name || email,
            email: email,
            role: response.data.user.role,
            ts: Date.now(),
          };
          localStorage.setItem("bantuin_session", JSON.stringify(session));

          return { success: true, data: response.data };
        }
        return response;
      })
      .catch(function (error) {
        return { success: false, message: error.message };
      });
  }

  // Login user via API
  function loginUser(email, password) {
    if (!email || !password) {
      return Promise.reject({
        success: false,
        message: "Email dan password diperlukan.",
      });
    }

    return apiCall("/auth/login", {
      method: "POST",
      body: { email: email, password: password },
    })
      .then(function (response) {
        if (response.success && response.data) {
          setToken(response.data.token);
          setCurrentUser(email);
          setCurrentRole(response.data.user.role);

          // Create session object
          var session = {
            user: response.data.user.name || email,
            email: email,
            role: response.data.user.role,
            ts: Date.now(),
          };
          localStorage.setItem("bantuin_session", JSON.stringify(session));

          return { success: true, data: response.data };
        }
        return response;
      })
      .catch(function (error) {
        return { success: false, message: error.message };
      });
  }

  // Get profile from API
  function getProfile() {
    var token = getToken();
    if (!token) {
      return Promise.resolve(null);
    }

    return apiCall("/auth/profile", { method: "GET" })
      .then(function (response) {
        if (response.success && response.data) {
          return response.data;
        }
        return null;
      })
      .catch(function () {
        return null;
      });
  }

  // Update profile via API
  function saveProfile(profile) {
    return apiCall("/auth/profile", { method: "PUT", body: profile })
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        return { success: false, message: error.message };
      });
  }

  // Logout
  function logout() {
    removeToken();
    localStorage.removeItem("rpl_currentUser");
    localStorage.removeItem("rpl_currentRole");
    localStorage.removeItem("bantuin_session");
  }

  // Backward compatibility - these now interact with API
  function addJob(job) {
    // Jobs will be created via API endpoints
    return Promise.resolve(false); // Deprecated - use job API directly
  }

  function addTalent(talent) {
    // Talents will be created via API endpoints
    return Promise.resolve(false); // Deprecated - use talent API directly
  }

  // For backward compatibility with old code
  function getUsers() {
    return {}; // No longer used
  }

  // expose
  window.RPLAuth = {
    getUsers: getUsers, // Legacy
    registerUser: registerUser, // Returns Promise
    loginUser: loginUser, // Returns Promise
    getCurrentUser: getCurrentUser,
    logout: logout,
    getProfile: getProfile, // Returns Promise
    saveProfile: saveProfile, // Returns Promise
    addJob: addJob, // Deprecated
    addTalent: addTalent, // Deprecated
    getToken: getToken,
    apiCall: apiCall, // Expose for other modules
  };
})();
