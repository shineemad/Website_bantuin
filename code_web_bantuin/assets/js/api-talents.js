// Talents API Module
(function () {
  var API_BASE = "http://localhost:3000/api";

  function getToken() {
    return localStorage.getItem("bantuin_token");
  }

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

    return fetch(API_BASE + endpoint, config).then(function (response) {
      return response.json().then(function (data) {
        if (!response.ok) {
          throw new Error(data.message || "API Error");
        }
        return data;
      });
    });
  }

  // Get all talents with optional filters
  function getAllTalents(filters) {
    var query = "";
    if (filters) {
      var params = [];
      if (filters.search)
        params.push("search=" + encodeURIComponent(filters.search));
      if (filters.skills)
        params.push("skills=" + encodeURIComponent(filters.skills));
      if (filters.location)
        params.push("location=" + encodeURIComponent(filters.location));
      if (params.length > 0) {
        query = "?" + params.join("&");
      }
    }

    return apiCall("/talents" + query, { method: "GET" }).then(function (
      response
    ) {
      if (response.success) {
        return response.data || [];
      }
      return [];
    });
  }

  // Get single talent by ID
  function getTalentById(talentId) {
    return apiCall("/talents/" + talentId, { method: "GET" }).then(function (
      response
    ) {
      if (response.success) {
        return response.data;
      }
      return null;
    });
  }

  // Create new talent profile (requires auth)
  function createTalent(talentData) {
    return apiCall("/talents", { method: "POST", body: talentData }).then(
      function (response) {
        return response;
      }
    );
  }

  // Update talent profile (requires auth)
  function updateTalent(talentId, talentData) {
    return apiCall("/talents/" + talentId, {
      method: "PUT",
      body: talentData,
    }).then(function (response) {
      return response;
    });
  }

  // Delete talent profile (requires auth)
  function deleteTalent(talentId) {
    return apiCall("/talents/" + talentId, { method: "DELETE" }).then(function (
      response
    ) {
      return response;
    });
  }

  // Save/unsave talent (requires auth)
  function toggleSaveTalent(talentId) {
    return apiCall("/talents/" + talentId + "/save", { method: "POST" }).then(
      function (response) {
        return response;
      }
    );
  }

  // Get saved talents (requires auth)
  function getSavedTalents() {
    return apiCall("/talents/saved", { method: "GET" }).then(function (
      response
    ) {
      if (response.success) {
        return response.data || [];
      }
      return [];
    });
  }

  // Expose API
  window.TalentsAPI = {
    getAllTalents: getAllTalents,
    getTalentById: getTalentById,
    createTalent: createTalent,
    updateTalent: updateTalent,
    deleteTalent: deleteTalent,
    toggleSaveTalent: toggleSaveTalent,
    getSavedTalents: getSavedTalents,
  };
})();
